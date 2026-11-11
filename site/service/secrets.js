const fs = require('fs');

// Read a secret following the "_FILE" convention used by Docker secrets and
// most container images. For a secret named FOO we prefer FOO_FILE (a path to a
// file, e.g. /run/secrets/foo) and fall back to the raw FOO env var so local
// development with a .env file keeps working.
//
// File-mounted secrets are preferred over env vars because they do not leak
// through `docker inspect`, `/proc/<pid>/environ`, or inherited child-process
// environments, and they are never baked into the image.
function readSecret(name, { required = true } = {}) {
  const filePath = process.env[`${name}_FILE`];
  if (filePath) {
    try {
      const value = fs.readFileSync(filePath, 'utf8').trim();
      if (value) return value;
      if (required) throw new Error(`Secret file for ${name} (${filePath}) is empty`);
      return undefined;
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`Secret file for ${name} not found at ${filePath}`);
      }
      throw err;
    }
  }

  const value = process.env[name];
  if (value && value.trim()) return value.trim();

  if (required) {
    throw new Error(
      `Missing secret ${name}. Set ${name}_FILE (preferred, e.g. a Docker secret) or ${name}.`,
    );
  }
  return undefined;
}

module.exports = { readSecret };
