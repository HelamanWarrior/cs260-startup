const transcriber = require('./transcriber');

function handleConnection(ws) {
  ws.on('error', console.error);

  let lease;
  try {
    lease = transcriber.acquireSession();
  } catch (err) {
    console.error(err);
    return ws.close();
  }
  if (!lease) {
    ws.send(JSON.stringify({ type: 'busy' }));
    return ws.close();
  }

  const send = (obj) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(obj));
  let stream;
  let queue = lease.session
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
      lease.release();
    }
  });
}

module.exports = { handleConnection };
