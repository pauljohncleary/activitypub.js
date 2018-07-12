import * as Promise from 'bluebird';
import L from '../../common/logger'
import { getConnection, getRepository } from "typeorm";
import { Actor } from "../../entities/Actor";

interface ReturnActorObject {
  subject?: string,
  links?: Array<Object>
};

export class WebFingerService {

  byResource(resource: string): Promise<ReturnActorObject> {
    const username = resource.replace(/acct:/, "").replace(/@.*/, "");
    L.info(`fetching actor named ${username}`);

    const returnActor = getRepository(Actor).findOne({ preferredUsername: username }).then(actor => {
      L.info(actor);
      if(actor) {
        const href = `https://${process.env.DOMAIN}/users/${username}`
        return {
          "subject": resource,
          "links": [
            {
              "rel": "self",
              "type": "application/activity+json",
              href,
            }
          ]
        }
      } else {
        return null;
      }
    });

    return Promise.resolve(returnActor);
  }

}

export default new WebFingerService();