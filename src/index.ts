import express, {Application} from 'express'
import http from 'http'
import socketio from 'socket.io'

const app: Application = express()
const server: http.Server = http.createServer(app);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// @ts-ignore
const socket = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

app.get('/', (req: any, res: any) => {
    res.send("Hello it's your server.");
});

const messages: any = [];
const usersState = new Map()

socket.on('connection', (socketChannel: any) => {
    usersState.set(socketChannel, {id: new Date().getTime().toString(), name: 'anonym'})

    socket.on('disconnect', () => {
        usersState.delete(socketChannel)
    })

    socketChannel.on('client-name-sent', (name: string) => {
        const user = usersState.get(socketChannel)
        user.name = name
    })

    socketChannel.on('client-message-sent', (message: string) => {
        const user = usersState.get(socketChannel)

        const messageItem = {message, id: '23f2311' + new Date().getTime(),
            user: {id: user.id, name: user.name}}
        messages.push(messageItem)

        socket.emit('new-massage-sent', messageItem)
    })

    socketChannel.emit('init-messages-published', messages)

    console.log('a user connected')
})

const PORT = process.env.PORT || 3009

server.listen(PORT, () => {
    console.log('listening on *:3009');
});