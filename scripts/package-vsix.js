const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const manifest = require(path.join(root, "package.json"));
const vsceManifestPath = require.resolve("@vscode/vsce/package.json");
const vsceManifest = require(vsceManifestPath);
const vscePath = path.resolve(
  path.dirname(vsceManifestPath),
  vsceManifest.bin.vsce
);
const releaseDirectory = path.join(root, "releases");
const outputPath = path.join(
  releaseDirectory,
  `${manifest.name}-${manifest.version}.vsix`
);

fs.mkdirSync(releaseDirectory, { recursive: true });

const result = spawnSync(
  process.execPath,
  [vscePath, "package", "--out", outputPath],
  { cwd: root, stdio: "inherit" }
);

if (result.error) throw result.error;
process.exitCode = result.status === null ? 1 : result.status;
