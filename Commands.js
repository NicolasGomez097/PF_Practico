// Guia de comandos
const COMMANDS = {
  LOGIN: {
    format: 'LOGIN {username}',
    desc: 'Comando para iniciar sección con un usuario',
  },
  MSG: {
    format: 'MSG {message}',
    desc: 'Comando para mandar un mensaje a todos',
  },
  MSG_TO: {
    format: 'MSG_TO {destination} {message}',
    desc: 'Comando para mandar un mensaje a un usuario en particular',
  },
  LS: {
    format: 'LS',
    desc: 'Comando para mostrar los usuario conectados',
  },
  LOGOUT: {
    format: 'LOGOUT',
    desc: 'Comando para cerrar sección',
  },
  EXIT: {
    format: 'EXIT',
    desc: 'Comando para cerrar la conexión con el servidor',
  },
  HELP: {
    format: 'HELP',
    desc: 'Comando para mostrar ayuda',
  },
};

module.exports = COMMANDS;
