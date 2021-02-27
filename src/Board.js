import React from 'react';
import io from 'socket.io-client';
import { Square } from './Square.js';
import { LogIn } from './LogIn.js';
import { useState, useRef, useEffect } from 'react';

const socket = io(); // Connects to socket connection
export default socket;

export function Board(){

  const [myBoard, setBoard] = useState(Array(9).fill(null));
  const [ isX, setTurn] = useState(true);
  const winner = calculateWinner(myBoard);
  
  function onClickSquare(index){
    const newBoard = myBoard.slice();
    if(myBoard[index]){ return; }
    newBoard[index] = isX ? 'X':'O'; //check whose turn it is
    setBoard(newBoard);
    setTurn(!isX);
    socket.emit('tic', { index: index, myBoard: myBoard, isX: isX });
  }
  
  function renderSquare(index){
    return <Square value={myBoard[index]} onClick={onClickSquare} index={index}/>
  }
  
  function getStatus(){
    if(winner){ return "Winner: " + winner;}
    else if(isBoardFull(myBoard)) { return "Draw";}
    else{ return "Next Player: " + (isX ? "X": "O");}
  }
  
  function isBoardFull(board){
    for(let i=0; i< 9; i++){
      if(board[i] == null){
        return false;
      }
    }
    return true;
  }
  
  function calculateWinner(myBoard) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (myBoard[a] && myBoard[a] === myBoard[b] && myBoard[a] === myBoard[c]) {
        return myBoard[a];
      }
    }
    return null;
  }

  useEffect(() => {
  socket.on('tic', (data) => {
    console.log('Square click received!');
    console.log(data.isX);
    const newBoard = data.myBoard.slice();
    newBoard[data.index] = data.isX ? 'X':'O'; //check whose turn it is
    setBoard(newBoard);
    setTurn(!data.isX);
  });
}, []);
    
  return (
    <div>
      <h2>{getStatus()}</h2>
      <div class="board">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
        {renderSquare(3)}
        {renderSquare(4)}        
        {renderSquare(5)}
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>

  );
}
