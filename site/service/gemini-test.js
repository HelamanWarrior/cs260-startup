const { generateTitleAndTags } = require('./titler');

generateTitleAndTags(
  "So today I transitioned from Vim to NeoVim, which is pretty good actually. I got telescope working and I've been pretty happy with it. I'm hoping to replace VS Code eventually, but I still need to get LSP working."
)
  .then(console.log)
  .catch(console.error);
