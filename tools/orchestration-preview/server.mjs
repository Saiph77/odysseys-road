#!/usr/bin/env node
/**
 * Static server + comments API for orchestration preview.
 *   node tools/orchestration-preview/server.mjs
 *   → http://localhost:4180/tools/orchestration-preview/
 */

import { createServer } from 'node:http';
import { createReadStream, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const PORT = Number(process.env.PORT || 4180);
const COMMENTS_PATH = join(ROOT, 'public/assets/keyframes/official-trailer/comments.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body, null, 2));
}

function readComments() {
  if (!existsSync(COMMENTS_PATH)) {
    return { version: 1, updatedAt: null, beats: {} };
  }
  return JSON.parse(readFileSync(COMMENTS_PATH, 'utf8'));
}

function writeComments(data) {
  data.updatedAt = new Date().toISOString();
  writeFileSync(COMMENTS_PATH, `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

function serveFile(req, res, filePath) {
  const ext = extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';
  const { size } = statSync(filePath);

  // MP4 must support Range for browser seeking
  if (ext === '.mp4') {
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : size - 1;
        if (start >= size || end >= size) {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` });
          res.end();
          return;
        }
        const chunkSize = end - start + 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        });
        createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    });
    createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(200, { 'Content-Type': contentType });
  res.end(readFileSync(filePath));
}

function serveStatic(req, res, urlPath) {
  const safe = urlPath.split('?')[0].replace(/\.\./g, '');
  const filePath = join(ROOT, safe === '/' ? 'tools/orchestration-preview/index.html' : safe.replace(/^\//, ''));

  if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  if (!statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  serveFile(req, res, filePath);
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (url.pathname === '/api/comments') {
    if (req.method === 'GET') {
      sendJson(res, 200, readComments());
      return;
    }
    if (req.method === 'PUT') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (!parsed || typeof parsed.beats !== 'object') {
            sendJson(res, 400, { error: 'Invalid body: need beats object' });
            return;
          }
          const saved = writeComments({
            version: parsed.version ?? 1,
            updatedAt: null,
            beats: parsed.beats,
          });
          sendJson(res, 200, saved);
        } catch (e) {
          sendJson(res, 400, { error: String(e.message) });
        }
      });
      return;
    }
  }

  if (url.pathname === '/' || url.pathname === '/tools/orchestration-preview' || url.pathname === '/tools/orchestration-preview/') {
    serveStatic(req, res, '/tools/orchestration-preview/index.html');
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Orchestration preview: http://localhost:${PORT}/tools/orchestration-preview/`);
  console.log(`Comments file: ${COMMENTS_PATH}`);
});
