import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';


export function updateRDocstring() {
    console.log(`ENTERING FUNCTION updateRDocstring`);
    let editor = vscode.window.activeTextEditor ?? showNoEditorMsgAndExit();
    let document = editor.document;
    let functionLine = editor.selection.active.line;
    let functionName = getFunctionName(functionLine, document);
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


function showNoEditorMsgAndExit(): never {
    console.log(`ENTERING FUNCTION showNoEditorMsgAndExit`)
    let msg = 'No active text editor found.';
    vscode.window.showInformationMessage(msg);
    console.log(`THROWING ERROR FROM FUNCTION showNoEditorMsgAndExit\n`)
    throw new Error(msg);
}


function getFunctionName(functionLine: number, document: vscode.TextDocument): string {
    console.log(`ENTERING FUNCTION getFunctionName`);
    const lineText = document.lineAt(functionLine).text;
    const functionRegex = /(\w+)\s*(<-|=)\s*function\b/;
    const match = lineText.match(functionRegex);
    if (match && match.length > 1) {
        const functionName = match[1];
        console.log(`Function Name: "${functionName}"`)
        console.log(`Function Line: ${functionLine} (zero-based))`);
        console.log(`RETURNING FROM FUNCTION getFunctionName\n`);
        return functionName;
    } else {
        console.log(`THROWING ERROR FROM FUNCTION getFunctionName\n`);
        throw new Error(`No function found on line ${functionLine}.`);
    }
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
    console.log(`docstringRange.start.line: ${docstringRange.start.line} (zero-based)`)
    console.log(`docstringRange.start.character: ${docstringRange.start.character}`)
    console.log(`docstringRange.end.line: ${docstringRange.end.line} (zero-based)`)
    console.log(`docstringRange.end.character: ${docstringRange.end.character}`)
    console.log(`RETURNING FROM FUNCTION getDocstringRange\n`);
    return docstringRange;
}
