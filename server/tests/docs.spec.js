import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import request from 'supertest';
import { assert } from 'chai';
import app from '../../build/server';
import { User, Document, Role } from '../models';

dotenv.config();
const api = request(app);

let token, fullName, email, password;
let title, accessType, content, owner, userId;

describe('Set the database up for testing', () => {
  beforeEach((done, req, res) => {
    User.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then((err) => {
      done();
    });
  });
  const set = true;
  it('should check if set is `true`', () => {
    if (set) {
      assert.isDefined(set, 'Test environment set up');
    } else {
      const error = new Error('Test environment not set up');
      assert.ifError(error);
    }
  });
});

describe('Document Controller Test Suite', () => {
  describe('Set the database up for testing', () => {
    Document.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then((err) => {
      if (!err) {
        Role.destroy({
          where: {},
          truncate: true,
          cascade: true,
          restartIdentity: true
        });
        Role.bulkCreate([
          {
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            role: 'editor',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
      }
    });

    const set = true;
    it('set should be true', () => {
      if (set) {
        assert.isDefined(set, 'test is ready');
      } else {
        const error = new Error('test is not ready');
        assert.ifError(error);
      }
    });
  });

  describe('GET `/api/v1/documents`', () => {
    beforeEach((done) => {
      const user = new User();
      User.create({
        fullName: 'Admin',
        email: 'info@admin.com',
        role: 'admin',
        password: user.generateHash('adminhere')
      });
      token = jwt.sign(
        {
          id: 1,
          role: process.env.ADMINROLE,
          fullName: process.env.FULL_NAME
        },
        process.env.JWT_SECRET,
        { expiresIn: '72h' }
      );

      api
        .post('/api/v1/users/auth/register')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          fullName: 'Gold Ejikeme',
          email: 'gold.ejikeme@gmail.com',
          password: 'gold'
        })
        .expect(200)
        .end((err, res) => {
          if (!err) {
            fullName = res.body.user.fullName;
            email = res.body.user.email;
            password = res.body.user.password;
          }
          done();
        });
    });

    it('should return an error message if the documents array is empty', (done) => {
      api
        .get('/api/v1/documents')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'No document found!');
          }
          done();
        });
    });
  });

  describe('GET `/api/v1/documents`', () => {
    beforeEach((done) => {
      api
        .post('/api/v1/documents')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'Politik',
          content: 'Waterside and plastic lights. All going down memory lane',
          accessType: 'public',
          userId: 1
        })
        .expect(201)
        .end((err, res) => {
          if (!err) {
            title = res.body.title;
            content = res.body.content;
            accessType = res.body.accessType;
            owner = res.body.owner;
            userId = res.body.userId;
          }
          done();
        });

      api
        .post('/api/v1/documents')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'The other room',
          content: 'We all belong somewhere. Some belong in the other room',
          accessType: 'public',
          userId: 1
        })
        .expect(201)
        .end((err, res) => {
          if (!err) {
            title = res.body.title;
            content = res.body.content;
            accessType = res.body.accessType;
            owner = res.body.owner;
            userId = res.body.userId;
          }
          done();
        });
    });

    it('should return `OK` a document is created successfully by an admin', (done) => {
      api
      .get('/api/v1/documents')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Document created successfully');
        }
        done();
      });
    });
  });

  describe('GET `/api/v1/search/documents`', () => {
    it('should return `OK` one or more document is/are found in the search array', (done) => {
      api
      .get('/api/v1/search/documents/?q=Politik')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Document found!');
        }
        done();
      });
    });

    it('should return `Not found` if no document is returned', (done) => {
      api
      .get('/api/v1/search/documents/?q=Waterside')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'This document does not exist!');
        }
        done();
      });
    });

    it('should return `Bad request` if no search query is passed in', (done) => {
      api
      .get('/api/v1/search/documents/?q=')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Please enter a keyword');
        }
        done();
      });
    });
  });

  describe('PUT `/api/v1/documents/:id`', () => {
    it('should return `OK` a document is updated successfully', (done) => {
      api
      .put('/api/v1/documents/2')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({
        title: 'The other roomsssss',
        content: 'We all belong somewhere. Some belong in the other room',
        accessType: 'private',
        userId: 1
      })
      .expect(200)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Document Successfully Updated');
        }
        done();
      });
    });

    it('should return `Bad request` if the id is a non-integer', (done) => {
      api
      .put('/api/v1/documents/iehdy')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({
        title: 'The other roomsssss',
        content: 'We all belong somewhere. Some belong in the other room',
        accessType: 'private',
        userId: 1
      })
      .expect(400)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Invalid ID. Please enter a valid ID');
        }
        done();
      });
    });

    it('should return `Not found` if the id does not exist', (done) => {
      api
      .put('/api/v1/documents/67')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .send({
        title: 'The other roomsssss',
        content: 'We all belong somewhere. Some belong in the other room',
        accessType: 'private',
        userId: 1
      })
      .expect(404)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Sorry, the document does not exist!');
        }
        done();
      });
    });
  });

  describe('DELETE `/api/v1/documents/:id`', () => {
    it('should return `OK` a document is deleted successfully', (done) => {
      api
      .delete('/api/v1/documents/2')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Document deleted successfully!');
        }
        done();
      });
    });

    it('should return `Bad request` if the id passed in is a non-integer', (done) => {
      api
      .delete('/api/v1/documents/kjfh')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Invalid ID. Please enter a valid ID');
        }
        done();
      });
    });

    it('should return `Not found` if the id does not exist', (done) => {
      api
      .delete('/api/v1/documents/90')
      .set('Authorization', `${token}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (!err) {
          assert(res.body.message === 'Document not found! :(');
        }
        done();
      });
    });
  });
});
