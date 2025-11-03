require('dotenv').config();
const app = require('./app');
const mongoose =  require('mongoose');
const http = require('http');
const {Server} = require('socket.io');

const PORT = process.env.PORT || 5000;

const start = async () =>{
    try{
        const uri = process.env.MONGO_URI;
        if(!uri){
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose.connect(uri,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');
        
        const server = http.createServer(app);
        const io = new Server(server,{
            cors: {origin: "*", methods: ["GET", "POST"] }
        });

        io.on('connection', (socket)=>{
            console.log('New client connected:', socket.id);

            socket.on('join_group', (groupId)=>{
                socket.join(groupId);
                console.log(`Socket ${socket.id} joined group ${groupId}`);
            });

            socket.on('disconnect', ()=>{
                console.log('Client disconnected:', socket.id);
            });
        });

        app.set('io', io);

        server.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
        })
    }
    catch(err){
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();