const { default: mongoose } = require('mongoose');
const request = require('supertest');
const app = require('..');
const { DBURI_TEST } = require('../src/config/env');

describe('Posts service', () => {
  let token, sessionCookie, userId, postId;
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

  it('POST /signup create new user before manipulate posts', async () => {
    const response = await request(app).post('/signup').send({
      name: 'cupCake',
      email: 'cup-cake@oven.com',
      password: '1234',
    });

    expect(response.status).toEqual(201);
    expect(response.body.data).toEqual(
      jasmine.objectContaining({ name: 'cupCake', email: 'cup-cake@oven.com' })
    );
    token = response.body.data.token;
    sessionCookie = response.headers['set-cookie'].find((e) => e.split('=')[0] === 's_id');
    userId = response.body.data._id;
  });

  it('POST /posts res.title should exist and a new post was created', async () => {
    const response = await request(app)
      .post('/posts')
      .set({ Authorization: `Bearer ${token}` })
      .set('Cookie', sessionCookie)
      .send({
        title: 'post-title',
        content: 'post-content post-content post-content',
      });

    expect(response.status).toEqual(201);
    expect(response.body.data).toEqual(
      jasmine.objectContaining({ title: 'post-title', ownerId: userId })
    );
    postId = response.body.data._id;
  });

  it('GET /posts res.body should represent first page of posts', async () => {
    const response = await request(app).get('/posts');

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(
      jasmine.objectContaining({ page_info: { total: 1, page: 1 } })
    );
  });

  it('PUT /posts/:post_id res.title should exist and updated', async () => {
    const response = await request(app)
      .put('/posts/' + postId)
      .set({ Authorization: `Bearer ${token}` })
      .set('Cookie', sessionCookie)
      .send({
        title: 'title-updated',
        content: 'content-updated content-updated content-updated',
      });

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(
      jasmine.objectContaining({ title: 'title-updated', ownerId: userId })
    );
  });

  it('DELETE /posts/:post_id res.body.data should be a message indicating to the post has been deleted', async () => {
    const response = await request(app)
      .delete('/posts/' + postId)
      .set({ Authorization: `Bearer ${token}` })
      .set('Cookie', sessionCookie);

    expect(response.status).toEqual(200);
  });
});
