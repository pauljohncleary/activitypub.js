import 'mocha';
import { expect } from 'chai';
import * as request from 'supertest';
import { getRepository, getConnection } from "typeorm";
import Server from '../server';
import { Actor } from "../server/entities/Actor";

describe('User', () => {
  const testUsername = "alice";


  beforeEach('insert test actor', async () => {
    !getConnection().isConnected && await getConnection().connect(); // Sometimes the database connection doesn't initialize quickly enough
    const actor = new Actor();
    actor.preferredUsername = testUsername;
    actor.publicKeyPem = "-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----";
    await getRepository(Actor).save(actor);
  });

  afterEach('remove test actors', async () => {
    await getRepository(Actor).delete({});
  });

  it('should return a user at the user endpoint', async () => {
    await request(Server)
      .get(`/users/${testUsername}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(r => {
        expect(r.body).to.be.an('object');
        expect(r.body['@context']).to.be.an('array');
        expect(r.body.id).to.be.a('string');
        expect(r.body.preferredUsername).to.equal(testUsername);
        expect(r.body.inbox).to.be.a('string');
        expect(r.body.outbox).to.be.a('string');
        expect(r.body.type).to.equal('Person');
      });
  });

  it('should return a 404 when a username which does not exist is requested', () =>
    request(Server)
      .get('/users/userthatdoesnotexist')
      .expect(404));
      
});
