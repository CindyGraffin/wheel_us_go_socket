import { Server } from 'socket.io';
import express, {Request, Response} from 'express';


import cors from 'cors'

const index = './index.html'
const port = 8080;
const server = express()
    .use(cors())
    .use((req: Request, res: Response) => res.sendFile(index, { root: __dirname }))
    .listen(port)

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

let users: any = [] 


const addUser = (userId: any, socketId: any) => {
    if (userId !== null && socketId) {
        !users.some((user: any) => user.userId === userId) && 
        users.push({userId, socketId})
    }   
}

const removeUser = (socketId: any) => {
    users = users.filter((user: any) => user.socketId !== socketId)
} 

const getReceiver = (receiverId: any) => {
    return users.find((user: any) => user.userId === receiverId) 
}

io.on('connection', (socket) => { 
    // take userId and socketId from user
    socket.on('addUser', userId =>  {
        addUser(userId, socket.id)
        io.emit('getUsers', users)
    });

    // send and get message
    socket.on('sendMessage', ({senderId, receiverId, text}) => {
        const receiver = getReceiver(receiverId) 
        const respond = () => setTimeout(() => {
            if (receiver) {
                io.to(receiver.socketId).emit('getMessage', {
                    senderId,
                    text
                })
            }
        }, 800)
        respond()        
    }) 
    // when disconnect
    socket.on('disconnect', () => { 
        removeUser(socket.id)
        
    })
    
})


