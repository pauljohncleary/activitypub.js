import { Application } from 'express';
import webfingerRouter from './api/controllers/webfinger/router'
export default function routes(app: Application): void {
  app.use('/.well-known/webfinger', webfingerRouter);
};