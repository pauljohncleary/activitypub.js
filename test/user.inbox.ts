import 'mocha';
import { expect } from 'chai';
import * as superagentHttpSignature from 'superagent-http-signature';
import * as request from 'supertest';
import { getRepository, getConnection } from "typeorm";
import Server from '../server';
import { Actor } from "../server/entities/Actor";
import { Inbox } from "../server/entities/Inbox";
import { ASObject } from "../server/entities/ASObject";

describe('User inbox API', () => {
  const user1 = "alice";
  const user2 = "bob";
  const examplePublicKey = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCFENGw33yGihy92pDjZQhl0C3\n6rPJj+CvfSC8+q28hxA161QFNUd13wuCTUcq0Qd2qsBe/2hFyc2DCJJg0h1L78+6\nZ4UMR7EOcpfdUE9Hf3m/hs+FUR45uBJeDK1HSFHD8bHKD6kv8FPGfJTotc+2xjJw\noYi+1hqp1fIekaxsyQIDAQAB\n-----END PUBLIC KEY-----"
  const examplePrivateKey = "-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQDCFENGw33yGihy92pDjZQhl0C36rPJj+CvfSC8+q28hxA161QF\nNUd13wuCTUcq0Qd2qsBe/2hFyc2DCJJg0h1L78+6Z4UMR7EOcpfdUE9Hf3m/hs+F\nUR45uBJeDK1HSFHD8bHKD6kv8FPGfJTotc+2xjJwoYi+1hqp1fIekaxsyQIDAQAB\nAoGBAJR8ZkCUvx5kzv+utdl7T5MnordT1TvoXXJGXK7ZZ+UuvMNUCdN2QPc4sBiA\nQWvLw1cSKt5DsKZ8UETpYPy8pPYnnDEz2dDYiaew9+xEpubyeW2oH4Zx71wqBtOK\nkqwrXa/pzdpiucRRjk6vE6YY7EBBs/g7uanVpGibOVAEsqH1AkEA7DkjVH28WDUg\nf1nqvfn2Kj6CT7nIcE3jGJsZZ7zlZmBmHFDONMLUrXR/Zm3pR5m0tCmBqa5RK95u\n412jt1dPIwJBANJT3v8pnkth48bQo/fKel6uEYyboRtA5/uHuHkZ6FQF7OUkGogc\nmSJluOdc5t6hI1VsLn0QZEjQZMEOWr+wKSMCQQCC4kXJEsHAve77oP6HtG/IiEn7\nkpyUXRNvFsDE0czpJJBvL/aRFUJxuRK91jhjC68sA7NsKMGg5OXb5I5Jj36xAkEA\ngIT7aFOYBFwGgQAQkWNKLvySgKbAZRTeLBacpHMuQdl1DfdntvAyqpAZ0lY0RKmW\nG6aFKaqQfOXKCyWoUiVknQJAXrlgySFci/2ueKlIE1QqIiLSZ8V8OlpFLRnb1pzI\n7U1yQXnTAEFYM560yJlzUpOb1V4cScGd365tiSMvxLOvTA==\n-----END RSA PRIVATE KEY-----";
  const examplePrivateKey2 = "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgHvsYwFwBVmp2Z7n66TgXIiJIG5hCd7bTHsH92R5wAaXckRHhcE3\n6iV+4vPtj8+w1avhMZHvtUegHnBOeoTTM40mE2wRAbca9PkJA8WVVf6a90O0DvsZ\nAR5/+mFFCQ2yyEfYD+EsJ+VCkeEPqw/9pDaVGVDeQAeMb8d8rLmD2w/xAgMBAAEC\ngYBgjIeGczR36zE18RNS3cq6RbwSw1/hVZJ8uHQyv/iwKgZI1ECNjXbLx9QioA/P\njMKsq0LnpI7kQwf0D/C805/xXNM+kib9ZNjgmo1iCKBj16KyKMTsAydAjMvLhZoe\nIkG2v+YUFTlpCf/pea/08+X+v1GNtzJhh7kta+J/q2KBAQJBAMpD2KW1NpnCMUwV\nN8/n9zbNLEz6UsLVba07fyVeBdL16oedLxRQ85+OB3W5IzKpAai34ihkhC01UWcr\nwjPYoMkCQQCc2Hu1EqBAlyCaloe5gUyZsrdNdIkrx0cS5jqy7CuR7fR1oCPZABXH\nTz0gH/AFv0onpCEx1gO2X4RRTsVi+HHpAkEAti+Meh4S00ZWjxhhkFR5mZQPPjsP\nxszloG8B5I+fIVk+ae7MFDmiZ2pQD9q1+JDAnM8c15NKd0oaS5rfr0GF+QJBAIGf\nX81r0UjQHT/k+9JRi47SZi77CopFrPVvlD9eczutHoU/jaC/M0B+uhOckW8Ogih0\nuoJHTtYf5miT4wlCLlECQEL+XJritSTmNZc+b4bQHRilphaQMlf5uta4M5yeRz3L\nKARwoIf4nQPmWCnAVzep9qOrKCoRFLSgJtyp9IEQWZ8=\n-----END RSA PRIVATE KEY-----"

  // Message from bob to alice
  const message = {
    "@context": "http://www.w3.org/ns/activitystreams",
    "id": "http://my-example.com/create-test-message", // TODO: check this
    "type": "Create",
    "actor": `http://${process.env.DOMAIN}/users/${user2}`,

    "object": {
      "id": "http://my-example.com/test-message", // TODO: check this
      "type": "Note",
      "published": new Date().toISOString(),
      "attributedTo": `http://${process.env.DOMAIN}/users/${user2}`,
      "content": "<p>Test Message</p>",
      "to": `http://${process.env.DOMAIN}/users/${user1}`
    }
  };

  beforeEach('insert test actors', async () => {
    !getConnection().isConnected && await getConnection().connect(); // Sometimes the database connection doesn't initialize quickly enough

    const actor = new Actor();
    const inbox = new Inbox();
    inbox.summary = `${user1}'s inbox`;
    actor.preferredUsername = user1;
    actor.publicKeyPem = examplePublicKey;
    actor.inbox = inbox;
    await getRepository(Inbox).save(inbox);
    await getRepository(Actor).save(actor);

    const actor2 = new Actor();
    const inbox2 = new Inbox();
    inbox2.summary = `${user1}'s inbox`;
    actor2.preferredUsername = user2;
    actor2.publicKeyPem = examplePublicKey;
    actor2.inbox = inbox2;
    await getRepository(Inbox).save(inbox2);
    await getRepository(Actor).save(actor2);

  });

  afterEach('remove test actors', async () => {
    await getRepository(ASObject).delete({});
    await getRepository(Inbox).delete({});
    await getRepository(Actor).delete({});
  });

  it('should accept a post to an inbox with a valid signed signature ', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('Accept', 'application/json')
      .set('date', new Date().toISOString())
      .use(superagentHttpSignature({
        headers: ['date'],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey,
        keyId: `http://${process.env.DOMAIN}/users/${user2}#main-key`,
      }))
      .send(message)
      .expect(201);
  });

  it('should return 401 for posts signed with a different private key ', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('Accept', 'application/json')
      .set('date', new Date().toISOString())
      .use(superagentHttpSignature({
        headers: ['date'],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey2,
        keyId: `http://${process.env.DOMAIN}/users/${user2}#main-key`,
      }))
      .send(message)
      .expect(401);
  });

  it('should return a 401 for posts without a signed signature', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('Accept', 'application/json')
      .send(message)
      .expect(401);
  });

  it('should return a 401 for posts with a missing date header', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('Accept', 'application/json')
      .use(superagentHttpSignature({
        headers: [],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey,
        keyId: `http://${process.env.DOMAIN}/users/${user2}#main-key`,
      }))
      .send(message)
      .expect(401);
  });

  it('should return a 400 for posts with a public key id that does not exist', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('date', new Date().toISOString())
      .use(superagentHttpSignature({
        headers: ['date'],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey,
        keyId: `http://${process.env.DOMAIN}/users/fakeuser#main-key`,
      }))
      .send(message)
      .expect(400);
  });

  it('should return a 400 for posts with a public key id that is not a proper URL', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('date', new Date().toISOString())
      .use(superagentHttpSignature({
        headers: ['date'],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey,
        keyId: `this isn't a URL`,
      }))
      .send(message)
      .expect(400);
  });

  it('should return a 401 for posts with a date that is in the past', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('date', new Date(0).toISOString())
      .use(superagentHttpSignature({
        headers: ['date'],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey,
        keyId: `http://${process.env.DOMAIN}/users/${user2}#main-key`,
      }))
      .send(message)
      .expect(401);
  });

  it('should return a 404 for messages to users that don\'t have an inbox', async () => {
    await request(Server)
      .post(`/users/userthatdoesntexist/inbox`)
      .set('date', new Date().toISOString())
      .use(superagentHttpSignature({
        headers: ['date'],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey,
        keyId: `http://${process.env.DOMAIN}/users/${user2}#main-key`,
      }))
      .send(message)
      .expect(404);
  });

  it('should return a 400 for posts where the attributed to and actor don\'t match up', async () => {
    message.object.attributedTo = "https://some-other-actor.com/actor";
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('date', new Date().toISOString())
      .use(superagentHttpSignature({
        headers: ['date'],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey,
        keyId: `http://${process.env.DOMAIN}/users/${user2}#main-key`,
      }))
      .send(message)
      .expect(400);
  });

  it('should return a 400 for posts without a message', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('date', new Date().toISOString())
      .use(superagentHttpSignature({
        headers: ['date'],
        algorithm: 'rsa-sha512',
        key: examplePrivateKey,
        keyId: `http://${process.env.DOMAIN}/users/${user2}#main-key`,
      }))
      .send({})
      .expect(400);
  });

  // TODO: get inbox

});
