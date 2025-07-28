import React, { useState, useEffect } from 'react';
import { createSocketConnection } from '../utils/socket';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const TicTacToe = () => {
  const [socket, setSocket] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, finished
  const [winner, setWinner] = useState(null);
  const [opponentUsername, setOpponentUsername] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [waitingMessage, setWaitingMessage] = useState('');
  
  const user = useSelector(store => store.user);

  useEffect(() => {
    const socketConnection = createSocketConnection();
    setSocket(socketConnection);

    // Socket event listeners
    socketConnection.on('gameJoined', ({ roomId, symbol, opponent }) => {
      setRoomId(roomId);
      setPlayerSymbol(symbol);
      setOpponentUsername(opponent);
      setGameStatus('playing');
      setWaitingMessage('');
    });

    socketConnection.on('gameUpdate', ({ board, currentPlayer, winner }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      if (winner) {
        setWinner(winner);
        setGameStatus('finished');
      }
    });

    socketConnection.on('opponentDisconnected', () => {
      alert('Opponent disconnected');
      setGameStatus('waiting');
    });

    socketConnection.on('messageReceived', ({ message, sender }) => {
      setMessages(prev => [...prev, { message, sender, timestamp: Date.now() }]);
    });

    return () => socketConnection.disconnect();
  }, []);

  const joinGame = () => {
    if (socket && user && opponentUsername) {
      setWaitingMessage(`Waiting for ${opponentUsername} to join...`);
      socket.emit('joinGame', { 
        userId: user._id, 
        username: user.name,
        opponentUsername 
      });
    }
  };

  const makeMove = (index) => {
    if (board[index] || winner || currentPlayer !== playerSymbol) return;
    
    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    
    socket.emit('makeMove', { roomId, board: newBoard, index });
  };

  const sendMessage = () => {
    if (messageInput.trim() && socket && roomId) {
      socket.emit('sendMessage', { 
        roomId, 
        message: messageInput, 
        sender: user.name 
      });
      setMessageInput('');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameStatus('waiting');
    if (socket && roomId) {
      socket.emit('resetGame', { roomId });
    }
  };

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const renderSquare = (index) => (
    <button
      key={index}
      className={`
        w-20 h-20 sm:w-24 sm:h-24 
        border-2 border-gray-300 
        text-3xl sm:text-4xl font-bold 
        bg-white hover:bg-gray-50 
        transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 
        disabled:cursor-not-allowed disabled:opacity-50
        shadow-sm hover:shadow-md
        ${
          board[index] === 'X' 
            ? 'text-blue-600' 
            : board[index] === 'O' 
            ? 'text-red-600' 
            : 'text-gray-400'
        }
      `}
      onClick={() => makeMove(index)}
      disabled={board[index] || winner || currentPlayer !== playerSymbol}
    >
      {board[index]}
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-6xl mx-auto">
      {/* Game Section */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-center mb-6">Tic Tac Toe</h1>
        
        {gameStatus === 'waiting' && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Play?</h2>
              <p className="text-gray-600">Enter your opponent's username to start a game</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <p><strong>💡 How it works:</strong></p>
                <p>• Both players need to enter each other's usernames</p>
                <p>• Make sure the username matches exactly (case-sensitive)</p>
                <p>• Your username is: <strong>{user.name}</strong></p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Enter opponent's username"
                value={opponentUsername}
                onChange={(e) => setOpponentUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinGame()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center sm:text-left"
              />
              <button
                onClick={joinGame}
                disabled={!opponentUsername.trim()}
                className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                🚀 Join Game
              </button>
            </div>
            
            {waitingMessage && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  {waitingMessage}
                </div>
                <p className="text-sm text-gray-500 mt-2">Ask your opponent to enter your username: <strong>{user.name}</strong></p>
              </div>
            )}
          </div>
        )}

        {gameStatus === 'playing' && (
          <div className="text-center mb-4">
            <p className="text-lg">
              Playing against: <span className="font-bold">{opponentUsername}</span>
            </p>
            <p className="text-lg">
              You are: <span className="font-bold text-blue-600">{playerSymbol}</span>
            </p>
            <p className="text-lg">
              Current turn: <span className="font-bold">{currentPlayer}</span>
            </p>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-xl shadow-lg mb-6 mx-auto max-w-fit">
          <div className="grid grid-cols-3 gap-3">
            {Array(9).fill(null).map((_, index) => renderSquare(index))}
          </div>
        </div>

        {/* Game Status */}
        {winner && (
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-green-600">
              {winner === playerSymbol ? 'You Win!' : 'You Lose!'}
            </p>
            <button
              onClick={resetGame}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
            >
              Play Again
            </button>
          </div>
        )}

        {board.every(square => square) && !winner && (
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-yellow-600">It's a Draw!</p>
            <button
              onClick={resetGame}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-2"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Chat Section */}
      {gameStatus === 'playing' && (
        <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">💬</span>
              Live Chat
            </h2>
          </div>
          
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl mb-2 block">🎮</span>
                <p>Start chatting with your opponent!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === user.name ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                      msg.sender === user.name
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-200 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${
                      msg.sender === user.name ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {msg.sender}
                    </div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
