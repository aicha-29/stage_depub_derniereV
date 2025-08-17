let ioInstance;

const setIo = (io) => {
  ioInstance = io;
};

const getIo = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO non initialisé");
  }
  return ioInstance;
};

module.exports = { setIo, getIo };