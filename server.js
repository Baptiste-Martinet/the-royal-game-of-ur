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

    var myRoom = undefined;

    socket.on('createRoom', () => {
        let newRoomId = uuidv4();
        rooms.push(new Room(newRoomId)); //la stocker dans un array
        console.log('New room created with id', newRoomId);
        socket.emit('joinedRoom', newRoomId); //envoyer l'event au client qu'il peu rejoindre la room
    });

    socket.on('joinRoom', (id) => {
        if (!(myRoom = getRoomById(id))) {
            console.log('User tried to connect to non existent room', id);
            return;
        }
        socket.join(myRoom.id);
    });

    socket.on('sendMouseMoved', (mouseX, mouseY) => {
        if (myRoom === undefined)
            return;
        socket.to(myRoom.id).emit("eventMouseMoved", mouseX, mouseY);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected.', socket.id);

        if (myRoom === undefined) {
            return;
        }
        /* TODO room interaction */
    });
});