import * as vscode from 'vscode';

export function getLineOfCurrentRFunc(editor: vscode.TextEditor, startLine: number): number {
    const regex = /(\w+)\s*(<-|=)\s*function\b/;
    const text = editor.document.lineAt(startLine).text;
    if (text.startsWith("#'")) {
        // Search downwards
        for (let line = startLine; line < editor.document.lineCount; line++) {
            const text = editor.document.lineAt(line).text;
            if (!text.startsWith("#'") || regex.test(text)) {
                return line;
            }
        }
    } else {
        // Search upwards
        for (let line = startLine; line >= 0; line--) {
            const text = editor.document.lineAt(line).text;
            if (regex.test(text)) {
                return line;
            }
        }
    }
    throw new Error("Function definition not found");
}

export function getNameOfCurrentRFunc(functionLine: number, document: vscode.TextDocument): string {
    console.log(`ENTERING FUNCTION getNameOfCurrentRFunc`);
    const lineText = document.lineAt(functionLine).text;
    const functionRegex = /^(\w+)\s*(<-|=)\s*function\b/;
    const match = lineText.match(functionRegex);
    if (match && match.length > 1) {
        const functionName = match[1];
        console.log(`Function Name: "${functionName}"`)
        console.log(`Function Line: ${functionLine} (zero-based)`);
        console.log(`RETURNING FROM FUNCTION getNameOfCurrentRFunc\n`);
        return functionName;
    } else {
        console.log(`THROWING ERROR FROM FUNCTION getNameOfCurrentRFunc\n`);
        throw new Error(`No function found on line ${functionLine}.`);
    }
}


export function showNoEditorMsgAndExit(): never {
    console.log(`ENTERING FUNCTION showNoEditorMsgAndExit`)
    let msg = 'No active text editor found.';
    vscode.window.showInformationMessage(msg);
    console.log(`THROWING ERROR FROM FUNCTION showNoEditorMsgAndExit\n`)
    throw new Error(msg);
}


export function showNoTerminalMsgAndExit(): never {
    console.log(`ENTERING FUNCTION showNoEditorMsgAndExit`)
    let msg = 'No active Terminal was found.';
    vscode.window.showInformationMessage(msg);
    console.log(`THROWING ERROR FROM FUNCTION showNoEditorMsgAndExit\n`)
    throw new Error(msg);
}
