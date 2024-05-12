import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../../Context/SocketProvider';
import "./GamePlay.css"
import GameUI from './GameUI';

function GamePlay() {

    const {roomID} = useParams();
    const socket = useSocket();
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const navigate = useNavigate();

    const [users, setUsers] = useState(null);
    const [ButtonCoordinates, setButtonCoordinates] = useState(null);
    const [play, setPlay] = useState(false)
    const [boardData, setBoardData] = useState([])

    const [MyTurn, setMyTurn] = useState(false);

    useEffect(()=>{
        socket.emit('join-room', {
            roomID : roomID,
            username : username,
            avatar : avatar
        })
    },[])

    useEffect(()=>{
        //this effect will listen for socket change
        socket.on('user-joined', data=>{
            //console.log(data)
            setUsers(data.users)
        })

        socket.on('room-full', ()=>{
           // alert('Room is full');
            navigate('/');
        })

        socket.on("user-left", data=>{
            console.log(data)
        })

        socket.on('start-game', ()=>{
            setPlay(true);
        })

        socket.on('player-action', data => {
            setBoardData(prevData => [...prevData, { coordinates: data.coordinates, symbol: data.user.Symbol }]);
        });

          socket.on('switch-turn', data=>{

            
            if(data.currentPlayer === socket.id){
                setMyTurn(true);
            }

            else{
                setMyTurn(false)
            }
          })

        // Cleanup socket listeners
        return () => {
            socket.off('user-joined');
            socket.off('room-full');
            socket.off('user-left');
            socket.off('start-game');
            socket.off('player-action');
            socket.off('switch-turn');
        };

    },[socket])

    useEffect(()=>{
        //get current username
        if(users)
        {
            const currentUser = users.find(ele => ele.socketID === socket.id)
            //emit event to server
            socket.emit('player-action', {
                user : currentUser,
                coordinates : ButtonCoordinates,
                roomID : roomID
            })
        }
        

    },[ButtonCoordinates])

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
            if(WinnerUser){
                alert(WinnerUser.username+ " is the Winner!")
            }
            // You can add more logic here, such as displaying a message or resetting the game.
        }
    }, [boardData]);



    const handleButtonClick = (row, col) => {
        console.log(MyTurn)
        //console.log(row,col)
        setButtonCoordinates({
            row : row,
            col : col
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
                        disabled = {!MyTurn}
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
                {users && (<>
                    {
                        users.map((item, index)=>{
                            //console.log(item)
                            return (<>
                                <div style={{
                                    display : 'flex',
                                    flexDirection : "row",
                                    justifyContent : 'space-between',
                                    alignItems : "center"
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
            <div className="game-board">
            {renderButtons()}
        </div>

        </div>
    </>
  )
}

export default GamePlay