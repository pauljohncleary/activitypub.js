// import * as Promise from 'bluebird';
import L from '../../common/logger'
import { getConnection, getRepository } from "typeorm";
import { Actor } from "../../entities/Actor";
import { Inbox } from "../../entities/Inbox";
import { ASObject } from "../../entities/ASObject";
import * as activitystreams from "activitystrea.ms";

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

  async checkUsernameExists(preferredUsername: string): Promise<Actor> {
    return await getRepository(Actor).findOne({ preferredUsername });
  }

  async buildInbox(preferredUsername: string): Promise<Object> {
    // TODO: simplify this into one query
    const actor = await getRepository(Actor).findOne({ preferredUsername }, { relations: ['inbox'] });
    const actorId = actor.inbox.id;
    const actorInbox = await getRepository(Inbox).findOne({ id: actorId });
    const objects = await getRepository(ASObject).find({ inbox: actorInbox });
    const count = objects.length;
    console.log(objects);
    // TODO: filter based on request
    // TODO: deduplicate

    const inbox = activitystreams.orderedCollection().totalItems(count);

    objects.forEach(function (item) {
      inbox.items(item.asObject); // I think to actually make this work we need to store the data in the AS collection properly (i.e. not just dumpt the object in)
    });

    inbox.get().prettyWrite((err, doc) => {
      if (err) throw err;
      console.log(doc);
    });;

    return inbox;
  }

}

export default new UserService();