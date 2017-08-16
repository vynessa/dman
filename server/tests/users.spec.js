import request from 'supertest';
import { assert } from 'chai';
import app from '../../build/server';
import { User } from '../models';

const api = request(app);

let token, role, fullName, email, password;

describe('Users Controller Test suite', () => {
  beforeEach((done) => {
    api
      .post('/api/v1/users/auth/login')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({
        email: 'inftttttttt@admin.com',
        password: 'adminhere'
      })
      .expect(200)
      .end((err, res) => {
        if (!err) {
          token = res.body.token;
          email = res.body.email;
          password = res.body.password;
          role = res.body.role;
        }
        done();
      }, 500000);
  });

  describe('POST `/api/v1/users/auth/register`', () => {
    it('should respond with an error if the email exists', (done) => {
      api
        .post('/api/v1/users/auth/register')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Vanessa Willams',
          email: 'info@admin.com',
          password: 'vanessa'
        })
        .expect(409)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'This user already exists!');
          }
          done();
        });
    });
  });

  describe('POST `/api/v1/users/auth/login`', () => {
    it('should respond with ok when a user is successfully logged in', (done) => {
      api
        .post('/api/v1/users/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'info@admin.com',
          password: 'adminhere'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Login successful! :)');
          }
          done();
        });
    });

    it('should respond with 400 when the password is incorrect', (done) => {
      api
        .post('/api/v1/users/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'info@admin.com',
          password: 'hnbnhg'
        })
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Incorrect email or password');
          }
          done();
        });
    });

    it('should respond with 404 if the email does not exist', (done) => {
      api
        .post('/api/v1/users/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'vanessa.wiliams@gmail.com',
          password: 'vanessa'
        })
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Incorrect email or password');
          }
          done();
        });
    });
  });
});

