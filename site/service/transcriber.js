const path = require('path');

let model;
let busy = false;

async function loadModel() {
  const { TranscribeModel } = await import('transcribe-cpp');
  model = await TranscribeModel.load(
    path.join(__dirname, 'models', 'nemotron-speech-streaming-en-0.6b-Q8_0.gguf')
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
	}
      },
    };
  } catch (err) {
    busy = false;
    throw err;
  }
}

function dispose() {
  if (model) model.dispose();
  model = undefined;
}

module.exports = { loadModel, isLoaded, acquireSession, dispose };
