// config/socket.js
const { Server } = require('socket.io');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  return io;
}

module.exports = initSocket;