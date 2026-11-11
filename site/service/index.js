const http = require('http');
const { WebSocketServer } = require('ws');

const { parseCookie } = require('cookie');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');

const transcriber = require('./transcription/transcriber');
const { handleConnection } = require('./transcription/transcribeSocket');
const { generateTitleAndTags } = require('./notes/titler');
const { searchNotes } = require('./notes/search');
const { answerQuestion } = require('./notes/answer');
const { rateLimit } = require('./middleware/rateLimit');

const app = express();

// In production the service sits behind a single reverse proxy (nginx).
// Trust exactly one hop so `req.ip` is the real client, not the proxy, while
// still ignoring any X-Forwarded-For values the client tries to inject.
app.set('trust proxy', 1);

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

// Basic credential checks. Keep the same rules on the client, but never trust it.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200; // bcrypt only uses the first 72 bytes; cap input to bound work

// Returns a cleaned { email, password } or null if the credentials are invalid.
function validCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return null;
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) return null;

  return { email, password };
}

// Throttle unauthenticated auth attempts per client IP to slow brute force and
// account spam. Two windows: a short burst limit and a sustained hourly cap.
const authLimit = rateLimit(
  [
    { windowMs: 60_000, max: 10 },        // 10 attempts per minute
    { windowMs: 60 * 60_000, max: 50 },   // 50 attempts per hour
  ],
  (req) => req.ip,
);

// CreateAuth a new user
apiRouter.post('/auth/create', authLimit, async (req, res) => {
  const creds = validCredentials(req.body);
  if (!creds) {
    return res.status(400).send({ msg: 'Invalid email or password (min 8 characters)' });
  }
  if (await findUser('email', creds.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(creds.email, creds.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', authLimit, async (req, res) => {
  const creds = validCredentials(req.body);
  if (!creds) {
    return res.status(401).send({ msg: 'Unauthorized' });
  }
  const user = await findUser('email', creds.email);
  if (user) {
    if (await bcrypt.compare(creds.password, user.password)) {
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

// ChangeAuth update the current user's password
apiRouter.put('/auth/password', verifyAuth, async (req, res) => {
  const currentPassword = String(req.body?.currentPassword ?? '');
  const newPassword = String(req.body?.newPassword ?? '');

  if (!(await bcrypt.compare(currentPassword, req.user.password))) {
    return res.status(401).send({ msg: 'Current password is incorrect' });
  }
  if (newPassword.length < 8) {
    return res.status(400).send({ msg: 'New password must be at least 8 characters' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).send({ msg: 'New password must differ from the current one' });
  }

  req.user.password = await bcrypt.hash(newPassword, 10);
  // Rotate the session token so the new credentials take effect immediately
  req.user.token = uuid.v4();
  setAuthCookie(res, req.user.token);
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
const saveLimit = rateLimit([{ windowMs: 60 * 60_000, max: 30 }]);
apiRouter.post('/notes', verifyAuth, saveLimit, (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) return res.status(400).send({ msg: 'Empty note' });

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

// AI answer
const answerLimit = rateLimit([
  { windowMs: 60_000, max: 8 },			// 8 answers per minute
  { windowMs: 24 * 60 * 60_000, max: 150 },	// 150 per day
]);

apiRouter.post('/notes/answer', verifyAuth, answerLimit, async (req, res) => {
  const query = String(req.body?.query ?? '').trim().slice(0, 300);
  if (!query) return res.status(400).send({ msg: 'Missing query' });

  try {
    const mine = notes.filter((n) => n.owner === req.user.email);
    res.send(await answerQuestion(mine, query));
  } catch (err) {
    console.error('Answer failed:', err.message);
    res.status(502).send({ msg: 'Could not write an answer' });
  }
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
