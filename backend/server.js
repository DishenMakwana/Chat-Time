const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

const app = express();
dotenv.config();

connectDB();

// Production API LOG
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname1, '/frontend/build')));

    app.get('*', (req, res) =>
        res.sendFile(
            path.resolve(__dirname1, 'frontend', 'build', 'index.html')
        )
    );
} else {
    app.get('/', (req, res) => {
        res.send('API is running..');
    });
}

// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`.yellow.bold);
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
    },
});

io.on('connection', (socket) => {
    // console.log('connected');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        // console.log(`Connected - ${userData._id}`);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        // console.log(`Joined - ${room}`);
    });

    socket.on('typing', (room) => {
        socket.in(room).emit('typing');
    });
    socket.on('stop typing', (room) => {
        socket.in(room).emit('stop typing');
    });

    socket.on('new Message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) {
            // console.log('chat.users is undefined');
        }

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) {
                return;
            }

            socket.in(user._id).emit('message received', newMessageReceived);
        });
    });

    socket.off('setup', () => {
        // console.log(`Disconnected - ${userData._id}`);
        socket.leave(userData._id);
    });
});
