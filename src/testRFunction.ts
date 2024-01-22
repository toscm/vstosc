import * as vscode from 'vscode';
import * as fs from 'fs';
import { getLineOfCurrentRFunc, getNameOfCurrentRFunc, showNoEditorMsgAndExit, showNoTerminalMsgAndExit } from './util';
import * as path from 'path';

export async function testRFunction() {
    console.log(`ENTERING FUNCTION testRFunction`);
    let editor = vscode.window.activeTextEditor ?? showNoEditorMsgAndExit();
    let terminal = vscode.window.activeTerminal ?? showNoTerminalMsgAndExit();
    let document = editor.document;
    let currentFilePath = document.fileName.replace(/\\/gi, "/");
    let lowercasePath = currentFilePath.toLowerCase();
    let testFileSelected = lowercasePath.includes('/tests/testthat/');
    let sourceFileSelected = lowercasePath.includes('/r/');
    console.log('editor:', editor);
    console.log('document:', document);
    console.log('terminal:', terminal);
    console.log('currentFilePath:', currentFilePath);
    console.log('lowercasePath:', lowercasePath);
    console.log('testFileSelected:', testFileSelected);
    console.log('sourceFileSelected:', sourceFileSelected);
    if (testFileSelected) {
        terminal.sendText(`testthat::test_file("${currentFilePath}")`);
        terminal.show();
    } else if (sourceFileSelected) {
        let functionLine = getLineOfCurrentRFunc(editor, editor.selection.active.line);
        let functionName = getNameOfCurrentRFunc(functionLine, document);
        let currentFileName = path.basename(currentFilePath);
        let testPath1 = currentFilePath.replace(`${currentFileName}`, `../tests/testthat/test-${functionName}.R`);
        let testPath2 = currentFilePath.replace(`${currentFileName}`, `../tests/testthat/test_${functionName}.R`);
        if (fs.existsSync(testPath1)) {
            terminal.sendText(`devtools::load_all(); testthat::test_file("${testPath1}")`);
            terminal.show();
        } else if (fs.existsSync(testPath2)) {
            terminal.sendText(`devtools::load_all(); testthat::test_file("${testPath2}")`);
            terminal.show();
        } else {
            fs.writeFileSync(testPath1, '');
            let document = await vscode.workspace.openTextDocument(testPath1);
            await vscode.window.showTextDocument(document);
        }
    } else {
        vscode.window.showInformationMessage('Neither test nor source file opened.');
    }
    console.log(`RETURNING FROM FUNCTION testRFunction\n`);
}