// src/components/EditSupport.js
import React, { useState, useEffect } from 'react';
import './css/EditSupport.css';

const rolePriority = {
  "Игрок": 1,
  "FBI": 2,
  "Генерал": 3,
  "СМИ": 4,
  "Банкир": 5,
  "Владелец банка": 6,
  "Судья": 7,
  "Высший судья": 8,
  "Мэр": 9,
  "вице-Президент": 10,
  "Президент": 11,
  "Прайм": 12,
  "Прайм+": 13,
  "Поддержка": 100,
  "Администратор": 101,
  "Создатель": 102,
};

const PlayerEditModal = ({ user, onClose, onSave, currentUser }) => {
  // Если roles существует, пробуем распарсить его; иначе по умолчанию ["Игрок"]
  const initialRoles = user.roles ? JSON.parse(user.roles) : ["Игрок"];
  const [formData, setFormData] = useState({ ...user, roles: JSON.stringify(initialRoles) });
  const [message, setMessage] = useState("");

  // Для проверки прав редактирования – здесь используется логика сравнения минимальных приоритетов
  let canEdit = false;
  if (currentUser && currentUser.role) {
    const currentRoles = currentUser.roles ? JSON.parse(currentUser.roles) : [currentUser.role];
    const minCurrent = Math.min(...currentRoles.map(r => rolePriority[r] || 999));
    const editedRoles = user.roles ? JSON.parse(user.roles) : [user.role];
    const minEdited = Math.min(...editedRoles.map(r => rolePriority[r] || 0));
    canEdit = minCurrent > minEdited;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRolesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    console.log("Selected roles:", selectedOptions); // отладочный лог
    setFormData({ ...formData, roles: JSON.stringify(selectedOptions) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      setMessage("У вас недостаточно прав для редактирования этого пользователя.");
      return;
    }
    console.log("Submitting formData:", formData); // отладка: что отправляем на сервер
    try {
      const res = await fetch(`http://localhost:5002/api/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        onSave(formData);
      }
    } catch (error) {
      console.error("Ошибка при сохранении данных:", error);
      setMessage("Ошибка при сохранении данных.");
    }
  };

  return (
    <div className="edit-modal">
      <div className="modal-content">
        <h3>Редактирование: {user.nickname}</h3>
        {!canEdit && <p className="error">Редактирование запрещено для этого пользователя.</p>}
        <form onSubmit={handleSubmit}>
          <label>Имя:</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <label>Никнейм:</label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname || ""}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <label>Роли:</label>
          <select
            name="roles"
            multiple
            value={formData.roles ? JSON.parse(formData.roles) : []}
            onChange={handleRolesChange}
            disabled={!canEdit}
          >
            <optgroup label="Игровые роли">
              <option value="Игрок">Игрок</option>
              <option value="FBI">FBI</option>
              <option value="Генерал">Генерал</option>
              <option value="СМИ">СМИ</option>
              <option value="Банкир">Банкир</option>
              <option value="Владелец банка">Владелец банка</option>
              <option value="Судья">Судья</option>
              <option value="Высший судья">Высший судья</option>
              <option value="Мэр">Мэр</option>
              <option value="вице-Президент">вице-Президент</option>
              <option value="Президент">Президент</option>
            </optgroup>
            <optgroup label="Донатные роли">
              <option value="Прайм">Прайм</option>
              <option value="Прайм+">Прайм+</option>
            </optgroup>
            <optgroup label="Технические роли">
              <option value="Поддержка">Поддержка</option>
              <option value="Администратор">Администратор</option>
              <option value="Создатель">Создатель</option>
            </optgroup>
          </select>
          <label>Статус:</label>
          <input
            type="text"
            name="status"
            value={formData.status || ""}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <label>Гильдия:</label>
          <input
            type="text"
            name="guild"
            value={formData.guild || ""}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <label>Время в игре (мин):</label>
          <input
            type="number"
            name="playTime"
            value={formData.playTime || 0}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <label>Скин (URL):</label>
          <input
            type="text"
            name="skin"
            value={formData.skin || ""}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <label>АР:</label>
          <input
            type="number"
            name="ar"
            value={formData.ar || 0}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <label>Деньги ивентовые:</label>
          <input
            type="number"
            name="eventMoney"
            value={formData.eventMoney || 0}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <label>Деньги донатные:</label>
          <input
            type="number"
            name="donateMoney"
            value={formData.donateMoney || 0}
            onChange={handleChange}
            disabled={!canEdit}
          />
          <div className="modal-buttons">
            <button type="submit" disabled={!canEdit}>Сохранить</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

const EditSupport = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState("players");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (activeTab === "players") {
      const fetchUsers = async () => {
        try {
          const res = await fetch('http://localhost:5002/api/users', { credentials: 'include' });
          const data = await res.json();
          setUsers(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchUsers();
    }
  }, [activeTab]);

  if (!currentUser) {
    return <div>Загрузка данных...</div>;
  }

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

const handleUserClick = (user) => {
  if (!currentUser) {
    alert("Данные текущего пользователя не загружены.");
    return;
  }
  if (!user) {
    alert("Ошибка: пользователь не найден.");
    return;
  }

  // Если у пользователя нет ни старого поля role, ни поля roles,
  // можно вывести другое сообщение или просто пропустить проверку
  if (!user.role && !user.roles) {
    alert("У пользователя не указаны роли.");
    return;
  }

  const currentRoles = currentUser.roles ? JSON.parse(currentUser.roles) : [currentUser.role];
  const editedRoles = user.roles ? JSON.parse(user.roles) : [user.role];

  // Логика сравнения приоритетов
  const minCurrent = Math.min(...currentRoles.map(r => rolePriority[r] || 999));
  const minEdited = Math.min(...editedRoles.map(r => rolePriority[r] || 0));
  if (minCurrent <= minEdited) {
    alert("У вас недостаточно прав для редактирования этого пользователя.");
    return;
  }

  setSelectedUser(user);
};

  const handleModalClose = () => {
    setSelectedUser(null);
  };

  const handleUserSave = (updatedUser) => {
    setUsers(prev =>
      prev.map(u => (u.id === updatedUser.id ? updatedUser : u))
    );
    setSelectedUser(null);
    setMessage("Пользователь обновлён");
  };

  return (
    <div className="edit-support">
      <h2>Редактирование</h2>
      <div className="tabs">
        <button className={activeTab === "players" ? "active" : ""} onClick={() => setActiveTab("players")}>
          Игроки
        </button>
        <button className={activeTab === "banks" ? "active" : ""} onClick={() => setActiveTab("banks")}>
          Банки
        </button>
        <button className={activeTab === "cities" ? "active" : ""} onClick={() => setActiveTab("cities")}>
          Города
        </button>
        <button className={activeTab === "court" ? "active" : ""} onClick={() => setActiveTab("court")}>
          Суд
        </button>
        <button className={activeTab === "fbi" ? "active" : ""} onClick={() => setActiveTab("fbi")}>
          FBI
        </button>
        <button className={activeTab === "whiteHouse" ? "active" : ""} onClick={() => setActiveTab("whiteHouse")}>
          Белый дом
        </button>
        <button className={activeTab === "news" ? "active" : ""} onClick={() => setActiveTab("news")}>
          Новости
        </button>
        <button className={activeTab === "posts" ? "active" : ""} onClick={() => setActiveTab("posts")}>
          Посты
        </button>
      </div>
      {activeTab === "players" && (
        <div className="tab-content players-tab">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="user-list">
            {filteredUsers.length === 0 ? (
              <p>Нет пользователей.</p>
            ) : (
              <ul>
                {filteredUsers.map(user => (
                  <li key={user.id} onClick={() => handleUserClick(user)}>
                    {user.nickname} ({user.roles || user.role})
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedUser && (
            <PlayerEditModal
              user={selectedUser}
              onClose={handleModalClose}
              onSave={handleUserSave}
              currentUser={currentUser}
            />
          )}
          {message && <p className="message">{message}</p>}
        </div>
      )}
      {activeTab === "banks" && (
        <div className="tab-content banks-tab">
          <h3>Банки</h3>
          <p>Функционал в разработке.</p>
        </div>
      )}
      {activeTab === "cities" && (
        <div className="tab-content cities-tab">
          <h3>Города</h3>
          <p>Функционал в разработке.</p>
        </div>
      )}
      {activeTab === "court" && (
        <div className="tab-content court-tab">
          <h3>Суд</h3>
          <p>Функционал в разработке.</p>
        </div>
      )}
      {activeTab === "fbi" && (
        <div className="tab-content fbi-tab">
          <h3>FBI</h3>
          <p>Функционал в разработке.</p>
        </div>
      )}
      {activeTab === "whiteHouse" && (
        <div className="tab-content white-house-tab">
          <h3>Белый дом</h3>
          <p>Функционал в разработке.</p>
        </div>
      )}
      {activeTab === "news" && (
        <div className="tab-content news-tab">
          <h3>Новости</h3>
          <p>Функционал в разработке.</p>
        </div>
      )}
      {activeTab === "posts" && (
        <div className="tab-content posts-tab">
          <h3>Посты</h3>
          <p>Функционал в разработке.</p>
        </div>
      )}
    </div>
  );
};

export default EditSupport;