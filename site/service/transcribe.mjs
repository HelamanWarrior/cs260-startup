import { TranscribeModel } from "transcribe-cpp";
import { spawn } from "node:child_process";

const model = await TranscribeModel.load("models/nemotron-speech-streaming-en-0.6b-Q8_0.gguf");

function decodeToPcm(path) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-loglevel", "error",
      "-i", path,
      "-f", "f32le",
      "-acodec", "pcm_f32le",
      "-ar", "16000",
      "-ac", "1",
      "pipe:1",
    ]);

    const chunks = [];
    ff.stdout.on("data", (c) => chunks.push(c));
    ff.on("error", reject); // e.g. ffmpeg not installed
    ff.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited with ${code}`));
      const buf = Buffer.concat(chunks);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      resolve(new Float32Array(ab));
    });
  });
}

// 16 kHz mono float32 PCM (bring your own decoder).
const pcm = await decodeToPcm("test.wav");
console.log(`${pcm.length} samples = ${(pcm.length / 16000).toFixed(2)}s`);

const result = await model.transcribe(pcm, { timestamps: "segment" });

console.log(result.text);
console.log(result.language); // model-detected, or "" when unavailable/a hint was supplied
for (const seg of result.segments) {
  console.log(`[${seg.t0Ms}–${seg.t1Ms}ms] ${seg.text}`);
}

model.dispose();
