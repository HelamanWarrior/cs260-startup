const http = require('http');
const { WebSocketServer } = require('ws');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const path = require('path');

const app = express();

const authCookieName = 'token';
const users = [];
let model;

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

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
  res.json({ ok: true, modelLoaded: Boolean(model) });
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
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

let busy = false;

function handleConnection(ws) {
  ws.on('error', console.error);
  if (busy) {
    ws.send(JSON.stringify({ type: 'busy' }));
    return ws.close();
  }
  busy = true; // synchronous, so two connections can't both pass the check

  const send = (obj) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(obj));

  let session;
  try {
    session = model.createSession();
  } catch (err) {
    console.error(err);
    busy = false;
    return ws.close();
  }

  let stream;
  let queue = session
    .stream()
    .then((s) => { stream = s; })
    .catch((err) => {
      console.error(err);
      ws.close();
    });

  ws.on('message', (data, isBinary) => {
    queue = queue
      .then(async () => {
	if (isBinary) {
	  const pcm = new Float32Array(
	    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
	  );
	  const update = await stream.feed(pcm);
	  if (update.resultChanged) {
	    const { committed, tentative } = stream.text;
	    send({ type: 'transcript', committed, tentative });
	  }
	} else if (data.toString() === 'stop') {
	  await stream.finalize();
	  send({ type: 'final', text: stream.text.committed });
	  ws.close();
	}
      })
      .catch((err) => {
	console.error(err);
	ws.close();
      });
  });

  ws.on('close', async () => {
    try {
      await queue;
      if (stream) stream.reset();
    } finally {
      session.dispose();
      busy = false;
    }
  });
}

async function start() {
  const { TranscribeModel } = await import('transcribe-cpp');
  model = await TranscribeModel.load(
    path.join(__dirname, 'models', 'nemotron-speech-streaming-en-0.6b-Q8_0.gguf')
  );

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (req.url !== '/ws/transcribe') return socket.destroy();
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });

  wss.on('connection', handleConnection);
  server.listen(port, () => console.log(`Listening on port ${port}`));
}

start();

process.on('SIGINT', () => {
  if (model) model.dispose();
  process.exit(0);
});
