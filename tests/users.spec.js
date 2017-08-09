/* global */
import request from 'supertest';
import app from '../server/server';

const api = request(app);

describe('Users Controller Test suite', () => {
  describe('', () => {
    it('should respond with ok', (done) => {
      api
        .get('/api/v1/users/auth/register')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, done);
    });
  });
});
