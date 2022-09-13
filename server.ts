import { Server } from 'socket.io';

// call to socket.io server 
const io = new Server(8900, {
    // allow our app to connect to that server
    cors: {
        origin: "http://localhost:3000"
    }
})

let users: any = []

const addUser = (userId: any, socketId: any) => {
    !users.some((user: any) => user.userId === userId) && 
        users.push({userId, socketId})
}   
 
const removeUser = (socketId: any) => {
    users = users.filter((user: any) => user.socketId !== socketId)
}

const getReceiver = (receiverId: any) => {
    return users.find((user: any) => user.userId === receiverId)
}

io.on('connection', (socket) => {
    // when connect
    console.log('a user connected');

    // take userId and socketId from user
    socket.on('addUser', userId =>  {
        addUser(userId, socket.id)
        io.emit('getUsers', users)
    });

    // send and get message
    socket.on('sendMessage', ({senderId, receiverId, text}) => {
        const receiver = getReceiver(receiverId)
        io.to(receiver.socketId).emit('getMessage', {
            senderId,
            text
        })
    })

    // when disconnect
    socket.on('disconnect', () => { 
        console.log('user disconnected');
        removeUser(socket.id)
        io.emit('getUsers', users)
        
    })
})

 