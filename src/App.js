

// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Импорт компонентов страниц
import Header from './components/Header';
import Login from './components/Login';
import Registration from './components/Registration';
import NorthernNews from './components/NorthernNews';
import GamingNews from './components/GamingNews';
import Events from './components/Events';
import Posts from './components/Posts';
import Support from './components/Support';
import Donate from './components/Donate';
import Rules from './components/Rules';
import Guild from './components/Guild';
import Bank from './components/Bank';
import Dashboard from './components/Dashboard';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Проверка авторизации при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/me', {
          method: 'GET',
          credentials: 'include'
        });
        if (res.ok) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (error) {
        console.error("Ошибка проверки авторизации:", error);
        setLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (checkingAuth) {
    return <div>Проверка авторизации...</div>;
  }

  return (
    <Router>
      {loggedIn ? (
        <>
          {/* Хедер с группировкой элементов, вместо Dashboard – маленький квадрат (ссылка на Profile) */}
          <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
          <Routes>
            <Route path="/profile" element={<Dashboard loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
            <Route path="/news/northern" element={<NorthernNews />} />
            <Route path="/news/gaming" element={<GamingNews />} />
            <Route path="/events" element={<Events />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/support" element={<Support />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/guild" element={<Guild />} />
            <Route path="/bank" element={<Bank />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
          <Route path="/register" element={<Registration />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;