import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { getLineOfCurrentRFunc, getNameOfCurrentRFunc, showNoEditorMsgAndExit } from './util';

export function updateRDocstring() {
    console.log(`ENTERING FUNCTION updateRDocstring`);
    let editor = vscode.window.activeTextEditor ?? showNoEditorMsgAndExit();
    let document = editor.document;
    let functionLine = getLineOfCurrentRFunc(editor, editor.selection.active.line);
    let functionName = getNameOfCurrentRFunc(functionLine, document);
    let docstringRange = getDocstringRange(functionLine, document);
    let normalizedPath = path.normalize(document.fileName).replace(/\\/g, '/');
    // Call R to get updated docstring. In case an error occurs, display the
    // error message to the user. If no error occurs, replace the docstring in
    // the editor with the updated one.
    if (process.platform === 'win32') {
        var cmd = `cmd.exe /q /c Rscript -e "cat(toscutil::update_docstring('${normalizedPath}', '${functionName}'))"`;
    } else {
        var cmd = `/bin/bash -c "Rscript -e \\"cat(toscutil::update_docstring('${normalizedPath}', '${functionName}'))\\""`;
    }
    console.log(cmd);
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showInformationMessage(`${error.message}`);
        } else if (stderr) {
            vscode.window.showInformationMessage(`${stderr}`);
        } else if (stdout) {
            let docstringUpdated = stdout;
            console.log(`stdout: ${stdout}`);
            editor.edit(function (editBuilder) {
                editBuilder.replace(docstringRange, docstringUpdated);
            });
        }
    });
    console.log(`RETURNING FROM FUNCTION updateRDocstring\n`);
}


export function getDocstringRange(functionLine: number, document: vscode.TextDocument): vscode.Range {
    console.log(`ENTERING FUNCTION getDocstringRange`);
    let docstringRegex = /^\s*#'/;
    let docstringStartLine = functionLine;
    while (docstringStartLine >= 1 &&
        docstringRegex.test(document.lineAt(docstringStartLine - 1).text)) {
        docstringStartLine--;
    }
    let startPosition = new vscode.Position(docstringStartLine, 0);
    let endPosition = new vscode.Position(functionLine, 0);
    let docstringRange = new vscode.Range(startPosition, endPosition);
    console.log(`docstringRange.start.line: ${docstringRange.start.line} (zero-based)`);
    console.log(`docstringRange.start.character: ${docstringRange.start.character}`);
    console.log(`docstringRange.end.line: ${docstringRange.end.line} (zero-based)`);
    console.log(`docstringRange.end.character: ${docstringRange.end.character}`);
    console.log(`RETURNING FROM FUNCTION getDocstringRange\n`);
    return docstringRange;
}
