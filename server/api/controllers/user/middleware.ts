import { Request, Response } from 'express';
import UserService from '../../services/user.service';

export function ensureUserExists(req: Request, res: Response, next: Function): Response {
  const preferredUsername = req.params.preferredUsername;

  if (!preferredUsername) {
    return res.status(400).send('Missing username');
  }

  UserService.checkUsernameExists(preferredUsername).then(actor => {
    return actor ? next() : res.status(404).send('User not found');
  });
};

