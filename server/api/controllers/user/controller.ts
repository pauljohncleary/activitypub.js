import UserService from '../../services/user.service';
import * as httpSignature from 'http-signature';
import { Request, Response } from 'express';

export class Controller {

  getResource(req: Request, res: Response): void {
    const resource = req.params.preferredUsername;

    if (!resource) {
      res.status(400).send('Missing username');
    } else {
      UserService.byResource(resource).then(r => {
        r ? res.json(r) : res.status(404).end();
      });
    }
  }

  postInbox(req: Request, res: Response): void {
    const actorUsername = req.params.preferredUsername;
    if (!actorUsername) {
      res.status(400).send('Missing username');
    } else {

      const parsed = httpSignature.parseRequest(req); // TODO: handle parsing errors here?
      const publicKey = parsed.keyId; // TODO: download pub key
      // TODO: check attributedto and who it's from are the same

      if (!httpSignature.verifySignature(parsed, publicKey)) {
        res.status(401).send('Request signature could not be verified');
      } else {
        // UserService.addObject(actorUsername, req.body).then(r => {
        res.status(201).end();
        //});
      }
 
    }
  }

}
export default new Controller();
