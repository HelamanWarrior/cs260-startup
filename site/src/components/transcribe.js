import { startMic } from './mic';

export async function startTranscription({ onText, onFinal, onStatus, onClose }) {
  let ws;
  let stopping = false;
  const pending = [];

  // Mic first, ensures permission prompt doesn't burn the server's 15s idle timer
  const micStop = await startMic((chunk) => {
    if (ws?.readyState === WebSocket.OPEN) ws.send(chunk);
    else pending.push(chunk); // socket still connecting
  });

  let micStopped = false;
  const stopMic = async () => {
    if (micStopped) return;
    micStopped = true;
    await micStop();
  };

  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}/ws/transcribe`);

  ws.onopen = () => {
    pending.forEach((c) => ws.send(c));
    pending.length = 0;
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'transcript') onText(msg.committed, msg.tentative);
    else if (msg.type === 'final') onFinal(msg.text);
    else onStatus(msg.type); // 'busy' or 'timeout'
  };

  ws.onerror = () => onStatus('error');

  ws.onclose = () => {
    stopMic().catch(console.error);
    onClose();
  };

  return async function stop() {
    if (stopping) return;
    stopping = true;
    await stopMic();
    if (ws.readyState === WebSocket.OPEN) ws.send('stop'); // server finalizes, then closes
    else ws.close();
  };
}
