const net = require('net');
const chat = require('./chat');

const server = net.createServer((socket) => {
  socket.write(chat.anonimousPromp);

  socket.on('data', (data) => {
    chat.procesarComando(data.toString(), socket);
  });
});

server.on('close', () => {
  console.log('Se cerró el server');
});
server.on('listening', () => {
  console.log('Se esta escuchando en 8080');
});
server.listen(8080);
