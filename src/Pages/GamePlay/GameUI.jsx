import React, { useEffect } from 'react';

function GameUI(props) {

    const handleButtonClick = (row, col) => {
        //console.log(row,col)
        props.setButtonCoordinates({
            row : row,
            col : col
        })
       // console.log(props.boardData)
    }

    useEffect(()=>{
        console.log(props.boardData)
    },[props.boardData])


    const renderButtons = () => {
        const buttons = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const coordinates = { row: i, col: j };
                const isButtonActive = props.boardData && props.boardData.coordinates && props.boardData.coordinates.row === i && props.boardData.coordinates.col === j;
                const buttonSymbol = isButtonActive ? props.boardData.symbol : '';
                buttons.push(
                    <button
                        disabled={!props.play}
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
        <div className="game-board">
            {renderButtons()}
        </div>
    );
}

export default GameUI;
