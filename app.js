const server = require('pocket-socket');

const members = {};

const chatRooms = {};

server.on('register', (socket, data) => {
  members[data.pk_id] = socket;
  socket.pk_id = data.pk_id;
});

server.on('getChatRoomList', (socket, data) => {
  const memberChatRoomList = [];
  Object.entries(chatRooms).forEach(([roomName, chatRoom]) => {
    const memberList = roomName.split('-');
    if (memberList.includes(socket.pk_id.toString())) memberChatRoomList.push(chatRoom)
  });

  socket.send({ method: 'getChatRoomList', chatRoomList: memberChatRoomList});
});

server.on('readChatRoom', (socket, data) => {
  const { other_id } = data;
  const roomId = chatRooms[other_id + '-' + socket.pk_id] ? other_id + '-' + socket.pk_id : socket.pk_id + '-' + other_id;

  if (!chatRooms[roomId]) {
    chatRooms[roomId] = {
      memberList: [socket.pk_id, other_id],
      messages: []
    };
    chatRooms[roomId][socket.pk_id] = {
      lastUpdate: 0,
      newMessages: 0
    }
    chatRooms[roomId][other_id] = {
      lastUpdate: 0,
      newMessages: 0
    }
  }

  chatRooms[roomId][other_id].newMessages = 0;
});


server.on('message', (socket, data) => {
  const { other_id, text} = data.message;
  const roomId = socket.pk_id + '-' + other_id;

  const time = (new Date).getTime();

  const message = {
    text: text,
    source_id: socket.pk_id,
    other_id: other_id,
    date: time
  };

  chatRooms[roomId].messages.push(message);
  chatRooms[roomId][socket.pk_id].lastUpdate = time;
  chatRooms[roomId][socket.pk_id].newMessages++;

  if (members[other_id]) members[other_id].send({ method: 'message', message: message });

  socket.send({ method: 'message', message: message });
});
