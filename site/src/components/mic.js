export async function startMic(onChunk) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });
  
  const ctx = new AudioContext({ sampleRate: 16000 });
  console.log('AudioContext sampleRate:', ctx.sampleRate);
  
  await ctx.audioWorklet.addModule('/pcm-worklet.js');

  const source = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, 'pcm-processor');
  node.port.onmessage = (e) => onChunk(e.data);

  // Keep the graph running without playing your voice through the speakers
  const mute = ctx.createGain();
  mute.gain.value = 0;
  source.connect(node).connect(mute).connect(ctx.destination);

  return async function stop() {
    node.port.onmessage = null;
    source.disconnect();
    node.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    await ctx.close();
  };
}
