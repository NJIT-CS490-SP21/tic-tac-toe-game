/* eslint-disable*/
import { React, useState, useEffect } from 'react';
import { socket } from './App.js';
import Square from './Square.js';

export default function Board(user) {
  const [myBoard, setBoard] = useState(Array(9).fill(null));
  const [isX, setTurn] = useState(true);
  const winner = calculateWinner(myBoard);
  const username = user.user;
  const { playerX } = user;
  const { playerO } = user;
  const isPlayerX = username === playerX;
  const { isSpect } = user;
  let gameover = false;

  function onClickSquare(index) {
    if (!winner && !myBoard[index] && !isSpect && isX === isPlayerX) {
      const newBoard = myBoard.slice();
      newBoard[index] = isX ? 'X' : 'O'; // check whose turn it is
      setBoard(newBoard);
      setTurn(!isX);
      socket.emit('tic', { index, myBoard, isX });
    }
  }

  function renderSquare(index) {
    return (
      <Square value={myBoard[index]} onClick={onClickSquare} index={index} />
    );
  }

  function isBoardFull(board) {
    for (let i = 0; i < 9; i += 1) {
      if (board[i] == null) {
        return false;
      }
    }
    return true;
  }

  function getStatus() {
    let status;

    if (winner) {
      status = winner === 'X' ? `Winner: ${playerX}` : `Winner: ${playerO}`;
      gameover = true;
    } else if (isBoardFull(myBoard)) {
      status = 'Draw';
    } else {
      status = `Next player: ${isX ? 'X' : 'O'}`;
    }

    return status;
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
    for (let i = 0; i < lines.length; i += 1) {
      const [a, b, c] = lines[i];
      if (
        myBoard[a]
        && myBoard[a] === myBoard[b]
        && myBoard[a] === myBoard[c]
      ) {
        return myBoard[a];
      }
    }
    return null;
  }

  function resetBoard() {
    if (!isSpect && (winner || isBoardFull(myBoard))) {
      const emptyBoard = Array(9).fill(null);
      socket.emit('reset', { emptyBoard, isX: true });
    }
  }

  useEffect(() => {
    socket.on('tic', (data) => {
      const newBoard = data.myBoard.slice();
      newBoard[data.index] = data.isX ? 'X' : 'O'; // check whose turn it is
      setBoard(newBoard);
      setTurn(!data.isX);
    });
    socket.on('reset', (data) => {
      setTurn(data.isX);
      setBoard(data.emptyBoard);
      gameover = false;
    });
  }, []);

  useEffect(() => {
    if (gameover && !isSpect) {
      socket.emit('gameover', {
        winner,
        playerX,
        username,
      });
    }
  }, [winner]);

  return (
    <div>
      <div className="board" role="squares">
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
      <h2>{getStatus()}</h2>
      <button className="reset" type="button" onClick={resetBoard}>
        Reset Board
      </button>
    </div>
  );
}
