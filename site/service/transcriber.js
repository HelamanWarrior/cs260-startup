const path = require('path');

let model;
let busy = false;
let idleWaiters = [];

async function loadModel() {
  const { TranscribeModel } = await import('transcribe-cpp');
  model = await TranscribeModel.load(
    path.join(
      __dirname,
      'models',
      'nemotron-speech-streaming-en-0.6b-Q8_0.gguf',
    ),
  );
}

function isLoaded() {
  return Boolean(model);
}

// Returns { session, release } or null if the model is in use.
function acquireSession() {
  if (busy) return null;
  busy = true;
  try {
    const session = model.createSession();
    let released = false;
    return {
      session,
      release() {
        if (released) return;
        released = true;
        try {
          session.dispose();
        } finally {
          busy = false;
          idleWaiters.forEach((resolve) => resolve());
          idleWaiters = [];
        }
      },
    };
  } catch (err) {
    busy = false;
    throw err;
  }
}

function whenIdle() {
  return busy
    ? new Promise((resolve) => idleWaiters.push(resolve))
    : Promise.resolve();
}

function dispose() {
  if (model) model.dispose();
  model = undefined;
}

module.exports = { loadModel, isLoaded, acquireSession, whenIdle, dispose };
