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
        // TODO: switch building this to activitystrea.ms library?
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

  async addObjectToInbox(user: string, message: object): Promise<ASObject> {
    const actor = await getRepository(Actor).findOne({ preferredUsername: user }, { relations: ["inbox"] });
    if (actor) {
      const asObject = new ASObject();
      asObject.asObject = message;
      asObject.inbox = actor.inbox;
      return await getRepository(ASObject).save(asObject);
    } else {
      return null;
    }
  }

}

export default new UserService();