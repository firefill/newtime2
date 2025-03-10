// src/components/UserSupportChat.js

import React, { useState, useEffect } from 'react';
import './css/UserSupportChat.css';

const UserSupportChat = ({ socket, userNickname }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    topic: '',
    urgency: '',
    description: ''
  });

  // При монтировании проверяем, есть ли сохранённый тикет в localStorage
  useEffect(() => {
    const storedTicketId = localStorage.getItem('selectedTicketIdUser');
    if (storedTicketId) {
      console.log("Найден сохранённый тикет:", storedTicketId);
      setSelectedTicket({ ticketId: storedTicketId });
      socket.emit('joinTicket', storedTicketId);
    }
  }, [socket]);

  // Запрашиваем все тикеты пользователя
  useEffect(() => {
    socket.emit('getUserTickets', userNickname);
    socket.on('userTickets', (fetchedTickets) => {
      console.log('Получены тикеты пользователя:', fetchedTickets);
      setTickets(fetchedTickets);
      // Если тикетов есть и никакой не выбран, выбираем первый
      if (fetchedTickets.length > 0 && !selectedTicket) {
        setSelectedTicket(fetchedTickets[0]);
        localStorage.setItem('selectedTicketIdUser', fetchedTickets[0].ticketId);
        socket.emit('joinTicket', fetchedTickets[0].ticketId);
      }
    });
    return () => {
      socket.off('userTickets');
    };
  }, [socket, userNickname, selectedTicket]);

  // Слушаем событие newTicket — если тикет создан пользователем, добавляем его в список
  useEffect(() => {
    const handleNewTicket = (ticket) => {
      console.log('Получена новая заявка (newTicket):', ticket);
      if (ticket.userNickname === userNickname) {
        setTickets(prev => [...prev, ticket]);
        // Если тикет ещё не выбран, выбираем его автоматически
        if (!selectedTicket) {
          setSelectedTicket(ticket);
          localStorage.setItem('selectedTicketIdUser', ticket.ticketId);
          socket.emit('joinTicket', ticket.ticketId);
        }
      }
    };

    socket.on('newTicket', handleNewTicket);
    return () => {
      socket.off('newTicket', handleNewTicket);
    };
  }, [socket, userNickname, selectedTicket]);

  // Слушаем событие ticketMessage, которое возвращает историю сообщений для выбранного тикета
  useEffect(() => {
    const handleTicketMessage = (msgs) => {
      console.log('Получены сообщения для тикета:', msgs);
      if (selectedTicket) {
        setChatMessages(msgs);
      }
    };

    socket.on('ticketMessage', handleTicketMessage);
    return () => {
      socket.off('ticketMessage', handleTicketMessage);
    };
  }, [socket, selectedTicket]);

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewTicketData({ topic: '', urgency: '', description: '' });
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    // Отправляем данные заявки, никнейм берется автоматически
    socket.emit('createTicket', {
      topic: newTicketData.topic,
      urgency: newTicketData.urgency,
      description: newTicketData.description,
      userNickname: userNickname
    });
    closeCreateModal();
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    localStorage.setItem('selectedTicketIdUser', ticket.ticketId);
    socket.emit('joinTicket', ticket.ticketId);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (selectedTicket && inputMsg.trim() !== '') {
      socket.emit('ticketMessage', {
        ticketId: selectedTicket.ticketId,
        message: inputMsg,
        sender: userNickname
      });
      setInputMsg('');
    }
  };

  return (
    <div className="user-support">
      <h2>Поддержка</h2>
      <button onClick={openCreateModal}>Создать заявку</button>

      {/* Модальное окно для создания заявки */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Новая заявка</h3>
            <form onSubmit={handleCreateTicket}>
              <div>
                <label>Тема заявки:</label>
                <input
                  type="text"
                  value={newTicketData.topic}
                  onChange={(e) => setNewTicketData({ ...newTicketData, topic: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Срочность:</label>
                <input
                  type="text"
                  value={newTicketData.urgency}
                  onChange={(e) => setNewTicketData({ ...newTicketData, urgency: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Описание:</label>
                <textarea
                  value={newTicketData.description}
                  onChange={(e) => setNewTicketData({ ...newTicketData, description: e.target.value })}
                  required
                ></textarea>
              </div>
              <button type="submit">Отправить заявку</button>
              <button type="button" onClick={closeCreateModal}>Отмена</button>
            </form>
          </div>
        </div>
      )}

      {/* Список заявок, созданных пользователем */}
      <div className="ticket-list">
        <h3>Ваши заявки</h3>
        {tickets.length === 0 ? (
          <p>Нет заявок.</p>
        ) : (
          <ul>
            {tickets.map(ticket => (
              <li
                key={ticket.ticketId}
                onClick={() => handleSelectTicket(ticket)}
                style={{
                  cursor: 'pointer',
                  background: selectedTicket && selectedTicket.ticketId === ticket.ticketId ? '#ececec' : 'transparent'
                }}
              >
                {ticket.topic} - {ticket.urgency} {ticket.admin ? `(Взята: ${ticket.admin})` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Чат выбранного тикета */}
      {selectedTicket && (
        <div className="chat-section">
          <h3>Чат заявки (ID: {selectedTicket.ticketId})</h3>
          <div className="chat-box">
            {chatMessages.length === 0 ? (
              <p>Нет сообщений.</p>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx}>
                  <strong>{msg.sender}:</strong> {msg.message} <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Введите сообщение..."
            />
            <button type="submit">Отправить</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserSupportChat;