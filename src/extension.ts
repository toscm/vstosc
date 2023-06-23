import * as vscode from 'vscode';

const knitRmd = function () {
	let terminal = vscode.window.activeTerminal;
	let editor = vscode.window.activeTextEditor;
	if (terminal !== undefined && editor !== undefined) {
		let path = editor.document.fileName.replace(/\\/gi, "/");
		terminal.sendText(`rmarkdown::render("${path}")`);
	}
}

const mathMode = function () {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const currentPosition = editor.selection.active;
        const lineText = editor.document.lineAt(currentPosition.line).text;
		let insertText = '~$$';
		let deleteRange: vscode.Range | undefined;
		let cursormove = 2;
		if (currentPosition.character > 0 && lineText.charAt(currentPosition.character - 1) === ' ') {
			deleteRange = new vscode.Range(currentPosition.with(currentPosition.line, currentPosition.character - 1), currentPosition);
			cursormove = cursormove -1;
		}
		editor.edit((editBuilder) => {
			if (deleteRange) {
				editBuilder.delete(deleteRange);
			}
			editBuilder.insert(currentPosition, insertText);
		}).then(() => {
            const newPosition = new vscode.Position(currentPosition.line, currentPosition.character + cursormove);
            editor.selection = new vscode.Selection(newPosition, newPosition);
        });
	}
}

export function activate(context: vscode.ExtensionContext) {
	let registrationObjs = [
		vscode.commands.registerCommand('vstosc.knitRmd', knitRmd),
		vscode.commands.registerTextEditorCommand('vstosc.mathMode', mathMode),
	]
	context.subscriptions.push(...registrationObjs);
}

export function deactivate() { }
