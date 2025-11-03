const request = require('supertest');
const app = require('../app');
const db = require('./setup');

beforeAll(async ()=> await db.connnect());
afterAll(async ()=> await db.closeDatabase());
afterEach(async ()=> await db.clearDatabase());

describe('Auth', ()=>{
  test('register -> login -> me', async ()=>{
    const reg = await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'alice@test.com', password: 'password' });
    expect(reg.statusCode).toBe(201);
    expect(reg.body.token).toBeDefined();
    const token = reg.body.token;

    const me = await request(app).get('/api/users/me').set('authorization', `Bearer ${token}`);
    expect(me.statusCode).toBe(200);
    expect(me.body.user.email).toBe('alice@test.com');

    const login = await request(app).post('/api/auth/login').send({ email: 'alice@test.com', password: 'password' });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeDefined();
  });

  test('cannot register duplicate email', async ()=>{
    await request(app).post('/api/auth/register').send({ name: 'A', email: 'a@test.com', password: 'password' });
    const res = await request(app).post('/api/auth/register').send({ name: 'B', email: 'a@test.com', password: 'password2' });
    expect(res.statusCode).toBe(400);
  });
});