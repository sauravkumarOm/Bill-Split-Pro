/**
 * Integration test for Socket.io real-time events
 * Uses Jest + Supertest + socket.io-client + in-memory MongoDB
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const http = require('http');
const request = require('supertest');
const { io: Client } = require('socket.io-client');
const app = require('../src/app'); // adjust path if needed
const { Server } = require('socket.io');

// Models
const Expense = require('../src/models/Expense');

let mongoServer, server, io, clientSocket;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create temporary server with Socket.io
  server = http.createServer(app);
  io = new Server(server, { cors: { origin: '*' } });
  app.set('io', io);

  io.on('connection', (socket) => {
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
    });
  });

  await new Promise((resolve) => server.listen(0, resolve)); // dynamic port
  const port = server.address().port;

  // Connect test socket client
  clientSocket = new Client(`http://localhost:${port}`, {
    transports: ['websocket'],
  });

  await new Promise((resolve) => clientSocket.on('connect', resolve));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  clientSocket.close();
  io.close();
  server.close();
});

test('should emit "new_expense" event when expense is added', async () => {
  const groupId = new mongoose.Types.ObjectId().toString();
  const userId = new mongoose.Types.ObjectId().toString();

  // Join group room
  clientSocket.emit('join_group', groupId);

  const receivedEvents = [];
  clientSocket.on('new_expense', (data) => {
    receivedEvents.push(data);
  });

  // Create expense route mock
  app.post(`/api/groups/${groupId}/expenses`, async (req, res) => {
    const io = req.app.get('io');
    const expense = await Expense.create({
      group: groupId,
      description: 'Test Dinner',
      amount: 250,
      paidBy: userId,
      splitBetween: [userId],
    });
    io.to(groupId).emit('new_expense', { expense });
    res.status(201).json({ success: true, expense });
  });

  // Send API request
  await request(app)
    .post(`/api/groups/${groupId}/expenses`)
    .send({
      description: 'Test Dinner',
      amount: 250,
      paidBy: userId,
      splitBetween: [userId],
    })
    .expect(201);

  // Wait for Socket.io event
  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(receivedEvents.length).toBe(1);
  expect(receivedEvents[0].expense.description).toBe('Test Dinner');
});
