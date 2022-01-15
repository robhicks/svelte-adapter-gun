import path from 'path';
import { fileURLToPath, URL, URLSearchParams } from 'url';
import { get_body as getBody } from '@sveltejs/app-utils/http'; // eslint-disable-line node/file-extension-in-import
import {
  fetch, Response, Request, Headers,
} from '@sveltejs/kit/install-fetch';

import express from 'express';
import GUN from 'gun';
import compression from 'compression';
import { render, init } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 3000,
  ASSETS = path.join(__dirname, 'assets'),
  PRERENDERED = path.join(__dirname, 'prerendered'),
} = process.env;

// shim fetch for node
global.fetch = fetch;
global.Response = Response;
global.Request = Request;
global.Headers = Headers;

init();

const svelteKit = async (request, response) => {
  const host = `${request.headers['x-forwarded-proto']}://${request.headers.host}`;
  const { pathname, query = '' } = new URL(request.url || '', host);

  const rendered = await render({
    host,
    method: request.method,
    headers: request.headers,
    path: pathname,
    query: new URLSearchParams(query),
    body: await getBody(request),
  });

  if (rendered) {
    const { status, headers, body } = rendered;
    return response.writeHead(status, headers).end(body);
  }

  return response.writeHead(404).end();
};

const app = express();
GUN({ web: app });
app.use(compression());
app.use('/', express.static(ASSETS));
app.use('/', express.static(PRERENDERED));
app.use(svelteKit);

app.listen(PORT, () => console.log(`gun adapter started on ${PORT}`));
