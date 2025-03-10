// src/components/Registration.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    password: '',
    source: '',
    age: '',
    rpParticipation: false,
    codeWord: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5002/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Ошибка при регистрации');
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Имя:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Никнейм:</label>
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />
        </div>
        <div>
          <label>Пароль:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Откуда узнали о проекте?</label>
          <input type="text" name="source" value={formData.source} onChange={handleChange} required />
        </div>
        <div>
          <label>Сколько вам лет?</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        <div>
          <label>Планируете ли вы участвовать в RP ситуациях?</label>
          <input type="checkbox" name="rpParticipation" checked={formData.rpParticipation} onChange={handleChange} />
        </div>
        <div>
          <label>Напишите кодовое слово из правил:</label>
          <input type="text" name="codeWord" value={formData.codeWord} onChange={handleChange} required />
        </div>
        <button type="submit">Отправить заявку</button>
      </form>
      {message && <p>{message}</p>}
      <p>Уже зарегистрированы? <Link to="/login">Войти</Link></p>
    </div>
  );
}

export default Registration;