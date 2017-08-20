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
    beforeEach(() => {
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
          role: process.env.ADMINROLE
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
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
          content: 'Waterside and plastic lights. All going down memeory lane',
          accessType: 'public',
          owner: 'Gold',
          userId: 1
        })
        .expect(201)
        .end((err, res) => {
          if (!err) {
            assert(res.body.message === 'Document created successfully');
          }
          done();
        });
    });
  });
});
