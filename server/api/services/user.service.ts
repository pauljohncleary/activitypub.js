import * as Promise from 'bluebird';
import L from '../../common/logger'
import { getConnection, getRepository } from "typeorm";
import { Actor } from "../../entities/Actor";

interface ReturnUserObject {
  '@context'?: Array<string>,
  id?: string,
  type?: string,
  inbox?: string,
  outbox?: string,
};

export class UserService {

  byResource(preferredUsername: string): Promise<ReturnUserObject> {
    const domain = process.env.domain;
    const returnUser = getRepository(Actor).findOne({ preferredUsername }).then(actor => {
      if(actor) {
        return {
          "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1" // TODO: check if this is necessary / auth dependent?
          ],
          id: `https://${domain}/user/${preferredUsername}`,
          type: "Person",
          preferredUsername,
          inbox: `https://${domain}/user/${preferredUsername}/inbox`,
          outbox: `https://${domain}/user/${preferredUsername}/inbox`,
          // TODO: public key here?
        }
      } else {
        return null;
      }
    });

    return Promise.resolve(returnUser);
  }

}

export default new UserService();