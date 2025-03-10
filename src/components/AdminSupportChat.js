// src/components/AdminSupportChat.js

import React, { useState, useEffect } from 'react';
import './css/AdminSupportChat.css';

const AdminSupportChat = ({ socket, adminNickname }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');

  // При монтировании админский сокет присоединяется к комнате "admins"
  useEffect(() => {
    socket.emit('joinAsAdmin', adminNickname);
  }, [socket, adminNickname]);

  // Получаем все тикеты при подключении
  useEffect(() => {
    socket.on('allTickets', (tickets) => {
      console.log('Получены все тикеты:', tickets);
      setTickets(tickets);
    });
    socket.on('newTicket', (ticket) => {
      console.log('Получена новая заявка:', ticket);
      setTickets(prev => [...prev, ticket]);
    });
    socket.on('ticketUpdated', (ticket) => {
      console.log('Тикет обновлён:', ticket);
      setTickets(prev => prev.map(t => t.ticketId === ticket.ticketId ? ticket : t));
    });
    socket.on('ticketMessage', (msgs) => {
      console.log('Получены сообщения для тикета:', msgs);
      if (selectedTicket) {
        setChatMessages(msgs);
      }
    });
    socket.on('ticketTaken', (ticket) => {
      console.log('Тикет взят:', ticket);
      setTickets(prev => prev.map(t => t.ticketId === ticket.ticketId ? ticket : t));
    });
    return () => {
      socket.off('allTickets');
      socket.off('newTicket');
      socket.off('ticketUpdated');
      socket.off('ticketMessage');
      socket.off('ticketTaken');
    };
  }, [socket, selectedTicket]);

  // При монтировании компонента, если в localStorage сохранен тикет, сразу присоединяемся к нему
  useEffect(() => {
    const storedTicketId = localStorage.getItem('selectedTicketId');
    if (storedTicketId) {
      const ticket = tickets.find(t => t.ticketId === storedTicketId);
      if (ticket) {
        setSelectedTicket(ticket);
        socket.emit('joinTicket', storedTicketId);
      }
    }
  }, [tickets, socket]);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    localStorage.setItem('selectedTicketId', ticket.ticketId);
    // Присоединяемся к комнате тикета и запрашиваем историю сообщений
    socket.emit('joinTicket', ticket.ticketId);
  };

  const handleTakeTicket = () => {
    if (selectedTicket && !selectedTicket.admin) {
      socket.emit('takeTicket', selectedTicket.ticketId);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (selectedTicket && inputMsg.trim() !== '') {
      socket.emit('ticketMessage', {
        ticketId: selectedTicket.ticketId,
        message: inputMsg,
        sender: adminNickname
      });
      setInputMsg('');
    }
  };

  return (
    <div className="admin-support">
      <h2>Поддержка (Админ)</h2>
      <div className="admin-container">
        <div className="ticket-list">
          <h3>Список заявок</h3>
          {tickets.length === 0 ? (
            <p>Нет заявок.</p>
          ) : (
            <ul>
              {tickets.map(ticket => (
                <li
                  key={ticket.ticketId}
                  onClick={() => handleSelectTicket(ticket)}
                  style={{ cursor: 'pointer', background: selectedTicket && selectedTicket.ticketId === ticket.ticketId ? '#ececec' : 'transparent' }}
                >
                  {ticket.topic} - {ticket.urgency} {ticket.admin ? `(Взята: ${ticket.admin})` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="chat-section">
          {selectedTicket ? (
            <div>
              <h3>Чат заявки: {selectedTicket.ticketId}</h3>
              {!selectedTicket.admin && (
                <button onClick={handleTakeTicket}>Взять заявку</button>
              )}
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
          ) : (
            <div>
              <p>Выберите заявку для начала чата.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportChat;