import 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import Server from '../server';

describe('User', () => {
  const testUsername = "bob";

  it('should return a user at the user endpoint', () => {
    // this always returns 200?
    request(Server)
      .get(`/users/${testUsername}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(r => {
        // TODO check for content
        expect(r.body).to.be.an('object');
      });
  });

});
