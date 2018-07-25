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
      // TODO: check if actorUsername exists at this address
    } else {
      try {
        parsed = httpSignature.parseRequest(req);
      } catch (error) {
        res.status(401).send(`Request signature could not be parsed: ${error.message}`);
      }
    }

    if (parsed) {
      // TODO: check if parsed.keyId is a URI before trying to get it
      // TODO: check attributedto and who it's from are the same

      request.get(parsed.keyId, function (error, response) { 
        if (error || !response || !response.body) {
          res.status(400).send(`Unable to access: ${parsed.keyId}`);
        } else {
          const jsonBody = JSON.parse(response.body); //TODO: check if JSON parse introduces security holes
          const publicKey = jsonBody.publicKey ? jsonBody.publicKey.publicKeyPem : null; 
          if (publicKey) {
            let verified = false;
            try {
              verified = httpSignature.verifySignature(parsed, publicKey);
            } catch (error) {
              res.status(401).send(`Request signature could not be verified: ${error.message}`);
            }

            // TODO: validate req.body as ActivityStreams Object
  
            if (verified) {
              UserService.addObjectToInbox(actorUsername, req.body).then(inbox => {
                console.log(inbox);
                inbox ? res.status(201).end() : res.status(500).end();
              });
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
