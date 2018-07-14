import UserService from '../../services/user.service';
import { Request, Response } from 'express';

export class Controller {

  getResource(req: Request, res: Response): void {
    const resource = req.params;

    // TODO: add more advanced resource query validation using a library e.g. express-validator
    if (!resource) {
      res.status(400).send('Missing username');
    } else {
      UserService.byResource(resource).then(r => {
        r ? res.json(r) : res.status(404).end();
      });
    }
  }
}
export default new Controller();
