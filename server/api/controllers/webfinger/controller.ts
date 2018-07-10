import WebFingerService from '../../services/webfinger.service';
import { Request, Response } from 'express';

export class Controller {

  getResource(req: Request, res: Response): void {
    WebFingerService.byResource(req.params.resource).then(r => {
      // TODO
      if (r) res.json(r);
      else res.status(404).end();
    });
  }
}
export default new Controller();
