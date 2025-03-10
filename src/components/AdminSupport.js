// src/components/AdminSupport.js

import React, { useEffect, useState } from 'react';
import './css/AdminSupport.css';

const AdminSupport = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5002/api/users', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки пользователей", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div>Загрузка пользователей...</div>;
  }

  return (
    <div>
      <h2>Список зарегистрированных пользователей</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Никнейм</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Гильдия</th>
            <th>Время в игре</th>
            <th>Мут</th>
            <th>Бан</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nickname}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>{user.guild}</td>
              <td>{user.playTime}</td>
              <td>{user.muteUntil > Date.now() ? 'Мут до ' + new Date(user.muteUntil).toLocaleString() : 'Нет'}</td>
              <td>{user.banUntil > Date.now() ? 'Бан до ' + new Date(user.banUntil).toLocaleString() : 'Нет'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSupport;