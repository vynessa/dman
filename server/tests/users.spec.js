import request from 'supertest';
import { assert } from 'chai';
import app from '../../build/server';
import { User } from '../models';

const api = request(app);

let token, userToken, invalidToken, role, fullName, email, password;

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
        }
        done();
      });
  });

  describe('GET `/api/v1/`', () => {
    it('should respond with a welcome message', (done) => {
      api
        .get('/api/v1/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Welcome to the dMan API!');
          }
          done();
        });
    });
  });

  describe('POST `/api/v1/users/auth/register`', () => {
    it('should respond with `conflict` error if the email exists', (done) => {
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
            const error = new Error('Registration error');
            assert.ifError(error);
          }
          done();
        });
    });
  });

  describe('POST `/api/v1/users/auth/login`', () => {
    it('should respond with `OK` when a user is successfully logged in', (done) => {
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
            assert(res.body.user.name === 'Admin');
          } else {
            const error = new Error('Login error');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `Forbidden` when the password is incorrect', (done) => {
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
            const error = new Error('Login error');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `Forbidden` if the email does not exist', (done) => {
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
            const error = new Error('Login error');
            assert.ifError(error);
          }
          done();
        });
    });
  });

  describe('PUT `/api/v1/users/:id`', () => {
    it('should respond with `Bad request` if the id equals a non-integer', (done) => {
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
            const error = new Error('User\'s profile update failed!');
            assert.ifError(error);
          }
          done();
        });
    });

    it("should respond with `Unauthorized` if a user tries to update another user's profile", (done) => {
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
            assert(res.body.message === 'Unauthorized access ¯¯|_(ツ)_|¯¯');
          } else {
            const error = new Error('User\'s profile update failed!');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `OK` if a user updates his/her profile', (done) => {
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
            assert(res.body.message === 'Profile successfully updated');
          } else {
            const error = new Error('User\'s profile update failed!');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `Conflict` if a user updates his/her email with an existing email', (done) => {
      api
        .put('/api/v1/users/1')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'info@admin.com',
        })
        .expect(409)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'This email already exists!');
          } else {
            const error = new Error('User\'s profile update failed!');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `Not found` if the user does not exist', (done) => {
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
            const error = new Error('User\'s profile update failed!');
            assert.ifError(error);
          }
          done();
        });
    });
  });

  describe('POST `/api/v1/users/createuser`', () => {
    invalidToken = 'hscuftcbcjk';

    it('should respond with `OK` if a user is being created by an admin', (done) => {
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
            assert(res.body.user.email === 'femi@gmail.com');
          } else {
            const error = new Error('User registration failed!');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `Bad request` if an invalid token is being set', (done) => {
      api
        .post('/api/v1/users/createuser')
        .set('Authorization', `${invalidToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Femi Medale',
          email: 'femi@gmail.com',
          password: 'fems'
        })
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Invalid token. Please login :)');
          } else {
            const error = new Error('User registration failed!');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `Unauthorized` if no token is being set', (done) => {
      api
        .post('/api/v1/users/createuser')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Femi Medale',
          email: 'femi@gmail.com',
          password: 'fems'
        })
        .expect(400)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Please set token in the header!');
          } else {
            const error = new Error('User registration failed!');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `Unauthorized` when a user creates another user', (done) => {
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
                'Unathorized access! Only an admin can create a user'
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
    it('should respond with `OK` if the admin queries the database for all users and one or more are found', (done) => {
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
            const error = new Error('Database error');
            assert.ifError(error);
          }
          done();
        });
    });

    it('should respond with `Unauthorized` if a user queries all users', (done) => {
      api
        .get('/api/v1/users/')
        .set('Authorization', `${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Unauthorized access! All users can only be viewed by an admin');
          } else {
            const error = new Error('Database error');
            assert.ifError(error);
          }
          done();
        });
    });
  });

  describe('GET `/api/v1/users/:id`', () => {
    it('should respond with `OK` if a user is found in the database by the id', (done) => {
      api
      .get('/api/v1/users/1')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          assert(res.body.user.id === 1);
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `OK` if the id is a negative integer', (done) => {
      api
      .get('/api/v1/users/-1')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          assert(res.body.user.id === 1);
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `Not found` if the user does not exist', (done) => {
      api
      .get('/api/v1/users/78')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'User not found!');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `Bad request` if the id equals a non-integer', (done) => {
      api
      .get('/api/v1/users/vgcrexe')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Invalid ID. Please enter a valid ID');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });
  });

  describe('GET `/api/v1/search/users`', () => {
    it('should respond with `Bad request` if the query is empty', (done) => {
      api
      .get('/api/v1/search/users/?q=')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Please enter a keyword');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `OK` if the search query returns one or more user', (done) => {
      api
      .get('/api/v1/search/users/?q=admin')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'User found successfully');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `Unauthorized` if a user tries to search for another user', (done) => {
      api
      .get('/api/v1/search/users/?q=admin')
      .set('Authorization', `${userToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Unauthorized access! ¯¯|_(ツ)_|¯¯');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `Not found` if the query returns no user', (done) => {
      api
      .get('/api/v1/search/users/?q=queen')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'User not found!');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });
  });

  describe('DELETE `/api/v1/users/:id`', () => {
    it('should respond with `Bad request` if the id equals a non-integer', (done) => {
      api
      .delete('/api/v1/users/vgcrexe')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Invalid ID. Please enter a valid ID');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `OK` if a user is deleted successfully', (done) => {
      api
      .delete('/api/v1/users/3')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Yipee! User deleted successfully!');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `Not found` if the user to be deleted does not exist', (done) => {
      api
      .delete('/api/v1/users/78')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'User not found! :(');
        } else {
          const error = new Error('Database error');
          assert.ifError(error);
        }
        done();
      });
    });

    it('should respond with `Unauthorized` if a user tries to delete another user', (done) => {
      api
        .delete('/api/v1/users/1')
        .set('Authorization', `${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Unathuorized Access! ¯¯|_(ツ)_|¯¯');
          } else {
            const error = new Error('Database error');
            assert.ifError(error);
          }
          done();
        });
    });
  });
});
