/* global */
import request from 'supertest';
import app from '../server/server';

const api = request(app);

describe('', () => {
  describe('', () => {
    it('should respond with all users', (done) => {
      api
        .get('/api/v1/users')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, done);
    });
  });
});
