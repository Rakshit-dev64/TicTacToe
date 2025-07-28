const socket = require("socket.io");
const crypto = require("crypto");

const getSecretRoomId = (player1, player2) => {
  return crypto
    .createHash("sha256")
    .update([player1, player2].sort().join("_"))
    .digest("hex");
};

// Store active games
const activeGames = new Map();
const waitingPlayers = new Map();

const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join game event
    socket.on("joinGame", ({ userId, username, opponentUsername }) => {
      const roomId = getSecretRoomId(username, opponentUsername);
      socket.join(roomId);
      
      console.log(`${username} wants to play with ${opponentUsername}`);
      
      // Check if opponent is already waiting
      if (waitingPlayers.has(opponentUsername)) {
        const opponentSocketId = waitingPlayers.get(opponentUsername);
        const opponentSocket = io.sockets.sockets.get(opponentSocketId);
        
        if (opponentSocket) {
          // Make sure opponent is also in the same room
          opponentSocket.join(roomId);
          
          // Start the game - first player gets X, second gets O
          const gameData = {
            roomId,
            board: Array(9).fill(null),
            currentPlayer: 'X',
            players: {
              [opponentUsername]: { username: opponentUsername, symbol: 'X', socketId: opponentSocketId },
              [username]: { username: username, symbol: 'O', socketId: socket.id }
            }
          };
          
          activeGames.set(roomId, gameData);
          
          // Notify both players
          opponentSocket.emit('gameJoined', { roomId, symbol: 'X', opponent: username });
          socket.emit('gameJoined', { roomId, symbol: 'O', opponent: opponentUsername });
          
          // Remove from waiting list
          waitingPlayers.delete(opponentUsername);
          
          console.log(`Game started between ${opponentUsername} (X) and ${username} (O)`);
        }
      } else {
        // Add to waiting list
        waitingPlayers.set(username, socket.id);
        console.log(`${username} is waiting for ${opponentUsername}`);
      }
    });

    // Make move event
    socket.on("makeMove", ({ roomId, board, index }) => {
      const game = activeGames.get(roomId);
      if (!game) return;
      
      // Update game state
      game.board = board;
      const winner = checkWinner(board);
      
      if (winner) {
        game.winner = winner;
        io.to(roomId).emit('gameUpdate', { 
          board: game.board, 
          currentPlayer: game.currentPlayer, 
          winner 
        });
      } else if (board.every(cell => cell)) {
        // Draw
        io.to(roomId).emit('gameUpdate', { 
          board: game.board, 
          currentPlayer: game.currentPlayer, 
          winner: 'draw' 
        });
      } else {
        // Switch turns
        game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
        io.to(roomId).emit('gameUpdate', { 
          board: game.board, 
          currentPlayer: game.currentPlayer 
        });
      }
      
      activeGames.set(roomId, game);
    });

    // Send message event
    socket.on("sendMessage", ({ roomId, message, sender }) => {
      // Send to all players in the room (including sender for consistency)
      io.to(roomId).emit('messageReceived', { message, sender });
      console.log(`Message in ${roomId} from ${sender}: ${message}`);
    });

    // Reset game event
    socket.on("resetGame", ({ roomId }) => {
      const game = activeGames.get(roomId);
      if (!game) return;
      
      game.board = Array(9).fill(null);
      game.currentPlayer = 'X';
      game.winner = null;
      
      io.to(roomId).emit('gameUpdate', { 
        board: game.board, 
        currentPlayer: game.currentPlayer 
      });
      
      activeGames.set(roomId, game);
    });

    // Legacy chat events (keeping for compatibility)
    socket.on("joinchat", ({ userId, otherUserId, name }) => {
      const roomId = getSecretRoomId(userId, otherUserId);
      console.log(name + " Joined the chat room: " + roomId);
      socket.join(roomId);
    });

    socket.on("sendmessage", async ({ userId, name, otherUserId, text }) => {
      try {
        const roomId = getSecretRoomId(userId, otherUserId);
        console.log(name + " sent: " + text);
        io.to(roomId).emit("messageReceived", { message: text, sender: name });
      } catch (err) {
        console.error(err);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      
      // Remove from waiting players
      for (const [username, socketId] of waitingPlayers.entries()) {
        if (socketId === socket.id) {
          waitingPlayers.delete(username);
          break;
        }
      }
      
      // Handle game disconnections
      for (const [roomId, game] of activeGames.entries()) {
        const players = Object.values(game.players);
        const disconnectedPlayer = players.find(p => p.socketId === socket.id);
        
        if (disconnectedPlayer) {
          // Notify other player
          socket.to(roomId).emit('opponentDisconnected');
          // Remove the game
          activeGames.delete(roomId);
          break;
        }
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
