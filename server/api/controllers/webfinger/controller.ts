import WebFingerService from '../../services/webfinger.service';
import { Request, Response } from 'express';

export class Controller {

  getResource(req: Request, res: Response): void {
    // TODO: improve this regex / replace with better domain validation
    const resourceRegExp = /^acct\:.+@.+\..+/;
    const resource = req.query.resource;

    // TODO: add more advanced resource query validation using a library e.g. express-validator
    if (!resource) {
      res.status(400).send('Missing resource query parameter.');
    } else if (!resourceRegExp.test(resource)) {      
      res.status(400).send('Malformed resource query parameter, it must be in the format `acct:user@domain.com`');
    } else if (resource.replace(/.*@/, "") !== process.env.DOMAIN) {
      res.status(400).send(`Supplied resource resides at a different domain, you can only view resources residing at https://${process.env.DOMAIN} at this endpoint.`);
    } else {
      WebFingerService.byResource(resource).then(r => {
        r ? res.json(r) : res.status(404).end();
      });
    }
  }
}
export default new Controller();
