import 'mocha';
import { expect } from 'chai';
import * as superagentHttpSignature from 'superagent-http-signature';
import * as request from 'supertest';
import { getRepository, getConnection } from "typeorm";
import Server from '../server';
import { Actor } from "../server/entities/Actor";

describe('User inbox API', () => {
  const user1 = "alice";
  const user2 = "bob";
  // from https://github.com/tootsuite/mastodon/blob/d10447c3a82d771f8ab61837128b011254894694/spec/controllers/well_known/webfinger_controller_spec.rb
  const examplePublicKey = "-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDHgPoPJlrfMZrVcuF39UbVssa8r4ObLP3dYl9Y17Mgp5K4mSYDR/Y2ag58tSi6ar2zM3Ze3QYsNfTq0NqN1g89eAu0MbSjWqpOsgntRPJiFuj3hai2X2Im8TBrkiM/UyfTRgn8q8WvMoKbXk8Lu6nqv420eyqhhLxfUoCpxuem1QIDAQAB-----END PUBLIC KEY-----"
  // Message from bob to alice
  const message = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "id": "https://my-example.com/create-test-message", // TODO: check this
    "type": "Create",
    "actor": `https://${process.env.DOMAIN}/users/${user2}`,

    "object": {
      "id": "https://my-example.com/test-message", // TODO: check this
      "type": "Note",
      "published": "2018-06-23T17:17:11Z",
      "attributedTo": `https://${process.env.DOMAIN}/users/${user2}`,
      "content": "<p>Test Message</p>",
      "to": `https://${process.env.DOMAIN}/users/${user1}`
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

  const key = "-----BEGIN RSA PRIVATE KEY-----MIICXQIBAAKBgQDHgPoPJlrfMZrVcuF39UbVssa8r4ObLP3dYl9Y17Mgp5K4mSYDR/Y2ag58tSi6ar2zM3Ze3QYsNfTq0NqN1g89eAu0MbSjWqpOsgntRPJiFuj3hai2X2Im8TBrkiM/UyfTRgn8q8WvMoKbXk8Lu6nqv420eyqhhLxfUoCpxuem1QIDAQABAoGBAIKsOh2eM7spVI8mdgQKheEG/iEsnPkQ2R8ehfE9JzjmSbXbqghQJDaz9NU+G3Uu4R31QT0VbCudE9SSA/UPFl82GeQG4QLjrSE+PSjSkuslgSXelJHfAJ+ycGaxajtPyiQD0e4c2loagHNHPjqK9OhHx9mFnZWmoagjlZ+mQGEpAkEA8GtqfS65IaRQuVhMzpp25rF1RWOwaaa+vBPkd7pGdJEQGFWkaR/a9UkU+2C4ZxGBkJDP9FApKVQIRANEwN3/hwJBANRuw5+es6BgBv4PD387IJvuruW2oUtYP+Lb2Z5k77J13hZTr0dbOo9j1UbbR0/4g+vAcsDl4JD9c/9LrGYEpcMCQBon9Yvs+2M3lziy7JhFoc3zXIjSEa1M4M9hcqe78lJYPeIH3z04o/+vlcLLgQRlmSz7NESmO/QtGkEcAezhuh0CQHjipzO4LeO/gXslut3eGcpiYuiZquOjToecMBRwv+5AIKd367Che4uJdh6iPcyGURvhIewfZFFdyZqnx20ui90CQQC1W2rK5Y30wAunOtSLVA30TLK/tKrTppMC3corjKlBFTX8IvYBNTbpEttc1VCf/0ccnNpfb0CrFNSPWxRj7t7D-----END RSA PRIVATE KEY-----";

  /*EXAMPLE IN RUBY
signed_string = "(request-target): post /inbox\nhost: mastodon.social\ndate: #{date}"
signature     = Base64.strict_encode64(keypair.sign(OpenSSL::Digest::SHA256.new, signed_string))
header        = 'keyId="https://my-example.com/actor",headers="(request-target) host date",signature="' + signature + '"' 
  HTTP.headers({ 'Host': 'mastodon.social', 'Date': date, 'Signature': header })
*/

  it('should accept a post to an inbox with a valid signed signature ', async () => {
    await request(Server)
      .post(`/users/${user1}/inbox`)
      .set('Accept', 'application/json')
      .use(superagentHttpSignature({
        headers: ['(request-target)', 'content-md5', ],
        algorithm: 'hmac-sha256',
        key,
        keyId: `https://${process.env.DOMAIN}/${user2}`,
      }))
      .send(message)
      .expect(201);
  });


});
