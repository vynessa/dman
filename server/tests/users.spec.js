import request from 'supertest';
import { assert } from 'chai';
import app from '../../build/server';

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
        password: 'goldejike'
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Welcome to the dMan API!');
            assert(res.status === 200);
          } else {
            assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'This user already exists!');
            assert(res.status === 409);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });

    it('should respond with `Bad request` error if no email is passed in', (done) => {
      api
        .post('/api/v1/users/auth/register')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Vanessa Willams',
          password: 'vanessa'
        })
        .end((err, res) => {
          if (!err) {
            assert(res.body.errors[0].msg === 'An email is required');
            assert(res.status === 400);
          } else {
            const error = new Error('Registration error');
            assert.ifError(error);
          }
          done();
        });
    });
  });

  describe('POST `/api/v1/users/auth/login`', () => {
    it('should respond with `Bad request` if a user doesn\'t input a password logged in', (done) => {
      api
        .post('/api/v1/users/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'info@admin.com'
        })
        .end((err, res) => {
          if (!err) {
            assert(res.body.errors[0].msg === 'Please enter a password');
            assert(res.status === 400);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });

    it('should respond with `OK` when a user is successfully logged in', (done) => {
      api
        .post('/api/v1/users/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          email: 'info@admin.com',
          password: 'adminhere'
        })
        .end((err, res) => {
          if (!err) {
            assert(res.body.user.fullName === 'Admin');
            assert(res.status === 200);
          } else {
            assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Incorrect email or password');
            assert(res.status === 401);
          } else {
            assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Incorrect email or password');
            assert(res.status === 401);
          } else {
            assert.ifError(err);
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
          password: 'femimedale'
        })
        .end((err, res) => {
          if (!err) {
            assert(res.body.user.email === 'femi@gmail.com');
            assert(res.status === 201);
          } else {
            assert.ifError(err);
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
          fullName: 'Joy Smith',
          email: 'joy@gmail.com',
          password: 'joysmith'
        })
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Invalid token. Please login :)');
            assert(res.status === 400);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });

    it('should respond with `Bad request` if no token is being set', (done) => {
      api
        .post('/api/v1/users/createuser')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Maggie George',
          email: 'maggie@gmail.com',
          password: 'MaggieG'
        })
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Please set token in the header!');
            assert(res.status === 401);
          } else {
            assert.ifError(err);
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
          password: 'famiily'
        })
        .end((err, res) => {
          if (!err) {
            assert(
              res.body.message ===
                'Unathorized access! Only an admin can create a user'
            );
            assert(res.status === 403);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });
  });

  describe('GET `/api/v1/users/?limit={}`', () => {
    it('should repond with `Bad request` if the limit or offset is a non-integer', (done) => {
      api
        .get('/api/v1/users/?limit=jfhjb')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Please set the limit and offset as an integer');
            assert(res.status === 400);
          } else {
            assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.users.length >= 1);
            assert(res.status === 200);
          } else {
            assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Unauthorized access! All users can only be viewed by an admin');
            assert(res.status === 403);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });
  });

  describe('GET `/api/v1/users/:id`', () => {
    it('should respond with `Forrbidden` if a user tries to find a user', (done) => {
      api
      .get('/api/v1/users/5')
      .set('Authorization', `${userToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Unauthorized access! Only an admin can get a user');
          assert(res.status === 403);
        } else {
          assert.ifError(err);
        }
        done();
      });
    });

    it('should respond with `OK` if a user is found in the database by the id', (done) => {
      api
      .get('/api/v1/users/1')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (!err) {
          assert(res.body.user.id === 1);
          assert(res.status === 200);
        } else {
          assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.user.id === 1);
          assert(res.status === 200);
        } else {
          assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'User not found!');
          assert(res.status === 404);
        } else {
          assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Invalid ID. Please enter a valid ID');
          assert(res.status === 400);
        } else {
          assert.ifError(err);
        }
        done();
      });
    });
  });

  describe('GET `/api/v1/users/:id/documents?limit={}`', () => {
    it('should repond with `Bad request` if the limit or offset is a non-integer', (done) => {
      api
        .get('/api/v1/users/1/documents?limit=jfhjb')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Please set the limit and offset as an integer');
            assert(res.status === 400);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });
  });

  describe('GET `/api/v1/users/:id/documents`', () => {
    it('should respond with `Bad request` if the id equals a non-integer', (done) => {
      api
      .get('/api/v1/users/hugvdr/documents')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Invalid ID. Please enter a valid ID');
          assert(res.status === 400);
        } else {
          assert.ifError(err);
        }
        done();
      });
    });

    it('should respond with `OK` if an admin queries any user\'s document(s)', (done) => {
      api
      .get('/api/v1/users/1/documents')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (!err) {
          assert(res.body.documents[0].title === 'Politik');
          assert(res.status === 200);
        } else {
          assert.ifError(err);
        }
        done();
      });
    });

    it('should respond with `OK` if an admin queries any user\'s document(s)', (done) => {
      api
      .get('/api/v1/users/2/documents')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (!err) {
          assert(res.body.documents[0].title === 'Trump has been covfefed');
          assert(res.status === 200);
        } else {
          assert.ifError(err);
        }
        done();
      });
    });

    it('should respond with `Forbidden` if a user queries another user\'s documents', (done) => {
      api
      .get('/api/v1/users/1/documents')
      .set('Authorization', `${userToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Unauthorized access! ¯¯|_(ツ)_|¯¯');
          assert(res.status === 403);
        } else {
          assert.ifError(err);
        }
        done();
      });
    });
  });

  describe('GET `/api/v1/search/users/?q={}&limit={}`', () => {
    it('should repond with `Bad request` if the limit or offset is a non-integer', (done) => {
      api
        .get('/api/v1/search/users/?q=admin&limit=jfhjb')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Please set the limit and offset as an integer');
            assert(res.status === 400);
          } else {
            assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Please enter a keyword');
          assert(res.status === 400);
        } else {
          assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.users[0].fullName === 'Admin');
          assert(res.status === 200);
        } else {
          assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Unauthorized access! ¯¯|_(ツ)_|¯¯');
          assert(res.status === 403);
        } else {
          assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'User not found!');
          assert(res.status === 404);
        } else {
          assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Invalid ID. Please enter a valid ID');
            assert(res.status === 400);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });

    it("should respond with `Unauthorized` if a user tries to update another user's profile", (done) => {
      api
        .put('/api/v1/users/1')
        .set('Authorization', `${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Gold Williams'
        })
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Unauthorized access ¯¯|_(ツ)_|¯¯');
            assert(res.status === 403);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });

    it('should respond with `Ok` if an admin updates a user\'s role', (done) => {
      api
      .put('/api/v1/user/2')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({
        fullName: 'Gold Ejikeme',
        email: 'gold.ejike@gmail.com',
        password: 'goldejike',
        role: 'admin'
      })
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Document Successfully Updated');
          assert(res.status === 200);
        }
        done();
      });
    });

    it('should respond with `Bad request` if a user updates his/her password with less than 7 characters', (done) => {
      api
        .put('/api/v1/users/2')
        .set('Authorization', `${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Golden girl',
          password: '09'
        })
        .end((err, res) => {
          if (!err) {
            assert(res.body.errors[0].msg === 'Password must contain at least 7 characters');
            assert(res.status === 400);
          } else {
            assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'This email already exists!');
            assert(res.status === 409);
          } else {
            assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Sorry, the user does not exist!');
            assert(res.status === 404);
          } else {
            assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Invalid ID. Please enter a valid ID');
          assert(res.status === 400);
        } else {
          assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Yipee! User deleted successfully!');
          assert(res.status === 200);
        } else {
          assert.ifError(err);
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
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'User not found! :(');
          assert(res.status === 404);
        } else {
          assert.ifError(err);
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
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Unathuorized Access! ¯¯|_(ツ)_|¯¯');
            assert(res.status === 403);
          } else {
            assert.ifError(err);
          }
          done();
        });
    });
  });
});
