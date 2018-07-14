import { Application } from 'express';
import webfingerRouter from './api/controllers/webfinger/router';
import userRouter from './api/controllers/user/router';

export default function routes(app: Application): void {
  app.use('/.well-known/webfinger', webfingerRouter);
  app.use('/users', userRouter);
  app.use('*', (req, res) => { res.send(404); } ) //Handle 404s
};