const { default: mongoose } = require('mongoose');
const request = require('supertest');
const app = require('..');
const { DBURI_TEST } = require('../src/config/env');

describe('Login-Signup service', () => {
  let token, sessionCookie;
  // Drop database after all test
  afterAll((done) => {
    console.log(
      '\x1b[33m%s\x1b[0m',
      `Create a connection to DROP test database after all test case is completed ...`
    );
    const conn = mongoose.createConnection(DBURI_TEST);
    conn.once('connected', () => {
      conn.dropDatabase(() => {
        console.log('\x1b[33m%s\x1b[0m', `DB[${DBURI_TEST.split('/').pop()}] has been droped`);
        done();
      });
    });
  });

  it('POST /signup res.token should exist and the user was created', async () => {
    const response = await request(app).post('/signup').send({
      name: 'cupCake',
      email: 'cup-cake@oven.com',
      password: '1234',
    });

    expect(response.status).toEqual(201);
    expect(response.body.data).toEqual(
      jasmine.objectContaining({ name: 'cupCake', email: 'cup-cake@oven.com' })
    );
  });

  it('POST /login res.token should exist and the user credential is matched', async () => {
    const response = await request(app).post('/login').send({
      email: 'cup-cake@oven.com',
      password: '1234',
    });

    expect(response.status).toEqual(200);
    expect(response.body.data.token).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.body.data).toEqual(
      jasmine.objectContaining({ name: 'cupCake', email: 'cup-cake@oven.com' })
    );
    token = response.body.data.token;
    sessionCookie = response.headers['set-cookie'].find((e) => e.split('=')[0] === 's_id');
  });

  it('PUT /reset-password res.body.data should be message', async () => {
    const response = await request(app)
      .put('/reset-password')
      .set({ Authorization: `Bearer ${token}` })
      .set('Cookie', sessionCookie)
      .send({
        currentPassword: '1234',
        newPassword: '4321',
      });

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual('Password has been changed successfully');
  });

  it('POST /logout res.body.data should be message, user should be logout and set-cookie should be empty', async () => {
    const response = await request(app)
      .post('/logout')
      .set({ Authorization: `Bearer ${token}` })
      .set('Cookie', sessionCookie);

    expect(response.status).toEqual(200);
    expect(response.headers['set-cookie']).toBeDefined();
  });
});
