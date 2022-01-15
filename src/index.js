import { handler } from './handler.js';
import compression from 'compression';
import express from 'express';
import Gun from 'gun';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

global.__dirname = dirname(fileURLToPath(import.meta.url));

/* global PATH_ENV, HOST_ENV, PORT_ENV */

export const path = process.env[PATH_ENV] || false;
export const host = process.env[HOST_ENV] || '0.0.0.0';
export const port = process.env[PORT_ENV] || (!path && '3000');

const server = express();

server.use(Gun.serve);

server.use(
  // @ts-ignore - nothing we can do about so just ignore it
	compression({ threshold: 0 }),
	handler
);
  
server.listen(port);

Gun({file: 'data', web: server})


console.log('Server started on port ' + port + ' with /gun');

export { server };
