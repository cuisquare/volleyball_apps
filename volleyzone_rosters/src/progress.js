function logProgress(message) {
  process.stderr.write(`[volleyzone] ${message}\n`);
}

module.exports = {
  logProgress,
};
