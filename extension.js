const vscode = require("vscode");
const { formatter } = require("@digibear/mush-format");
const { default: axios } = require("axios");
const path = require("path");
const { findBlockComments } = require("./block-comments");

const blockCommentLegend = new vscode.SemanticTokensLegend(["comment"]);

function blockCommentsEnabled() {
  return vscode.workspace
    .getConfiguration("mushcode")
    .get("blockComments.enabled", true);
}

function languageConfiguration() {
  const comments = { lineComment: "//" };
  if (blockCommentsEnabled()) {
    comments.blockComment = ["/*", "*/"];
  }

  return {
    comments,
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
      ['"', '"'],
      ["'", "'"],
    ],
    surroundingPairs: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
      ['"', '"'],
      ["'", "'"],
    ],
  };
}

function activate(context) {
  const blockCommentTokensChanged = new vscode.EventEmitter();
  let languageConfigurationRegistration =
    vscode.languages.setLanguageConfiguration(
      "mush",
      languageConfiguration()
    );

  const blockCommentProvider =
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: "mush" },
      {
        onDidChangeSemanticTokens: blockCommentTokensChanged.event,
        provideDocumentSemanticTokens(document) {
          const builder = new vscode.SemanticTokensBuilder(blockCommentLegend);

          if (blockCommentsEnabled()) {
            findBlockComments(document.getText()).forEach((range) => {
              builder.push(
                range.line,
                range.character,
                range.length,
                0,
                0
              );
            });
          }

          return builder.build();
        },
      },
      blockCommentLegend
    );

  const configurationChanged = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (!event.affectsConfiguration("mushcode.blockComments.enabled")) {
        return;
      }

      languageConfigurationRegistration.dispose();
      languageConfigurationRegistration =
        vscode.languages.setLanguageConfiguration(
          "mush",
          languageConfiguration()
        );
      blockCommentTokensChanged.fire();
    }
  );

  let disposable = vscode.commands.registerCommand(
    "extension.format",
    async function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        console.log("No editor!");
        return;
      }
      const document = editor.document;
      let filepath = editor.document.fileName;
      filepath = path.dirname(filepath);
      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showWarningMessage("Select the MUSH code to format first.");
        return;
      }
      const text = document.getText(selection).replace(/\r\n?/g, "\n");
      const formatted = await formatter.format(text, filepath);
      vscode.env.clipboard.writeText(formatted.data);
    }
  );

  let disposable2 = vscode.commands.registerCommand(
    "extension.postSelection",
    async function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        console.log("No editor!");
        return;
      }
      const document = editor.document;
      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showWarningMessage("Select the MUSH code to post first.");
        return;
      }
      const text = document.getText(selection).replace(/\r\n?/g, "\n");
      const formatted = await formatter.format(text);
      const user = vscode.workspace.getConfiguration("game").get("dbref");
      const pass = vscode.workspace.getConfiguration("game").get("password");
      const host = vscode.workspace.getConfiguration("game").get("host");
      const port = vscode.workspace.getConfiguration("game").get("port");
      const buff = new Buffer.from(
        formatted.data.replace(/([\[\]%\{\};])/g, "%$1").replace(/\\/g, "%\\")
      );
      const res = await axios({
        method: "post",
        url: `${host}:${port}`,
        timeout: 2000,
        auth: {
          username: user,
          password: pass,
        },
        headers: {
          exec64: buff.toString("base64"),
        },
      }).catch((err) => console.log(err.message));

      if (res && res.status == 200) {
        vscode.window.showInformationMessage("Selection Posted to game!");
      }
    }
  );

  context.subscriptions.push(
    disposable,
    disposable2,
    blockCommentProvider,
    blockCommentTokensChanged,
    configurationChanged,
    { dispose: () => languageConfigurationRegistration.dispose() }
  );
}

exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
