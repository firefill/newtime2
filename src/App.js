// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Импорт компонентов страниц
import Header from './components/Header';
import Login from './components/Login';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import NorthernNews from './components/NorthernNews';
import GamingNews from './components/GamingNews';
import Events from './components/Events';
import Posts from './components/Posts';
import Support from './components/Support';
import Donate from './components/Donate';
import Rules from './components/Rules';
import Guild from './components/Guild';
import Bank from './components/Bank';
import EditSupport from './components/EditSupport';

// Технические роли для доступа к техническим страницам
const technicalRoles = ["Поддержка", "Администратор", "Создатель"];

const hasTechnicalAccess = (userData) => {
  if (!userData) return false;
  // Если в базе хранится массив ролей (в поле roles)
  if (userData.roles) {
    try {
      const rolesArray = JSON.parse(userData.roles);
      return rolesArray.some(role => technicalRoles.includes(role));
    } catch (err) {
      console.error("Ошибка парсинга ролей:", err);
      return false;
    }
  }
  // Иначе проверяем старое поле role
  return technicalRoles.includes(userData.role);
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userData, setUserData] = useState(null);

  // Проверка авторизации и получение данных пользователя
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/me', {
          method: 'GET',
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched userData:", data);
          setUserData(data);
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
          <Header loggedIn={loggedIn} userData={userData} setLoggedIn={setLoggedIn} />
          <Routes>
            {/* Общие маршруты для всех авторизованных пользователей */}
            <Route path="/dashboard" element={<Dashboard loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
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

            {/* Технический маршрут EditSupport – доступен только для технических ролей */}
            <Route
              path="/edit-support"
          element={
    userData && hasTechnicalAccess(userData)
      ? <EditSupport currentUser={userData} />
      : <Navigate to="/dashboard" />
  }
/>

            {/* Если ни один из маршрутов не совпадает, перенаправляем на Dashboard */}
            <Route path="/" element={<Dashboard loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      ) : (
        // Гостевые маршруты: доступны только логин и регистрация
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