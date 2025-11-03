const request = require('supertest');
const app = require('../app');
const db = require('./setup');

beforeAll(async ()=> await db.connect());
afterAll(async ()=> await db.closeDatabase());
afterEach(async ()=> await db.clearDatabase());

async function register(name,email){
  const res = await request(app).post('/api/auth/register').send({ name, email, password: 'password' });
  return res.body.token;
}

describe('Group & Expenses', ()=>{
  test('create group, add member, add expense, settlements', async ()=>{
    const tokenA = await register('A','a@test.com');
    const tokenB = await register('B','b@test.com');

    const g = await request(app).post('/api/groups').set('authorization', `Bearer ${tokenA}`).send({ name: 'Trip' });
    expect(g.statusCode).toBe(201);
    const groupId = g.body.group._id;

    // add member B
    const add = await request(app).post(`/api/groups/${groupId}/members`).set('authorization', `Bearer ${tokenA}`).send({ email: 'b@test.com' });
    expect(add.statusCode).toBe(200);

    // A create expense of 100 paid by A split equal between A and B
    const membersRes = await request(app).get(`/api/groups/${groupId}`).set('authorization', `Bearer ${tokenA}`);
    const members = membersRes.body.group.members;
    const splits = members.map(m => ({ user: m._id, share: 50 }));
    const expense = await request(app).post(`/api/groups/${groupId}/expenses`).set('authorization', `Bearer ${tokenA}`).send({ title: 'Dinner', amount: 100, paidBy: members[0]._id, splitType: 'custom', splits });
    expect(expense.statusCode).toBe(201);

    const settlements = await request(app).get(`/api/groups/${groupId}/settlements`).set('authorization', `Bearer ${tokenA}`);
    expect(settlements.statusCode).toBe(200);
    // expected: B pays A 50
    expect(settlements.body.settlements.length).toBeGreaterThan(0);
    const s = settlements.body.settlements[0];
    expect([s.from, s.to]).toContain(members[1]._id);
  });
});