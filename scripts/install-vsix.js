const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const manifest = require(path.join(root, "package.json"));
const vsixPath = path.join(
  root,
  "releases",
  `${manifest.name}-${manifest.version}.vsix`
);

if (!fs.existsSync(vsixPath)) {
  throw new Error(`VSIX not found: ${vsixPath}. Run npm run package first.`);
}

const command = process.platform === "win32" ? "code.cmd" : "code";
const result = spawnSync(
  command,
  ["--install-extension", vsixPath, "--force"],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" }
);

if (result.error) throw result.error;
process.exitCode = result.status === null ? 1 : result.status;
