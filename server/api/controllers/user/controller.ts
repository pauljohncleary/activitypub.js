import UserService from '../../services/user.service';
import * as httpSignature from 'http-signature';
import { Request, Response } from 'express';
import * as request from 'request';
import { parse } from 'querystring';

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
    let parsed;

    if (!actorUsername) {
      res.status(400).send('Missing username');
    } else {
      try {
        parsed = httpSignature.parseRequest(req);
      } catch (error) {
        res.status(401).send(`Request signature could not be parsed: ${error.message}`);
      }
    }

    if (parsed) {
      // TODO: check if parsed.keyId is a URI
      // TODO: check attributedto and who it's from are the same
      console.log(parsed);

      request.get(parsed.keyId, function (error, response) {        
        if (error || !response) {
          res.status(400).send(`Unable to access: ${parsed.keyId}, ${error.message}`);
        } else {
          const jsonBody = JSON.parse(response.body); //TODO: check if JSON parse introduces security holes
          const publicKey = jsonBody.publicKey ? jsonBody.publicKey.publicKeyPem : null; 
          console.log(publicKey)
          if (publicKey) {
            let verified = false;
            try {
              verified = httpSignature.verifySignature(parsed, publicKey);
            } catch (error) {
              console.log(error);
              res.status(401).send(`Request signature could not be verified: ${error.message}`);
            }
  
            if (verified) {
              // TODO: implement UserService.addObject(actorUsername, req.body).then(r => {
              res.status(201).end();
              //});
            } else {
              res.status(401).send(`Request signature could not be verified`);
            }       
          } else {
            res.status(400).send('Public key not found, request signature cannot be verified.');
          }
        };
      });
    };
  }
};

export default new Controller();
