import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import L from './logger';
import { Actor } from '../entities/Actor';
import { Inbox } from '../entities/Inbox';
import { ASObject } from '../entities/ASObject';

// read connection options from .env variables and add entities
// environment database settings should be set in .env
getConnectionOptions()
  .then(connectionOptions => {
    return Object.assign(connectionOptions, { 
      entities: [Actor, Inbox, ASObject ],
      database: 'activitypub',
    });
  })
  .then(options => { createConnection(options) })
  .then(connection => {
    L.info('Successfully connected to database');
  })
  .catch(error => L.error(error));