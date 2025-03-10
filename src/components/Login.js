// src/components/Login.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login({ setLoggedIn }) {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5002/api/login', {
        method: 'POST',
        credentials: 'include', // чтобы отправлять и получать cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password })
      });
      if (res.ok) {
        setLoggedIn(true);
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Ошибка при входе');
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Никнейм:</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
        </div>
        <div>
          <label>Пароль:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Войти</button>
      </form>
      {message && <p>{message}</p>}
      <p>Нет аккаунта? <Link to="/register">Регистрация</Link></p>
    </div>
  );
}

export default Login;