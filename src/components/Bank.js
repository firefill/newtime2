// src/components/Bank.js
import React, { useState, useEffect } from 'react';

const Bank = () => {
  const [balance, setBalance] = useState(0);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  // Загружаем баланс AR при монтировании компонента
  const fetchBalance = () => {
    fetch('http://localhost:5002/api/bank', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setBalance(data.ar))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Обработка перевода
  const handleTransfer = (e) => {
    e.preventDefault();
    fetch('http://localhost:5002/api/bank/transfer', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverNickname: receiver, amount: Number(amount) })
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        fetchBalance();
      })
      .catch((err) => {
        console.error(err);
        setMessage("Ошибка перевода");
      });
  };

  // Заглушка для вывода AR
  const handleWithdraw = () => {
    fetch('http://localhost:5002/api/bank/withdraw', { method: 'POST', credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error(err);
        setMessage("Ошибка вывода");
      });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Банк</h2>
      <p>Ваш баланс: {balance} AR</p>
      <form onSubmit={handleTransfer} style={{ marginBottom: '20px' }}>
        <div>
          <label>Получатель (никнейм): </label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            required
            style={{ padding: '5px', margin: '5px 0' }}
          />
        </div>
        <div>
          <label>Сумма перевода: </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ padding: '5px', margin: '5px 0' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 12px', marginRight: '10px' }}>
          Перевести AR
        </button>
      </form>
      <button onClick={handleWithdraw} style={{ padding: '8px 12px' }}>
        Снять AR
      </button>
      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
};

export default Bank;