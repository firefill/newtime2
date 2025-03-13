// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './css/Header.css';

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

const Header = ({ loggedIn, userData, setLoggedIn }) => {
  console.log("Header userData:", userData);
  const showEdit = userData && hasTechnicalAccess(userData);
  console.log("showEdit:", showEdit, "userData:", userData);

  const handleLogout = () => {
    setLoggedIn(false);
    // Можно добавить вызов API для выхода
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/dashboard" className="profile-icon">
          <img src="/path/to/default-avatar.png" alt="Профиль" />
        </Link>
      </div>
      <nav className="header-nav">
        <ul className="nav-list">
          <li className="nav-item dropdown">
            <span className="nav-icon info-icon"></span>
            <span className="nav-text">Инфо</span>
            <ul className="dropdown-content">
              <li><Link to="/news/northern">Новости северные</Link></li>
              <li><Link to="/news/gaming">Новости игровые</Link></li>
              <li><Link to="/events">Ивенты</Link></li>
              <li><Link to="/posts">Посты</Link></li>
            </ul>
          </li>
          <li className="nav-item dropdown">
            <span className="nav-icon service-icon"></span>
            <span className="nav-text">Сервис</span>
            <ul className="dropdown-content">
              <li><Link to="/support">Поддержка</Link></li>
              <li><Link to="/donate">Донат</Link></li>
              <li><Link to="/rules">Правила</Link></li>
              {showEdit && <li><Link to="/edit-support">Редакт</Link></li>}
            </ul>
          </li>
          <li className="nav-item dropdown">
            <span className="nav-icon org-icon"></span>
            <span className="nav-text">Организации</span>
            <ul className="dropdown-content">
              <li><Link to="/guild">Город</Link></li>
              <li><Link to="/bank">Банк</Link></li>
              <li><Link to="/white-house">Белый дом</Link></li>
              <li><Link to="/fbi">FBI</Link></li>
              <li><Link to="/court">Суд</Link></li>
            </ul>
          </li>
          <li className="nav-item icon-only">
            <Link to="/search">
              <span className="nav-icon search-icon"></span>
            </Link>
          </li>
          <li className="nav-item icon-only">
            <Link to="/chat">
              <span className="nav-icon chat-icon"></span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="header-right">
        <li className="nav-item logout">
          <button onClick={handleLogout}>Выход</button>
        </li>
      </div>
    </header>
  );
};

export default Header;