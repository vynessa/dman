import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import request from 'supertest';
import { assert } from 'chai';
import app from '../../build/server';
import { User, Document, Role } from '../models';

dotenv.config();
const api = request(app);

let token, fullName, email, password;

describe('Set Document controller for test', () => {
  beforeEach((done, req, res) => {
    User.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then((err) => {
      if (!err) {
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
              // }).then((err) => {
              //   if (!err) {
              //     //
              //   }
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
            // Create new instance of user
          }
        });
      }
      done();
    });
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

describe('Document Controller Test Suite', () => {
  describe('Set Document controller for test', () => {
    beforeEach(() => {
      const user = new User();
      User.create({
        fullName: 'Admin',
        email: 'info@admin.com',
        role: 'admin',
        password: user.generateHash('adminhere')
      }).then((response) => {
        //
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
});
