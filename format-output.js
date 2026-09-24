function joinBraceContinuationLines(text) {
  return text.replace(/\r\n?/g, "\n").replace(/\n[ \t]*(?=[{}])/g, "");
}

module.exports = { joinBraceContinuationLines };
