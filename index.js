"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index = './index.html';
const port = 8080;
const server = (0, express_1.default)()
    .use((0, cors_1.default)())
    .use((req, res) => res.sendFile(index, { root: __dirname }))
    .listen(port, () => console.log(`listening on port ${port}`));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*'
    }
});
let users = [];
const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};
const getReceiver = (receiverId) => {
    return users.find((user) => user.userId === receiverId);
};
io.on('connection', (socket) => {
    console.log('client connected');
    socket.on('disconnect', () => {
        console.log('disconnect');
    });
    // take userId and socketId from user
    socket.on('addUser', userId => {
        addUser(userId, socket.id);
        io.emit('getUsers', users);
    });
    // send and get message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const receiver = getReceiver(receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit('getMessage', {
                senderId,
                text
            });
        }
    });
    // when disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});
