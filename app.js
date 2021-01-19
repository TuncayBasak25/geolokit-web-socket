const server = require('pocket-socket');


server.on('message', (socket, data) => {
  const clientList = Object.values(socket.clients); //Get the list of all connected clients

  for (let i=0; i<clientList.length; i++) {
    clientList[i].send({ method: 'message', message: data.message });
  }
});
