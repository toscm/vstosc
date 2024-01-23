import * as vscode from 'vscode';
import * as fs from 'fs';
import { getLineOfCurrentRFunc, getNameOfCurrentRFunc, showNoEditorMsgAndExit, showNoTerminalMsgAndExit } from './util';
import * as path from 'path';

export async function testRFunction() {
    console.log(`ENTERING FUNCTION testRFunction`);
    let editor = vscode.window.activeTextEditor ?? showNoEditorMsgAndExit();
    let terminal = vscode.window.activeTerminal ?? showNoTerminalMsgAndExit();
    let document = editor.document;
    let packagePath = findPackagePath(path.dirname(document.fileName)); // shows info and throws error if not found
    let fullPath = document.fileName.replace(/\\/gi, "/");
    let fullPathLowerCase = fullPath.toLowerCase();
    let relPath = path.relative(packagePath, fullPath);
    let testFileSelected = fullPathLowerCase.includes('/tests/testthat/');
    console.log('editor:', editor);
    console.log('terminal:', terminal);
    console.log('document:', document);
    console.log('packagePath:', packagePath);
    console.log('fullPath:', fullPath);
    console.log('fullPathLowerCase:', fullPathLowerCase);
    console.log('relPath:', relPath);
    console.log('testFileSelected:', testFileSelected);
    if (testFileSelected) {
        terminal.sendText(`devtools::load_all(); testthat::test_file("${fullPath}")`);
        terminal.show();
    } else {
        let functionLine = getLineOfCurrentRFunc(editor, editor.selection.active.line);
        let functionName = getNameOfCurrentRFunc(functionLine, document);
        let testPath1 = path.join(packagePath, `tests/testthat/test_${functionName}.R`);
        let testPath2 = path.join(packagePath, `tests/testthat/test-${functionName}.R`);
        let testPath = fs.existsSync(testPath1) ? testPath1 : testPath2;
        testPath = testPath.replace(/\\/g, '/');
        console.log('functionLine:', functionLine);
        console.log('functionName:', functionName);
        console.log('testPath:', testPath);
        if (fs.existsSync(testPath)) {
            terminal.sendText(`devtools::load_all(); testthat::test_file("${testPath}")`);
            terminal.show();
        } else {
            fs.writeFileSync(testPath, '');
            let document = await vscode.workspace.openTextDocument(testPath);
            await vscode.window.showTextDocument(document);
        }
    }
    console.log(`RETURNING FROM FUNCTION testRFunction\n`);
}


export function findPackagePath(startPath: string): string {
    let currentPath = startPath;
    while (currentPath !== path.parse(currentPath).root) {
        const files = fs.readdirSync(currentPath);
        if (files.includes('DESCRIPTION')) {
            return currentPath;
        }
        currentPath = path.dirname(currentPath);
    }
    vscode.window.showInformationMessage('Current file must be part of an R package');
    throw new Error('Current file must be part of an R package');
}
