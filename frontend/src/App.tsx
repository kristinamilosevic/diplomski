import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import AdminMovies from './components/AdminMovies';
import Watchlist from './components/Watchlist';
import WatchlistDetail from './components/WatchlistDetail';
import Profile from './components/Profile';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/watchlist/:movieId" element={<WatchlistDetail />} />
          <Route path="/admin/movies" element={<AdminMovies />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
