class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buf = new Float32Array(2560); // 160 ms at 16 kHz
    this.filled = 0;
  }

  process(inputs) {
    const input = inputs[0][0]; // first input, first channel
    if (input) {
      this.buf.set(input, this.filled);
      this.filled += input.length;
      if (this.filled === this.buf.length) {
	this.port.postMessage(this.buf.slice()); // copy, then send to the main thread
	this.filled = 0;
      }
    }
    return true; // keep the processor alive
  }
}

registerProcessor('pcm-processor', PcmProcessor);
