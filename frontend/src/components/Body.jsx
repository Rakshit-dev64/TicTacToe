import React, { useEffect } from 'react';
import TicTacToe from './TicTacToe';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { removeUser } from '../utils/userSlice';

const Body = () => {
  const user = useSelector(store => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, {
        withCredentials: true
      });
      dispatch(removeUser());
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Show loading or return null while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800">Welcome, {user.name}!</h1>
            <p className="text-gray-600 mt-2">Ready to play Tic Tac Toe?</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
          >
            Logout
          </button>
        </div>
        <TicTacToe />
      </div>
    </div>
  );
};

export default Body;
