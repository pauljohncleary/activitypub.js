// import * as Promise from 'bluebird';
import L from '../../common/logger'
import { getConnection, getRepository } from "typeorm";
import { Actor } from "../../entities/Actor";
import { Inbox } from "../../entities/Inbox";
import { ASObject } from "../../entities/ASObject";
import activitystreams from "activitystrea.ms";

interface ReturnUserObject {
  '@context'?: Array<string>,
  id?: string,
  type?: string,
  inbox?: string, // TODO: check if this is valid or not
  outbox?: string,
};

export class UserService {

  byResource(preferredUsername: string): Promise<ReturnUserObject> {
    const domain = process.env.DOMAIN;
    const returnUser = getRepository(Actor).findOne({ preferredUsername }).then(actor => {
      if (actor) {
        return {
          "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1" // TODO: check if this is necessary / auth dependent?
          ],
          id: `http://${domain}/user/${preferredUsername}`,
          type: "Person",
          preferredUsername,
          inbox: `https://${domain}/user/${preferredUsername}/inbox`,
          outbox: `https://${domain}/user/${preferredUsername}/inbox`,
          publicKey: {
            id: `http://${domain}/user/${preferredUsername}#main-key`,
            owner: `http://${domain}/user/${preferredUsername}`,
            publicKeyPem: actor.publicKeyPem,
          }
        }
      } else {
        return null;
      }
    });

    return Promise.resolve(returnUser);
  }

  async addObjectToInbox(user: string, message: object): Promise<Inbox> {
    const asObject = new ASObject();
    asObject.asObject = message;
    await getRepository(ASObject).save(asObject);
    const actor = await getRepository(Actor).findOneOrFail({ preferredUsername: user }, { relations: ["inbox"] });
    console.log(actor);
    const inbox = actor.inbox;
    inbox.items.push(asObject);
    return await getRepository(Inbox).save(inbox);
  }

}

export default new UserService();