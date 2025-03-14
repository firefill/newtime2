// src/components/Support.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import UserSupportChat from './UserSupportChat';
import AdminSupportChat from './AdminSupportChat';

const socket = io("http://localhost:5002", { withCredentials: true });

const technicalRoles = ["Поддержка", "Администратор", "Создатель"];

const hasTechnicalAccess = (userData) => {
  if (!userData) return false;
  if (userData.roles) {
    try {
      const rolesArray = JSON.parse(userData.roles);
      return rolesArray.some(role => technicalRoles.includes(role));
    } catch (err) {
      console.error("Ошибка парсинга ролей:", err);
      return false;
    }
  }
  return technicalRoles.includes(userData.role);
};

const Support = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Ошибка получения данных", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) return <div>Загрузка поддержки...</div>;
  if (!userData) return <div>Ошибка получения данных пользователя</div>;

  if (hasTechnicalAccess(userData)) {
    return <AdminSupportChat socket={socket} adminNickname={userData.nickname} />;
  } else {
    return <UserSupportChat socket={socket} userNickname={userData.nickname} />;
  }
};

export default Support;