import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Singup';
import Body from './components/Body';
import { Provider, useDispatch } from 'react-redux';
import store from './utils/store';
import axios from 'axios';
import { BASE_URL } from './utils/constants';
import { addUser } from './utils/userSlice';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const res = await axios.get(BASE_URL + "/profile", {
          withCredentials: true
        });
        dispatch(addUser(res.data));
      } catch (err) {
        // User is not authenticated, do nothing
        console.log('User not authenticated');
      }
    };
    
    checkAuth();
  }, [dispatch]);

  return (
    <BrowserRouter basename='/'>
      <Routes>
        <Route path='/' element={<Body/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
      </Routes> 
    </BrowserRouter>
  );
}

function App () {
  return (
    <div>
      <Provider store = {store}>
        <AppContent />
      </Provider>
    </div>
  )
}

export default App;