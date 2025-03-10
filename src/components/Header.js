// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './css/Header.css';

const Header = ({ loggedIn, setLoggedIn }) => {
  const handleLogout = () => {
    // Здесь должен быть вызов API для логаута, затем изменение состояния
    setLoggedIn(false);
  };

  return (
      <header className="header">
        <div className="header-left">
          <Link to="/profile" className="profile-icon">
            {/* Здесь можно разместить изображение или иконку профиля */}
            <img src="/path/to/default-avatar.png" alt="Профиль"/>
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
                <li><Link to="/events">Карта</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <span className="nav-icon info-icon"></span>
              <span className="nav-text">Связи</span>
              <ul className="dropdown-content">
                <li><Link to="/posts">Посты</Link></li>
                <li><Link to="/news/gaming">чат</Link></li>
                <li><Link to="/events">поиск</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <span className="nav-icon service-icon"></span>
              <span className="nav-text">Сервис</span>
              <ul className="dropdown-content">
                <li><Link to="/support">Поддержка</Link></li>
                <li><Link to="/donate">Донат</Link></li>
                <li><Link to="/rules">Правила</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <span className="nav-icon org-icon"></span>
              <span className="nav-text">Организации</span>
              <ul className="dropdown-content">
                <li><Link to="/guild">Гильдия</Link></li>
                <li><Link to="/bank">Банк</Link></li>
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