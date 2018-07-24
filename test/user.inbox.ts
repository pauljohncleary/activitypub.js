import 'mocha';
import { expect } from 'chai';
import * as superagentHttpSignature from 'superagent-http-signature';
import * as request from 'supertest';
import { getRepository, getConnection } from "typeorm";
import Server from '../server';
import { Actor } from "../server/entities/Actor";
import l from "../server/common/logger";

describe('User inbox API', () => {
  const user1 = "alice";
  const user2 = "bob";
  const examplePublicKey = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCFENGw33yGihy92pDjZQhl0C3\n6rPJj+CvfSC8+q28hxA161QFNUd13wuCTUcq0Qd2qsBe/2hFyc2DCJJg0h1L78+6\nZ4UMR7EOcpfdUE9Hf3m/hs+FUR45uBJeDK1HSFHD8bHKD6kv8FPGfJTotc+2xjJw\noYi+1hqp1fIekaxsyQIDAQAB\n-----END PUBLIC KEY-----"
  const examplePrivateKey = "-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQDCFENGw33yGihy92pDjZQhl0C36rPJj+CvfSC8+q28hxA161QF\nNUd13wuCTUcq0Qd2qsBe/2hFyc2DCJJg0h1L78+6Z4UMR7EOcpfdUE9Hf3m/hs+F\nUR45uBJeDK1HSFHD8bHKD6kv8FPGfJTotc+2xjJwoYi+1hqp1fIekaxsyQIDAQAB\nAoGBAJR8ZkCUvx5kzv+utdl7T5MnordT1TvoXXJGXK7ZZ+UuvMNUCdN2QPc4sBiA\nQWvLw1cSKt5DsKZ8UETpYPy8pPYnnDEz2dDYiaew9+xEpubyeW2oH4Zx71wqBtOK\nkqwrXa/pzdpiucRRjk6vE6YY7EBBs/g7uanVpGibOVAEsqH1AkEA7DkjVH28WDUg\nf1nqvfn2Kj6CT7nIcE3jGJsZZ7zlZmBmHFDONMLUrXR/Zm3pR5m0tCmBqa5RK95u\n412jt1dPIwJBANJT3v8pnkth48bQo/fKel6uEYyboRtA5/uHuHkZ6FQF7OUkGogc\nmSJluOdc5t6hI1VsLn0QZEjQZMEOWr+wKSMCQQCC4kXJEsHAve77oP6HtG/IiEn7\nkpyUXRNvFsDE0czpJJBvL/aRFUJxuRK91jhjC68sA7NsKMGg5OXb5I5Jj36xAkEA\ngIT7aFOYBFwGgQAQkWNKLvySgKbAZRTeLBacpHMuQdl1DfdntvAyqpAZ0lY0RKmW\nG6aFKaqQfOXKCyWoUiVknQJAXrlgySFci/2ueKlIE1QqIiLSZ8V8OlpFLRnb1pzI\n7U1yQXnTAEFYM560yJlzUpOb1V4cScGd365tiSMvxLOvTA==\n-----END RSA PRIVATE KEY-----";

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
    actor.preferredUsername = user1;
    actor.publicKeyPem = examplePublicKey;
    await getRepository(Actor).save(actor);

    const actor2 = new Actor();
    actor2.preferredUsername = user2;
    actor2.publicKeyPem = examplePublicKey;
    await getRepository(Actor).save(actor2);
  });

  afterEach('remove test actors', async () => {
    await getRepository(Actor).clear();
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

});
