function findBlockComments(text) {
  const ranges = [];
  const lines = text.split("\n");
  let inBlockComment = false;

  lines.forEach((line, lineNumber) => {
    let character = 0;

    while (character < line.length) {
      if (inBlockComment) {
        const end = line.indexOf("*/", character);
        const endCharacter = end === -1 ? line.length : end + 2;

        if (endCharacter > character) {
          ranges.push({
            line: lineNumber,
            character,
            length: endCharacter - character,
          });
        }

        if (end === -1) {
          break;
        }

        inBlockComment = false;
        character = endCharacter;
        continue;
      }

      const start = line.indexOf("/*", character);
      if (start === -1) {
        break;
      }

      const slashComment = line.indexOf("//", character);
      const mushComment = line.indexOf("@@", character);
      const lineCommentStarts = [slashComment, mushComment].filter(
        (candidate) => candidate !== -1
      );

      if (
        lineCommentStarts.length &&
        Math.min(...lineCommentStarts) < start
      ) {
        break;
      }

      inBlockComment = true;
      character = start;
    }
  });

  return ranges;
}

module.exports = { findBlockComments };
