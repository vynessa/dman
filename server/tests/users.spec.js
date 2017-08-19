import request from 'supertest';
import { assert } from 'chai';
import app from '../../build/server';
import { User } from '../models';

const api = request(app);

let token, userToken, role, fullName, email, password;

describe('Users Controller Test suite', () => {
  beforeEach((done) => {
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
          token = res.body.token;
          email = res.body.email;
          password = res.body.password;
          role = res.body.role;
        }
        done();
      });

    api
      .post('/api/v1/users/auth/login')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({
        email: 'gold.ejikeme@gmail.com',
        password: 'gold'
      })
      .expect(200)
      .end((err, res) => {
        if (!err) {
          userToken = res.body.token;
        } else {
          console.log('--------------');
          const error = new Error("User's details update failed!");
          assert.ifError(error);
        }
        done();
      });
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
          } else {
            console.log('--------------');
            const error = new Error("User's details update failed!");
            assert.ifError(error);
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
          } else {
            console.log('--------------');
            const error = new Error("User's details update failed!");
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with 403 when the password is incorrect', (done) => {
      api
        .post('/api/v1/users/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'info@admin.com',
          password: 'hnbnhg'
        })
        .expect(403)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Incorrect email or password');
          } else {
            console.log('--------------');
            const error = new Error("User's details update failed!");
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with 403 if the email does not exist', (done) => {
      api
        .post('/api/v1/users/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'vanessa.wiliams@gmail.com',
          password: 'vanessa'
        })
        .expect(403)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Incorrect email or password');
          } else {
            console.log('--------------');
            const error = new Error("User's details update failed!");
            assert.ifError(error);
          }
          done();
        });
    });
  });

  describe('PUT `/api/v1/users/:id`', () => {
    it('should respond with 400 if id = ubbcb', (done) => {
      api
        .put('/api/v1/users/ubbcb')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Administrator',
          password: 'adminuser'
        })
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Invalid ID. Please enter a valid ID');
          } else {
            console.log('--------------');
            const error = new Error("User's details update failed!");
            assert.ifError(error);
          }
          done();
        });
    });

    it("should respond with `unauthorized` if a user tries to update another user's profile", (done) => {
      api
        .put('/api/v1/users/2')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Gold Williams',
          email: 'gold@gmail.com',
          password: 'gold'
        })
        .expect(401)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Unauthorized access');
          } else {
            console.log('--------------');
            const error = new Error("User's details update failed!");
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond ok if a user updates his/her profile', (done) => {
      api
        .put('/api/v1/users/1')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Administrator',
          password: 'adminuser'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            console.log('success', res.body);
            assert(res.body.message === 'Profile successfully updated');
          } else {
            console.log(err);
            const error = new Error("User's details update failed!");
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with 404 if the user does not exist', (done) => {
      api
        .put('/api/v1/users/5')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Administrator',
          password: 'adminuser'
        })
        .expect(404)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Sorry, the user does not exist!');
          } else {
            console.log(err);
            const error = new Error("User's details update failed!");
            assert.ifError(error);
          }
          done();
        });
    });
  });

  describe('POST `/api/v1/users/createuser`', () => {
    it('should respond ok if a user is being created by an admin', (done) => {
      console.log('token', token);
      api
        .post('/api/v1/users/createuser')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Femi Medale',
          email: 'femi@gmail.com',
          password: 'fems'
        })
        .expect(201)
        .end((err, res) => {
          if (!err) {
            console.log(res.body);
            assert(res.body.user.email === 'femi@gmail.com');
          } else {
            const error = new Error('User registration failed!');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond unauthorized when a user creates another user', (done) => {
      api
        .post('/api/v1/users/createuser')
        .set('Authorization', `${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Femi Medale',
          email: 'femi@gmail.com',
          password: 'fems'
        })
        .expect(401)
        .end((err, res) => {
          if (!err) {
            assert(
              res.body.message ===
                'Unathorized access! Only an Admin can create a user'
            );
          } else {
            const error = new Error('User registration failed!');
            assert.ifError(error);
          }
          done();
        });
    });
  });

  describe('GET `/api/v1/users/`', () => {
    it('should respond ok if users are found in the database', (done) => {
      api
        .get('/api/v1/users/')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.users.length >= 1);
          } else {
            const error = new Error('User registration failed!');
            assert.ifError(error);
          }
          done();
        });
    });
  });
});
