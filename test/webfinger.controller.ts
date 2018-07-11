import 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import Server from '../server';

describe('Webfinger', () => {
  it('should respond to GET at /.well-known/webfinger?resource=acct:user@example.com', () =>
    request(Server)
      .get('/.well-known/webfinger?resource=acct:bob@example.com')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(r => {
        // TODO: check for content
        expect(r.body)
          .to.be.an('object')
      }));

  // https://tools.ietf.org/html/rfc7033#section-4.2
  it('should return a 400 when no resource parameter is supplied', () =>
    request(Server)
      .get('/.well-known/webfinger')
      .expect(400));

  it('should return a 400 when a resource parameter without acct: is supplied', () =>
    request(Server)
      .get('/.well-known/webfinger?resource=bob@example.com')
      .expect(400));

  it('should return a 400 when a resource parameter without a domain is supplied', () =>
    request(Server)
      .get('/.well-known/webfinger?resource=acct:user')
      .expect(400));

  it('should return a 400 when a resource parameter with a domain that does not match the host domain is supplied', () =>
    request(Server)
      .get('/.well-known/webfinger?resource=acct:bob@thewrongdomain.com')
      .expect(400));

  it('should return a 404 when a resource which does not exist is requested', () =>
    request(Server)
      .get('/.well-known/webfinger?resource=userthatdoesnotexist@example.com')
      .expect(404));

});
