import "reflect-metadata";
import { createConnection } from "typeorm";
import L from './logger';

createConnection().then(connection => {
  L.info('Successfully connected to database');
}).catch(error => console.log(error));