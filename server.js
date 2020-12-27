var express = require('express');

var app = express();

var server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

console.log('Server running');

var socket = require('socket.io');

var io = socket(server);

/* server code */

io.sockets.on('connection', (socket) => {
    console.log('new user:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected.', socket.id);
    });
});