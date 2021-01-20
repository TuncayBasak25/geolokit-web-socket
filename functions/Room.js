function Room (id1, id2) {
  const room = {
    memberList: [id1, id2],
    messages: []
  };
  room[id1] = {
    lastUpdate: 0,
    newMessages: 0,
    lastview: 0
  }
  room[id2] = {
    lastUpdate: 0,
    newMessages: 0,
    lastview: 0
  }

  return room;
}

module.exports = {
  Room
}
