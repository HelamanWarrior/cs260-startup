const http = require('http');
const { WebSocketServer } = require('ws');

const { parseCookie } = require('cookie');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');

const transcriber = require('./transcriber');
const { handleConnection } = require('./transcribeSocket');
const { generateTitleAndTags } = require('./titler');
const { searchNotes } = require('./search');

const app = express();

const authCookieName = 'token';
const users = [];
const notes = [];

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Router for service endpoints
var apiRouter = express.Router();
app.use('/api', apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Get TranscribeCPP backend health
apiRouter.get('/health', async (_req, res) => {
  res.json({ ok: true, modelLoaded: transcriber.isLoaded() });
});

const UNDO_GRACE_MS = 8000;

function enrichNote(note) {
  generateTitleAndTags(note.text)
    .then((meta) => Object.assign(note, meta, { status: 'ready' }))
    .catch((err) => {
      console.error('Note enrichment failed:', err.message);
      note.status = 'failed';
    });
}

// Create a note
apiRouter.post('/notes', verifyAuth, (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) return req.status(400).send({ msg: 'Empty note' });

  const note = {
    id: uuid.v4(),
    owner: req.user.email,
    text,
    createdAt: Date.now(),
    title: null,
    summary: '',
    tags: [],
    keywords: [],
    status: 'pending',
  };
  notes.push(note);
  res.status(201).send({ id: note.id, createdAt: note.createdAt });

  // After the undo window, label the note in the background if it still exists
  setTimeout(() => {
    if (notes.includes(note)) enrichNote(note);
  }, UNDO_GRACE_MS);
});

// List my notes, newest first
apiRouter.get('/notes', verifyAuth, (req, res) => {
  const mine = notes
    .filter((n) => n.owner === req.user.email)
    .map(({ owner, ...rest }) => rest)
    .reverse();
  res.send(mine);
});

// Delete a note
apiRouter.delete('/notes/:id', verifyAuth, (req, res) => {
  const i = notes.findIndex((n) => n.id === req.params.id && n.owner === req.user.email);
  if (i === -1) return res.status(404).send({ msg: 'Not found' });
  notes.splice(i, 1);
  res.status(204).end();
});

// Search notes
apiRouter.get('/notes/search', verifyAuth, (req, res) => {
  const q = String(req.query.q ?? '').trim().slice(0, 200);
  if (!q) return res.status(400).send({ msg: 'Missing query' });

  const mine = notes.filter((n) => n.owner === req.user.email);
  res.send(searchNotes(mine, q));
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Default error handler
app.use(function (err, req, res, next) {
   res.status(err.status || 500).send({ type: err.name, message: err.message });
});

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

let shuttingDown = false;
async function shutdown(server, wss) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('Shutting down...');

  server.close(); // stop accepting new connections
  for (const client of wss.clients) client.close(1001); // 1001 = going away

  const idle = await Promise.race([
    transcriber.whenIdle().then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
  ]);
  if (idle) transcriber.dispose();
  process.exit(0);
}

async function start() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
  await transcriber.loadModel();

  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => shutdown(server, wss));
  }

  server.on('upgrade', async (req, socket, head) => {
    if (req.url !== '/ws/transcribe') return socket.destroy();

    const onSocketError = (err) => console.error(err);
    socket.on('error', onSocketError);

    let user;
    try {
      const cookies = parseCookie(req.headers.cookie || '');
      user = await findUser('token', cookies[authCookieName]);
    } catch (err) {
      console.error(err);
    }

    if (!user) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      return socket.destroy();
    }

    socket.removeListener('error', onSocketError);
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit('connection', ws, req),
    );
  });

  wss.on('connection', handleConnection);
  server.listen(port, () => console.log(`Listening on port ${port}`));
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
