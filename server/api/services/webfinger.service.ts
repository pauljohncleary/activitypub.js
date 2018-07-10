import * as Promise from 'bluebird';
import L from '../../common/logger'

let id = 0;
interface Example {
  id: number,
  name: string
};

// TODO replace this with a database
const examples: Example[] = [
    { id: id++, name: 'example 0' }, 
    { id: id++, name: 'example 1' }
];

export class WebFingerService {
  all(): Promise<Example[]> {
    L.info(examples, 'fetch all examples');
    return Promise.resolve(examples);
  }

  byResource(resource: string): Promise<Example> {
    L.info(`fetch actor named ${resource}`);
    return this.all().then(r => r[id])
  }

}

export default new WebFingerService();