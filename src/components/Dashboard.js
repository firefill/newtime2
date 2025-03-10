// src/components/Dashboard.js

import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Footer from './Footer';

function Dashboard({ loggedIn, setLoggedIn }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    const fetchUserData = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/me', {
          method: 'GET',
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        } else {
          // Если сессия недействительна, снимаем флаг логина
          setLoggedIn(false);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [loggedIn, setLoggedIn]);

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div>Загрузка данных...</div>;
  }

  return (
    <div>
      <h2>Главная страница</h2>
      { userData ? (
        <div className="user-info">
          <p><strong>Никнейм:</strong> {userData.nickname}</p>
          <p><strong>Гильдия:</strong> {userData.guild || 'Не состоит'}</p>
          <p><strong>Время в игре:</strong> {userData.playTime} минут</p>
          <p>
            <strong>Скин:</strong>
            {userData.skin
              ? <img src={userData.skin} alt="Скин" width="64" />
              : 'Не задан'}
          </p>
          <p><strong>АР (Деньги ваниль):</strong> {userData.ar}</p>
          <p><strong>Деньги ивентовые:</strong> {userData.eventMoney}</p>
          <p><strong>Деньги донатные:</strong> {userData.donateMoney}</p>
          <p><strong>Игровая роль:</strong> {userData.gameRole || 'Не задана'}</p>
        </div>
      ) : (
        <p>Не удалось загрузить данные пользователя.</p>
      )}
      <nav>
        <ul>
          <li><Link to="/news">Новости</Link></li>
          <li><Link to="/events">Ивенты</Link></li>
          <li><Link to="/worlds/survival">Выжидание</Link></li>
          <li><Link to="/worlds/creative">Креатив</Link></li>
          <li><Link to="/worlds/lobby">Лобби</Link></li>
          <li><Link to="/guild">Гильдия</Link></li>
          <li><Link to="/donate">Донат</Link></li>
          <li><Link to="/support">Поддержка</Link></li>
          <li><Link to="/rules">Правила</Link></li>
        </ul>
      </nav>
      <Footer />
    </div>
  );
}

export default Dashboard;