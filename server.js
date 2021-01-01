var express = require('express');

var app = express();

var server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

console.log('Server running');

var socket = require('socket.io');

var io = socket(server);

const { v4: uuidv4 } = require('uuid');

/* server code */

const WAITING = 'waiting';
const DRAWING_DICE = 'drawing dice';
const MOVING = 'moving';

class Room {
    constructor(_id) {
        this.id = _id;
        this.players = [];
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
        myRoom.players.push(socket.id);
        socket.join(myRoom.id);
        socket.emit('joinSuccess', myRoom.players.length);
        socket.to(myRoom.id).emit('newUser');
        console.log('User', socket.id, 'has joined room', myRoom.id, '. The room contains', myRoom.players.length, 'player');

        if (myRoom.players.length == 2) {
          io.to(myRoom.players[Math.floor(Math.random() * 2)]).emit('setPlayerState', DRAWING_DICE);
        }
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
        let idx;
        if ((idx = myRoom.players.indexOf(socket.id)) != -1) {
          myRoom.players.splice(idx, 1);
          console.log('Deleted player', socket.id, 'from room', myRoom.id);
        }
        if (myRoom.nbPlayers <= 0) {
          if ((idx = rooms.indexOf(myRoom)) != -1) {
            console.log('Room', myRoom.id, 'has been deleted due to inactivity');
            rooms.splice(idx, 1);
          }
        }
    });

    /* GAME NETWORK */
    socket.on('sendDiceValues', (diceValues, totalDicesValue) => {
      socket.to(myRoom.id).emit('receiveDiceValues', diceValues, totalDicesValue);
    });

    socket.on('sendBoard', (board) => {
      socket.to(myRoom.id).emit('receiveBoard', board);
    });

    socket.on('sendNbPieces', (nbPieces) => {
      socket.to(myRoom.id).emit('receiveNbPieces', nbPieces);
    });

    socket.on('nextTurn', () => {
      socket.to(myRoom.id).emit('setPlayerState', DRAWING_DICE);
    });
});