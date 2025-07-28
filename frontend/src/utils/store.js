import {configureStore} from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import gameReducer from "./gameSlice";

const store = configureStore({
    reducer : {
        user : userReducer,
        game : gameReducer,
    }
})

export default store;
