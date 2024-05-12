import React, { useState } from 'react';
import "./LandingPage.css";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function LandingPage() {

    const [username, setUsername] = useState("")
    const navigate = useNavigate();
    const [displayUI, setDisplayUI] = useState(false);
    const [roomID, setRoomID] = useState("");

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    return (
        <>

            <img src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${username}`} alt="Avatar" className="avatar" /> {/* Add the avatar image */}
            <input value={username} onChange={(e) => {
                setUsername(e.target.value)
            }} className='input-field' type='text' placeholder='Enter your name' />
            <button className='button' onClick={(e) => {
                if (username != "") {
                    localStorage.setItem('username', username);
                    localStorage.setItem('avatar', `https://api.dicebear.com/8.x/adventurer/svg?seed=${username}`);

                    navigate('/game/' + uuidv4())
                }

                else {
                    alert("Please enter your name first")
                }
            }}>
                Create Room
            </button>
            {
                !displayUI && (<>
                    <button className='button' onClick={(e) => {
                        setDisplayUI(!displayUI)
                    }}>
                        Join Room
                    </button>
                </>)
            }

            {
                displayUI && (<>
                    <input onChange={(e) => {
                        setRoomID(e.target.value)
                    }} className='input-field' type='text' placeholder='Enter room ID' />

                    <button className='button' onClick={(e) => {
                        if (roomID === "") {
                            alert("Please enter room ID")
                        }

                        else {
                            localStorage.setItem('username', username);
                            localStorage.setItem('avatar', `https://api.dicebear.com/8.x/adventurer/svg?seed=${username}`);
                            navigate(`/game/${roomID}`)
                        }
                    }}>
                        Join Room
                    </button>

                </>)
            }

        </>
    );
}

export default LandingPage;
