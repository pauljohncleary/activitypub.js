import * as express from 'express';
import controller from './controller'
export default express.Router()
    .get('/:preferredUsername', controller.getResource)
    .post('/:preferredUsername/inbox', controller.postInbox);