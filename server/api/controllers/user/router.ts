import * as express from 'express';
import { ensureUserExists } from './middleware';
import controller from './controller'
export default express.Router()
    .get('/:preferredUsername', ensureUserExists, controller.getResource)
    .get('/:preferredUsername/inbox', ensureUserExists, controller.getInbox)
    .post('/:preferredUsername/inbox', ensureUserExists, controller.postInbox);