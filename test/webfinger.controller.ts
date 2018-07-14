import 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import Server from '../server';
import { getRepository, getConnection } from "typeorm";
import { Actor } from "../server/entities/Actor";

describe('Webfinger', () => {
  const testActorUsername = "bob";

  before('insert test actor', async () => {
    !getConnection().isConnected && await getConnection().connect(); // Sometimes the database connection doesn't initialize quickly enough
    const actor = new Actor();
    actor.preferredUsername = testActorUsername;
    actor.publicKeyPem = "-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----";
    await getRepository(Actor).save(actor);
  });

  it('should return the actor details for a user registered the current domain', () =>
    request(Server)
      .get(`/.well-known/webfinger?resource=acct:${testActorUsername}@${process.env.DOMAIN}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(r => {
        expect(r.body).to.be.an('object');
        expect(r.body.subject).to.equal(`acct:${testActorUsername}@${process.env.DOMAIN}`);
        expect(r.body.links).to.be.an('array');
        expect(r.body.links[0]).to.be.an('object');
        expect(r.body.links[0].rel).to.equal('self');
        expect(r.body.links[0].type).to.equal('application/activity+json');
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
      .get('/.well-known/webfinger?resource=acct:userthatdoesnotexist@example.com')
      .expect(404));

});
