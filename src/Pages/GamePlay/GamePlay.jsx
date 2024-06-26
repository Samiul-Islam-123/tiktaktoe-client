import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../../Context/SocketProvider';
import "./GamePlay.css"
import GameUI from './GameUI';

function GamePlay() {

    const { roomID } = useParams();
    const socket = useSocket();
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const navigate = useNavigate();

    const [users, setUsers] = useState(null);
    const [ButtonCoordinates, setButtonCoordinates] = useState(null);
    const [play, setPlay] = useState(false)
    const [boardData, setBoardData] = useState([])

    const [MyTurn, setMyTurn] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');


    useEffect(() => {

        if(username && avatar){   
            socket.emit('join-room', {
                roomID: roomID,
                username: username,
                avatar: avatar
            })
        }

        else{
            setSnackbarMessage('Please enter your name first'); 
            setTimeout(() => {
                setSnackbarMessage('');
                navigate('/')
            }, 1000);
        }

    }, [])

    useEffect(() => {
        //this effect will listen for socket change
        socket.on('user-joined', data => {
            //console.log(data)
            setUsers(data.users)
        })

        socket.on('room-full', () => {
            // alert('Room is full');
            navigate('/');
        })

        socket.on("user-left", data => {
            // Filter out the disconnected user from the users state
            setUsers(prevUsers => prevUsers.filter(user => user.socketID !== data.socketID));
        
            // Set MyTurn and Play to false if the disconnected user was the current player
            if (data.socketID === socket.id) {
                setMyTurn(false);
                setPlay(false);
            }
        
            // Display a snackbar message indicating the user has left the room
            setSnackbarMessage(data.username + " has left the Room :("); 
            setTimeout(() => {
                setSnackbarMessage('');
                navigate('/')
            }, 1500);
        })
        

        socket.on('start-game', () => {
            setPlay(true);
        })

        socket.on('player-action', data => {
            setBoardData(prevData => [...prevData, { coordinates: data.coordinates, symbol: data.user.Symbol }]);
        });

        socket.on('switch-turn', data => {


            if (data.currentPlayer === socket.id) {
                setMyTurn(true);
            }

            else {
                setMyTurn(false)
            }
        })

        socket.on('winner-found', (data) => {
            alert(data.username + " is the Winner")
            setPlay(false);
            navigate('/')
        })

        // Cleanup socket listeners
        return () => {
            socket.off('user-joined');
            socket.off('room-full');
            socket.off('user-left');
            socket.off('start-game');
            socket.off('player-action');
            socket.off('switch-turn');
            socket.off('winner-found');

        };

    }, [socket])

    useEffect(() => {
        //get current username
        if (users) {
            const currentUser = users.find(ele => ele.socketID === socket.id)
            //emit event to server
            socket.emit('player-action', {
                user: currentUser,
                coordinates: ButtonCoordinates,
                roomID: roomID
            })
        }


    }, [ButtonCoordinates])

    const checkWinner = () => {
        // Define winning combinations
        const winningCombos = [
            [[0, 0], [0, 1], [0, 2]], // Row 1
            [[1, 0], [1, 1], [1, 2]], // Row 2
            [[2, 0], [2, 1], [2, 2]], // Row 3
            [[0, 0], [1, 0], [2, 0]], // Column 1
            [[0, 1], [1, 1], [2, 1]], // Column 2
            [[0, 2], [1, 2], [2, 2]], // Column 3
            [[0, 0], [1, 1], [2, 2]], // Diagonal (top-left to bottom-right)
            [[0, 2], [1, 1], [2, 0]]  // Diagonal (top-right to bottom-left)
        ];

        // Iterate over each winning combination
        for (const combo of winningCombos) {
            const [a, b, c] = combo;
            const symbolA = boardData.find(data => data.coordinates.row === a[0] && data.coordinates.col === a[1])?.symbol;
            const symbolB = boardData.find(data => data.coordinates.row === b[0] && data.coordinates.col === b[1])?.symbol;
            const symbolC = boardData.find(data => data.coordinates.row === c[0] && data.coordinates.col === c[1])?.symbol;

            // Check if all symbols in the current combination are the same and not empty
            if (symbolA && symbolA === symbolB && symbolB === symbolC) {
                // We have a winner!
                return symbolA;
            }
        }

        // No winner found
        return null;
    };

    useEffect(() => {
        const winner = checkWinner();
        if (winner) {
            // Game over, declare the winner
            const WinnerUser = users.find(ele => ele.Symbol === winner)
            if (WinnerUser) {

                //alert(WinnerUser.username+ " is the Winner!")
                socket.emit('winner-found', {
                    roomID: roomID,
                    winner: WinnerUser
                });
            }
            // You can add more logic here, such as displaying a message or resetting the game.
        }
    }, [boardData]);



    const handleButtonClick = (row, col) => {
        //console.log(MyTurn)
        //console.log(row,col)
        setButtonCoordinates({
            row: row,
            col: col
        })
        //console.log(boardData)
    }

    const renderButtons = () => {
        const buttons = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const coordinates = { row: i, col: j };
                const buttonData = boardData.find(data => data.coordinates.row === i && data.coordinates.col === j);
                //console.log(buttonData)
                const buttonSymbol = buttonData ? buttonData.symbol : '';
                const buttondisabled = !play && !MyTurn  // Disable button if not playing, not player's turn, or button already clicked
                console.log(MyTurn)
                buttons.push(
                    <button
                    style={{
                        borderRadius : "5px"
                    }}
                        disabled={!MyTurn}
                        key={`${i}-${j}`}
                        className="square"
                        onClick={() => {
                            handleButtonClick(i, j)
                        }}>
                        {buttonSymbol}
                    </button>
                );
            }
        }
        return buttons;
    };



    return (
        <>
            <div className='container'>
                <div className='user-data-container'>

                    <div id="snackbar" className={`snackbar ${snackbarMessage && 'show'}`}>
                        {snackbarMessage}
                    </div>


                    <button className='button' style={{ marginBottom: "20px" }} onClick={() => {
                        navigator.clipboard.writeText(window.location.href).then(() => {
                            setSnackbarMessage("URL copied to clipboard");
                            setTimeout(() => {
                                setSnackbarMessage('');
                            }, 3000);
                        }).catch(error => {
                            setSnackbarMessage("Error occured :(");
                            setTimeout(() => {
                                setSnackbarMessage('');
                            }, 3000);
                            console.log(error);
                        })
                    }}>
                        Copy URL
                    </button>

                    <button className='button' style={{ marginBottom: "20px" }} onClick={() => {
                        navigator.clipboard.writeText(roomID).then(() => {
                            setSnackbarMessage("Room ID copied to clipboard");
                            setTimeout(() => {
                                setSnackbarMessage('');
                            }, 3000);
                        }).catch(error => {
                            setSnackbarMessage("Error occured :(");
                            setTimeout(() => {
                                setSnackbarMessage('');
                            }, 3000);
                            console.log(error);
                        })
                    }}>
                        Copy RoomID
                    </button>

                    {users && (<>
                        {
                            users.map((item, index) => {
                                //console.log(item)
                                return (<>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: "row",
                                        justifyContent: 'space-between',
                                        alignItems: "center",
                                        border: MyTurn && item.socketID === socket.id ? '0.5px solid white' : 'none',
                                        borderRadius: "10px",
                                        padding: "10px"
                                    }}>
                                        <img src={`${item.avatar}`} alt="Avatar" className="avatar" /> {/* Add the avatar image */}
                                        <h5>
                                            {item.username} ({item.Symbol})
                                        </h5>
                                    </div>

                                </>)
                            })
                        }
                    </>)}
                </div>
                {/**Game UI gets rendered here :) */}
                <div className="game-board" style={{
                    marginTop: "25px"
                }}>
                    {renderButtons()}
                </div>

            </div>
        </>
    )
}

export default GamePlay