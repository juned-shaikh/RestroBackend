const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { app, setSocketIO } = require('./app');

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Set the io instance for use in middleware
setSocketIO(io);

// Socket setup
io.on('connection', (socket) => {
  console.log('✅ Socket client connected');
  socket.on('join-restaurant-room', (restaurantId) => {
    socket.join(restaurantId);
    console.log(`📡 Joined room: ${restaurantId}`);
  });
  socket.on('disconnect', () => {
    console.log('❌ Socket client disconnected');
  });
});

// Mongo connection + start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 3000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
    );
  })
  .catch(err => console.error('❌ MongoDB error:', err));
