/* global */
import request from 'supertest';
import { assert } from 'chai';
import app from '../server';
import { User } from '../models';

const api = request(app);

let token, role, fullName, email, password;

describe('Users Controller Test suite', () => {
  beforeEach((done) => {
    api
    .post('/api/v1/users/auth/register')
    .send({
      fullName: 'Treasure Ejikeme',
      email: 'treasure.ejikeme@gmail.com',
      password: 'treasure'
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (!err) {
        token = res.body.token;
        fullName = res.body.user.fullName;
        email = res.body.user.email;
        password = res.body.user.password;
        done();
      }
    });

    api
      .post('/api/v1/users/auth/login')
      .send({
        email: 'vanessa.williams@gmail.com',
        password: 'vanessa',
        role: 'admin'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          token = res.body.token;
          email = res.body.email;
          password = res.body.password;
          role = res.body.role;
          done();
        }
      });
  });

  // describe('Set Authorization token', () => {
  //   it('should get a valid token for user', (done) => {
  //     api
  //       .post('/api/v1/users/auth/register')
  //       .set('Authorization', `${token}`)
  //       .expect(200, done);
  //   });
  // });
  describe('POST `/api/v1/users/auth/register`', () => {
    it('should respond with ok when a user is successfully created', (done) => {
      api
        .post('/api/v1/users/auth/register')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Vanessa Willams',
          email: 'vanessa.williams@gmail.com',
          password: 'vanessa'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'User created successfully!');
          }
          done();
        });
    });
  });

  describe('GET `/api/v1/users`', () => {
    it('should respond with ok when user role equals `admin`', (done) => {
      api
        .get('/api/v1/users')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert.isDefined(res.body);
            // assert(res.decoded.role === 'admin');
          }
          done();
        });
    });

    it('should respond with Unauthorized acess', (done) => {
      api
        .get('/api/v1/users')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  describe('POST `/api/v1/users/auth/login`', () => {
    it('should respond with ok when a user is succefully logged in', (done) => {
      api
        .post('/api/v1/users/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'vanessa.williams@gmail.com',
          password: 'vanessa'
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
          email: 'vanessa.williams@gmail.com',
          password: 'hnbnhg'
        })
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Invalid password');
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
          email: 'vanessa.wiliams@gmail.com',
          password: 'vanessa'
        })
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Sorry, the email does not exist!');
          }
          done();
        });
    });
  });
});
