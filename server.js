import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir));

app.get('/index', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`raqeem server listening on http://0.0.0.0:${PORT}`);
});
