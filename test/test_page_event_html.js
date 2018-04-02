'use strict';
global.DATABASE_URL = 'mongodb://localhost/crowdcounter-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {JWT_SECRET} = require('../config');

const expect = chai.expect;

// This lets us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Protected endpoint', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';

  // before(() => {
  //   return runServer();
  // });

  // after(() => {
  //   return closeServer();
  // });

  beforeEach(() => {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName
      })
    );
  });

  afterEach(() => {
    return User.remove({});
  });

  describe('/event', () => {

    it('Should redirect requests with no credentials to login', () => {
      return chai
        .request(app)
        .get('/event').redirects(0)
        .then(() => {
          expect(res).to.have.status(302); 
          expect(res).to.have.header('location', '/login'); 
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
        });
    });

    it('Should redirect requests with an invalid token to login', () => {
      const token = jwt.sign(
        {
          username,
          firstName,
          lastName
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );
      return chai
        .request(app)
        .get('/event').redirects(0)
        .set('Authorization', `Bearer ${token}`)
        .then(() => {
          expect(res).to.have.status(302); 
          expect(res).to.have.header('location', '/login'); 
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
        });
    });

    it('Should redirect requests with an expired token to login', () => {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username
        }
      );
      return chai
        .request(app)
        .get('/events').redirects(0)
        .set('authorization', `Bearer ${token}`)
        .then(() => {
          expect(res).to.have.status(302); 
          expect(res).to.have.header('location', '/login'); 
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
        });
    });

    it('Should send protected data', () => {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      return chai
        .request(app)
        .get('/events')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });
    //TODO: Uncomment when jwtAuth protection is restored to this route in server.js
    // it('Should expose username to page', () => {
    //   const token = jwt.sign(
    //     {
    //       user: {
    //         username,
    //         firstName,
    //         lastName
    //       }
    //     },
    //     JWT_SECRET,
    //     {
    //       algorithm: 'HS256',
    //       subject: username,
    //       expiresIn: '7d'
    //     }
    //   );
    //   return chai
    //     .request(app)
    //     .get('/events')
    //     .set('authorization', `Bearer ${token}`)
    //     .then(res => {
    //       expect(username).to.equal('exampleUser');
    //     });
    // });
  });
});
