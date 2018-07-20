import UserService from '../../services/user.service';
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

    // TODO: validate http signature, date, check attributedto and who it's from are the same
    if (!actorUsername) {
      res.status(400).send('Missing username');
    } else {
      UserService.addObject(actorUsername).then(r => {
      //  res.status(201).end();
      });
    }
  }

}
export default new Controller();
