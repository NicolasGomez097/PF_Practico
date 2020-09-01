const { Socket } = require('net');
const COMMANDS = require('./Commands');
const Utils = require('./Utils');
let clients = {};
let maxClients = 10;

const anonimousPromp = 'anónimo > ';

/**
 *
 * @param {Socket} socket
 */
const getNickname = function (socket) {
  let nickname;
  let socketUser;
  Object.keys(clients).forEach((nick) => {
    socketUser = clients[nick];
    if (
      socket.remoteAddress === socketUser.remoteAddress &&
      socket.remotePort === socketUser.remotePort
    ) {
      nickname = nick;
      return false;
    }
  });
  return nickname;
};

/**
 *
 * @param {String} nickname
 * @param {Socket} socket
 */
const isLogged = function (nickname, socket) {
  if (clients[nickname]) return true;

  let username = getNickname(socket);
  if (username) return true;

  return false;
};

/**
 *
 * @param {Array<String>} parts
 * @param {Socket} socket
 */
const loginSession = function (nickname, socket) {
  if (!nickname || nickname === '')
    return Utils.throwError('El usuario no es correcto', socket);

  if (isLogged(nickname, socket))
    return Utils.throwError('Ya esta logueado', socket);

  if (clients.length >= maxClients)
    return Utils.throwError(
      'El servidor alcanzó la cantidad máxima de usuarios',
      socket
    );

  clients[nickname] = socket;
  return true;
};

/**
 *
 * @param {Socket} socket
 */
const logoutSession = function (socket) {
  let nickname = getNickname(socket);
  if (!nickname) return Utils.throwError('No estas logueado', socket);
  delete clients[nickname];

  return true;
};

const closeConection = function (socket) {
  let nickname = getNickname(socket);
  removeClient(nickname);
  socket.end();
};

const removeClient = function (username) {
  if (username) delete clients[username];
};

/**
 *
 * @param {String} dest nombre de usuario destino
 * @param {String} msg mensaje para el usuario destino
 * @param {Socket} socket socket del usuario origen
 * @param {String} userFrom nombre de usuario de origen
 */
const msgTo = function (dest, msg, socket, userFrom) {
  let from;

  if (userFrom && clients[userFrom]) from = userFrom;
  else from = getNickname(socket);

  if (!from) return Utils.throwError('No estas logueado', socket);
  if (!clients[dest])
    return Utils.throwError('No existe el usuario destino', socket);

  if (from == dest) return;

  clients[dest].write(
    `${Utils.breakChar} MSG FROM ${from}: ${msg} ${Utils.breakChar}`
  );
  return true;
};

/**
 *
 * @param {String} dest
 * @param {String} msg
 * @param {Socket} socket
 */
const msg = function (msg, socket) {
  let from = getNickname(socket);

  if (!from) return Utils.throwError('No estas logueado', socket);

  Object.keys(clients).forEach((destination) => {
    msgTo(destination, msg, socket, from);
  });

  return true;
};

/**
 *
 * @param {Socket} socket
 * @param {String} command
 */
const showHelp = function (socket, command) {
  if (command) {
    let cmd = command.toUpperCase();
    let description = COMMANDS[cmd];
    if (!description) return Utils.throwError('Comando no encontrado', socket);

    Utils.sendMsg(
      `${cmd}: ${description.desc} ${Utils.breakChar} Formato: ${description.format}` +
        Utils.breakChar,
      socket,
      ''
    );
    return true;
  }

  let list =
    Utils.breakChar +
    'Mas informacion: HELP {command}' +
    Utils.breakChar +
    Utils.breakChar;

  Object.keys(COMMANDS).forEach((command) => {
    list += `${command}: ${COMMANDS[command].desc}` + Utils.breakChar;
  });

  Utils.sendMsg(list, socket, '');
  return true;
};

const listClients = function (socket) {
  let list = '';

  Object.keys(clients).forEach((usernames) => {
    list += usernames + Utils.breakChar;
  });
  if (list == '') Utils.sendMsg('No hay usuarios registrados', socket);
  else Utils.sendMsg(list, socket);
  return true;
};

/**
 *
 * @param {String} comando
 * @param {Socket} socket
 */
const procesarComando = function (comando, socket) {
  let fullCommand = comando.replace(/\r?\n|\r/g, '').trim();
  let parts = Utils.divideFirstSpace(fullCommand);
  let command;
  let parameters;
  let username = getNickname(socket);

  if (parts.length == 2) {
    // Liempieza de los parametros
    command = parts[0].toUpperCase();
    parameters = parts[1].replace(/  +/g, ' ');
  } else if (parts.length == 1) {
    command = fullCommand.toUpperCase();
    parameters = '';
  }

  switch (command) {
    case 'LOGIN':
      parameters = parameters.split(' ');
      if (parameters.length != 1) {
        Utils.throwInvalidCommand(socket);
        Utils.sendMsg(
          'La forma correcta es: ' + COMMANDS['LOGIN'].format,
          socket
        );
        return;
      }
      if (loginSession(parameters[0], socket)) {
        Utils.sendMsg('OK', socket);
        username = parameters[0];
        socket.on('end', () => {
          removeClient(username);
        });
      }
      break;

    case 'LOGOUT':
      if (logoutSession(socket)) {
        Utils.sendMsg('OK', socket);
        username = '';
      }
      break;

    case 'MSG':
      if (parameters.length === 0) {
        Utils.throwInvalidCommand(socket);
        Utils.sendMsg(
          'La forma correcta es: ' + COMMANDS['MSG'].format,
          socket
        );
        return;
      }
      if (msg(parameters, socket)) Utils.sendMsg('OK', socket);

      break;

    case 'MSG_TO':
      parameters = Utils.divideFirstSpace(parameters);
      if (parameters.length != 2) {
        Utils.throwInvalidCommand(socket);
        Utils.sendMsg(
          'La forma correcta es: ' + COMMANDS['MSG_TO'].format,
          socket
        );
        return;
      }
      if (msgTo(parameters[0], parameters[1], socket, username))
        Utils.sendMsg('OK', socket);
      break;

    case 'LS':
      listClients(socket);
      break;

    case 'HELP':
      showHelp(socket, parameters);
      break;

    case 'EXIT':
      closeConection(socket);
      return;

    default:
      console.log(`Invalid Command: ${command}, ${parameters}`);
      Utils.throwInvalidCommand(socket);
      Utils.sendMsg('Comando "HELP" para mas información', socket);
  }

  if (username) Utils.sendMsg(Utils.breakChar + username + ' > ', socket, '');
  else Utils.sendMsg(Utils.breakChar + anonimousPromp, socket, '');
};

module.exports = {
  procesarComando,
  anonimousPromp,
};
