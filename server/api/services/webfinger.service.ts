import * as Promise from 'bluebird';
import L from '../../common/logger'

interface ReturnActorObject {
  subject?: string,
  links?: Array<Object>
};

export class WebFingerService {

  byResource(resource: string): Promise<ReturnActorObject> {
    const username = resource.replace(/acct:/, "").replace(/@.*/,"");
    L.info(`fetch actor named ${username}`);

    // TODO Retrieve actor from database based on resource
    // TODO return empty object if not found

    const href = `https://${process.env.DOMAIN}/users/${username}`
    const returnActor = {
      "subject": resource,
      "links": [
        {
          "rel": "self",
          "type": "application/activity+json",
          href,
        }
      ]
    }

    return Promise.resolve(returnActor);
  }

}

export default new WebFingerService();