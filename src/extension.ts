import * as vscode from 'vscode';
import { exec, ExecException } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';

const knitRmd = function () {
    let terminal = vscode.window.activeTerminal;
    let editor = vscode.window.activeTextEditor;
    if (terminal !== undefined && editor !== undefined) {
        let path = editor.document.fileName.replace(/\\/gi, "/");
        terminal.sendText(`rmarkdown::render("${path}")`);
    }
};

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
            cursormove = cursormove - 1;
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
};

const runCommand = function () {
    // Type checks
    if (!vscode.window.activeTextEditor) {
        vscode.window.showErrorMessage('No active text editor found.');
        return;
    }

    // Variable definitions
    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    const tempDir = os.tmpdir();
    const ext = process.platform === "win32" ? "bat" : "sh";
    const commandFile = `${tempDir}/temp_command.${ext}`;
    const selectionFile = `${tempDir}/temp_selection.txt`;

    // Helper Functions
    const insertIntoEditor = function (error: ExecException | null, stdout: string, stderr: string) {
        editor.edit(editBuilder => {
            if (selection.isEmpty) {
                editBuilder.insert(selection.active, stdout);
            } else {
                editBuilder.replace(selection, stdout);
            }
        });

    };
    const handleInput = function (input: string | undefined) {
        if (typeof input === 'undefined') {return;}; // User canceled the input box
        fs.writeFileSync(commandFile, input);
        fs.writeFileSync(selectionFile, selectedText);
        var sh = process.platform === "win32" ? "cmd.exe /q /c" : "/bin/sh -e";
        var cmd = `${sh} ${commandFile} <${selectionFile} 2>&1`;
        exec(cmd, insertIntoEditor);
    };

    // Show input box and call handler after the user finished their input
    vscode.window.showInputBox({ prompt: 'Enter input:' }).then(handleInput);
};

const runSelection = function () {
    const window = vscode.window
    const editor = window.activeTextEditor;
    if (!editor) {
        window.showErrorMessage('No active text editor found.');
        return;
    }
    if (editor.selection.isEmpty) {
        const activeLine = editor.selection.active.line;
        const startPosition = new vscode.Position(activeLine, 0);
        const endPosition = new vscode.Position(activeLine + 1, 0);
        const newSelection = new vscode.Selection(startPosition, endPosition);
        editor.selection = newSelection;
    }
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (selectedText.trim() === "") {
        window.showErrorMessage('Current selection is empty.');
    }
    const tempDir = os.tmpdir();
    const ext = process.platform === "win32" ? "bat" : "sh";
    const commandFile = `${tempDir}/temp_command.${ext}`;
    fs.writeFileSync(commandFile, selectedText);
    var sh = process.platform === "win32" ? "cmd.exe /q /c" : "/bin/sh -e";
    var inp = process.platform === "win32" ? "<nul" : "</dev/null";
    var cmd = `${sh} ${commandFile} 2>&1 ${inp}`;
    exec(cmd, (error, stdout, stderr) => {
        editor.edit(editBuilder => {
            editBuilder.replace(selection, stdout);
        })
    } );
};

export function activate(context: vscode.ExtensionContext) {
    let registrationObjs = [
        vscode.commands.registerCommand('vstosc.knitRmd', knitRmd),
        vscode.commands.registerTextEditorCommand('vstosc.mathMode', mathMode),
        vscode.commands.registerTextEditorCommand('vstosc.runCommand', runCommand),
        vscode.commands.registerTextEditorCommand('vstosc.runSelection', runSelection),
    ];
    context.subscriptions.push(...registrationObjs);
};

export function deactivate() { };
