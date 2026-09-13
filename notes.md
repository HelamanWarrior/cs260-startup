# CS 260 Notes

This file represents what I have learned about web programming.
I love web programming.

- [My startup](https://startup.cs260.click)
- [My simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## Transcription backends

### WhisperCPP

Very mature project, supports wide-range of devices. However only works with whisper models, which are prone to heavily hallucinate or loop during quiet segments.

The whisper models perform best with heavy background noise, but there are newer lighter weight models that don't face such hallucination or looping issues.

### Sherpa-Onnx

Very obscure project, built to support a large amount of embedded systems. At first glace, the documentation appears to be very detailed, but many of the pages are mostly empty.

Supports virtually all ASR models one could want, however it appears that they are built or rather converted to work for sherpa-onnx. It's important to download the models released by sherpa-onnx.

### TranscribeCPP

Designed to be a drop-in replacement to whispercpp with the intention of running a diverse set of ggml model families rather than locked to whisper. Much more future-proof than whispercpp in that regard, as OpenAI hasn't done much with Whisper in a while. It's a much newer project, created by Mozilla employees. Documentation is well put-together.

With the ability to run frontier models such as Nvidia's Parakeet, it's clear that TranscribeCPP is the best fit for this project.

#### Benchmarks

250ms streamed chunks of a 9 minute audio clip.

| Hardware | Speed | Process time |
|----------|-------|------------|
| NVIDIA GeForce RTX 3060 Ti | 39x | 14s |
| AMD Ryzen 5 5600X | 16x | 35s |

Despite the GPU being over twice as fast, this clearly shows that CPU transcription is fully capable as well (especially with real-time transcription). These benchmarks reveal it's quite likely I can have a model like this run in real-time on smartphone hardware.

## AWS

Interesting things I have learned about AWS

## HTML

Interesting things I have learned about HTML

## React

Interesting things I have learned about React
