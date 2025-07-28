import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  gameStatus: 'waiting', // waiting, playing, finished
  winner: null,
  roomId: null,
  playerSymbol: null,
  opponentUsername: '',
  messages: []
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameState: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateBoard: (state, action) => {
      state.board = action.payload;
    },
    setCurrentPlayer: (state, action) => {
      state.currentPlayer = action.payload;
    },
    setGameStatus: (state, action) => {
      state.gameStatus = action.payload;
    },
    setWinner: (state, action) => {
      state.winner = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setPlayerSymbol: (state, action) => {
      state.playerSymbol = action.payload;
    },
    setOpponentUsername: (state, action) => {
      state.opponentUsername = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    resetGame: (state) => {
      state.board = Array(9).fill(null);
      state.currentPlayer = 'X';
      state.winner = null;
      state.gameStatus = 'waiting';
      state.messages = [];
    }
  }
});

export const {
  setGameState,
  updateBoard,
  setCurrentPlayer,
  setGameStatus,
  setWinner,
  setRoomId,
  setPlayerSymbol,
  setOpponentUsername,
  addMessage,
  clearMessages,
  resetGame
} = gameSlice.actions;

export default gameSlice.reducer;
