import UserService from '../../services/user.service';
import * as httpSignature from 'http-signature';
import { Request, Response } from 'express';
import * as request from 'request';
import * as validator from 'validator';
import { parse } from 'querystring';

export class Controller {

  getResource(req: Request, res: Response): void {
    UserService.byResource(req.params.preferredUsername).then(r => {
      return res.json(r);
    });
  }

  getInbox(req: Request, res: Response): void {
    const actorUsername = req.params.preferredUsername;
    UserService.buildInbox(actorUsername).then(inbox => {
      return res.json(inbox);
    });
  }

  postInbox(req: Request, res: Response): Response {
    const actorUsername = req.params.preferredUsername;
    let parsed;

    if (req.body.actor !== req.body.object.attributedTo) {
      return res.status(400).send('Actor and AttributedTo must match');
    }

    try {
      parsed = httpSignature.parseRequest(req);
    } catch (error) {
      return res.status(401).send(`Request signature could not be parsed: ${error.message}`);
    }

    if (parsed) {
      (!validator.isURL(parsed.keyId)) || res.status(400).send(`Invalid keyId : ${parsed.keyId}`);

      request.get(parsed.keyId, function (error, response) {
        if (error || !response || !response.body) {
          return res.status(400).send(`Unable to access: ${parsed.keyId}`);
        } else {
          let jsonBody;
          try {
            jsonBody = JSON.parse(response.body)
          } catch (error) {
            return res.status(400).send(`Invalid public key response: ${parsed.keyId}`);
          }
          const publicKey = jsonBody.publicKey ? jsonBody.publicKey.publicKeyPem : null;
          if (publicKey) {
            let verified = false;
            try {
              verified = httpSignature.verifySignature(parsed, publicKey);
            } catch (error) {
              return res.status(401).send(`Request signature could not be verified: ${error.message}`);
            }

            // TODO: validate req.body as ActivityStreams Object
            // TODO: remove properties that can be re-created easily instead of just dumping the entire message

            if (verified) {
              UserService.addObjectToInbox(actorUsername, req.body).then(inbox => {
                return (inbox ? res.status(201).end() : res.status(500).end());
              });
            } else {
              return res.status(401).send(`Request signature could not be verified`);
            }
          } else {
            return res.status(400).send('Public key not found, request signature cannot be verified.');
          }
        };
      });
    };
  }
};

export default new Controller();
