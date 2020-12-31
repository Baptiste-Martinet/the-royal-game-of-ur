var express = require('express');

var app = express();

var server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

console.log('Server running');

var socket = require('socket.io');

var io = socket(server);

const { v4: uuidv4 } = require('uuid');

/* server code */

class Room {
    constructor(_id) {
        this.id = _id;
        this.nbPlayers = 0;
    }
}

var rooms = [];

function getRoomById(id)
{
    let len = rooms.length;

    for (let i = 0; i < len; ++i) {
        if (rooms[i].id == id)
            return rooms[i];
    }
    return null;
}

io.sockets.on('connection', (socket) => {
    console.log('new user:', socket.id);

    var myRoom = null;

    socket.on('createRoom', () => {
        let newRoomId = uuidv4();
        rooms.push(new Room(newRoomId)); //la stocker dans un array
        console.log('New room created with id', newRoomId);
        socket.emit('joinedRoom', newRoomId); //envoyer l'event au client qu'il peu rejoindre la room
    });

    socket.on('joinRoom', (id) => {
        if (!(myRoom = getRoomById(id))) {
            console.log('User tried to connect to non existent room', id);
            socket.emit('joinError');
            return;
        }
        myRoom.nbPlayers++;
        socket.join(myRoom.id);
        socket.emit('joinSuccess');
        console.log('User', socket.id, 'has joined room', myRoom.id, '. The room contains', myRoom.nbPlayers, 'player');
    });

    socket.on('sendMouseMoved', (mouseX, mouseY, CELL_SIZE) => {
        if (myRoom === null)
            return;
        socket.to(myRoom.id).emit("eventMouseMoved", mouseX, mouseY, CELL_SIZE);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected.', socket.id);

        if (myRoom === null) {
            return;
        }
        myRoom.nbPlayers--;
        if (myRoom.nbPlayers <= 0) {
          let idx;
          if ((idx = rooms.indexOf(myRoom)) != -1) {
            console.log('Room', myRoom.id, 'has been deleted due to inactivity');
            rooms.splice(idx, 1);
          }
        }
    });
});