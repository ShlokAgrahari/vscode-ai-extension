import * as vscode from 'vscode';
import * as path from 'path';
import { askAI } from './openai';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-ai-chat.openChat', () => {
      const panel = vscode.window.createWebviewPanel(
        'aiChat',
        'AI Chat Assistant',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        }
      );

      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'bundle.js'))
      );

      panel.webview.html = getWebviewHtml(scriptUri);

      panel.webview.onDidReceiveMessage(async message => {
        if (message.type === "user-message") {
          const aiReply = await askAI(message.text);
          panel.webview.postMessage({ type: "ai-reply", text: aiReply });
        }

        if (message.type === "request-file") {
          const workspaceFolders = vscode.workspace.workspaceFolders;
          if (!workspaceFolders) return;

          const fileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, message.filename);
          const ext = path.extname(fileUri.fsPath).toLowerCase();

          try {
            const content = await vscode.workspace.fs.readFile(fileUri);

            if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
              const base64 = Buffer.from(content).toString("base64");
              const mimeType =
                ext === ".png" ? "image/png" :
                ext === ".gif" ? "image/gif" :
                "image/jpeg";

              panel.webview.postMessage({
                type: "image-attached",
                filename: message.filename,
                dataUrl: `data:${mimeType};base64,${base64}`,
              });
              return;
            }

            const text = Buffer.from(content).toString("utf8");

            panel.webview.postMessage({
              type: "file-attached",
              filename: message.filename,
              content: text,
            });

            const aiReply = await askAI(
              `Can you explain this file named "${message.filename}"?\n\n${text}`
            );
            panel.webview.postMessage({ type: "ai-reply", text: aiReply });

          } catch (err) {
            panel.webview.postMessage({
              type: "file-error",
              filename: message.filename,
              error: "Could not read file.",
            });
          }
        }
      });
    })
  );
}

function getWebviewHtml(scriptUri: vscode.Uri): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Chat</title>
      </head>
      <body>
        <div id="root"></div>
        <script src="${scriptUri}"></script>
      </body>
    </html>
  `;
}
