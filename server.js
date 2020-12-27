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
        let newRoom = new Room(uuidv4()); //creer la room
        rooms.push(newRoom); //la stocker dans un array
        socket.emit('joinedRoom', myRoom); //envoyer l'event au client qu'il peu rejoindre la room
    });

    socket.on('connectToRoom', (id) => {
        if (!(myRoom = getRoomById(id))) {
            console.log('User tried to connect to non existent room', id);
            return;
        }
        socket.join(myRoom.id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected.', socket.id);

        if (myRoom === undefined) {
            return;
        }
        /* TODO room interaction */
    });
});