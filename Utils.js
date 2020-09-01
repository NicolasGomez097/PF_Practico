const breakChar = '\r\n';

/**
 * Funcion para enviar un mensaje de error por el socket
 * @param {*} msg El mensaje.
 * @param {*} socket El socket donde enviar.
 * @returns False
 */
const throwError = function (msg, socket) {
  socket.write('ERR: ' + msg + breakChar);
  return false;
};

/**
 * Funcion para enviar el mensaje de error de comando invalido
 * @param {*} socket El socket por donde enviar
 */
const throwInvalidCommand = function (socket) {
  socket.write('ERR: Comando invalido' + breakChar);
};

/**
 * Funcion para mandar un mensaje a travez del socket
 * @param {*} msg Mensaje
 * @param {*} socket El socket
 * @param {*} endline El caracter de final de linea.
 */
const sendMsg = function (msg, socket, endline = breakChar) {
  socket.write(msg + endline);
};

/**
 * Funcion para partir un String en dos partes a partir del primer espacio
 * @param {String} command
 */
const divideFirstSpace = function (string) {
  let str = string.trim();
  let firstSpace = str.indexOf(' ');
  if (firstSpace != -1) {
    let first = str.substring(0, firstSpace);
    let second = str.substring(firstSpace + 1).trim();

    return [first, second];
  }

  return [str];
};

module.exports = {
  breakChar,
  throwError,
  throwInvalidCommand,
  sendMsg,
  divideFirstSpace,
};
