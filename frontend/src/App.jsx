import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Singup';
import Body from './components/Body';
import { Provider } from 'react-redux';
import store from './utils/store';

function App () {
  return (
    <div>
    <Provider store = {store}>
    <BrowserRouter basename='/'>
    <Routes>
      <Route path='/' element={<Body/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>
    </Routes> 
    </BrowserRouter>
    </Provider>
    </div>
  )
}

export default App;