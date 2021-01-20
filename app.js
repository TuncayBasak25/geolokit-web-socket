const server = require('pocket-socket');

const members = {};

const chatRooms = {};

server.on('register', (socket, data) => {
  members[data.pk_id] = socket;
  socket.pk_id = data.pk_id;
  socket.send({ method: 'validate' });

  socket.lastActivity = (new Date).getTime();
});

server.on('getChatRoomList', (socket, { memberIdList }) => {console.log("My pk_id: " + socket.pk_id);
  const memberChatRoomList = [];

  for (let i=0; i<memberIdList.length; i++) {
    const other_id = memberIdList[i];
    const roomId = chatRooms[other_id + '-' + socket.pk_id] ? other_id + '-' + socket.pk_id : socket.pk_id + '-' + other_id;

    let room = chatRooms[roomId];

    if (!room) {
      chatRooms[roomId] = {
        memberList: [socket.pk_id, other_id],
        messages: []
      };
      chatRooms[roomId][socket.pk_id] = {
        lastUpdate: 0,
        newMessages: 0,
        lastview: 0
      }
      chatRooms[roomId][other_id] = {
        lastUpdate: 0,
        newMessages: 0,
        lastview: 0
      }

      room = chatRooms[roomId];
    }

    memberChatRoomList.push(room);
  }
  console.log(memberChatRoomList);
  socket.send({ method: 'getChatRoomList', chatRoomList: memberChatRoomList});
});

server.on('readChatRoom', (socket, data) => {console.log('read chat room ', data, chatRooms);
  socket.lastActivity = (new Date).getTime();

  const { other_id } = data;
  const roomId = chatRooms[other_id + '-' + socket.pk_id] ? other_id + '-' + socket.pk_id : socket.pk_id + '-' + other_id;

  if (!other_id) { console.log(other_id + " other_id"); return; }


  chatRooms[roomId][other_id].newMessages = 0;
  chatRooms[roomId][other_id].lastUpdate = (new Date).getTime();
  chatRooms[roomId][other_id].lastview = (new Date).getTime();

  if (members[other_id] && members[other_id].readyState === 1) members[other_id].send({ method: 'message-view', other_id: socket.pk_id });
});


server.on('message', (socket, data) => {
  socket.lastActivity = (new Date).getTime();

  const { other_id, text} = data.message;
  const roomId = chatRooms[other_id + '-' + socket.pk_id] ? other_id + '-' + socket.pk_id : socket.pk_id + '-' + other_id;

  const time = (new Date).getTime();

  const message = {
    text: text,
    source_id: socket.pk_id,
    other_id: other_id,
    date: time
  };

  chatRooms[roomId].messages.push(message);
  chatRooms[roomId][socket.pk_id].lastUpdate = time;
  chatRooms[roomId][socket.pk_id].lastview = time;
  chatRooms[roomId][socket.pk_id].newMessages++;

  if (members[other_id]) members[other_id].send({ method: 'message', message: message });

  socket.send({ method: 'message', message: message });
});

server.on('getOnlines', (socket, data) => {
  const time = (new Date).getTime();
  const onlineMemberIdList = Object.values(members).filter(member => time - member.lastActivity < 60000).map(member => member.pk_id);

  socket.send(onlineMemberIdList);
});
