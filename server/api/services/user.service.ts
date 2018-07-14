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

  byResource(resource: string): Promise<ReturnUserObject> {
    const returnUser = getRepository(Actor).findOne({ preferredUsername: resource }).then(actor => {
      if(actor) {
        return {
          

        }
      } else {
        return null;
      }
    });

    return Promise.resolve(returnUser);
  }

}

export default new UserService();