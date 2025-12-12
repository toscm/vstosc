import * as vscode from 'vscode';
import { exec, ExecException } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import { updateRDocstring } from './updateRDocstring';
import { testRFunction } from './testRFunction';

// Track the last focused element type
let lastFocusedElement: 'terminal' | 'editor' | 'unknown' = 'unknown';

type ShellPlatform = 'windows' | 'mac' | 'linux';

const DEFAULT_SHELLS: Record<ShellPlatform, string> = {
    windows: 'cmd.exe /q /c',
    mac: '/bin/sh -e',
    linux: '/bin/sh -e',
};

const getShellPlatformKey = (): ShellPlatform => {
    if (process.platform === 'win32') {
        return 'windows';
    }
    if (process.platform === 'darwin') {
        return 'mac';
    }
    return 'linux';
};

const getConfiguredShellCommand = (): string => {
    const platformKey = getShellPlatformKey();
    const config = vscode.workspace.getConfiguration('vstosc');
    const configuredShell = config.get<string>(`shell.${platformKey}`);
    if (configuredShell && configuredShell.trim().length > 0) {
        return configuredShell.trim();
    }
    return DEFAULT_SHELLS[platformKey];
};


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
        vscode.window.showInformationMessage('No active text editor found.');
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
        const trimmedOutput = stdout.trimEnd();
        editor.edit(editBuilder => {
            if (selection.isEmpty) {
                editBuilder.insert(selection.active, trimmedOutput);
            } else {
                editBuilder.replace(selection, trimmedOutput);
            }
        });

    };
    const handleInput = function (input: string | undefined) {
        if (typeof input === 'undefined') { return; }; // User canceled the input box
        fs.writeFileSync(commandFile, input);
        fs.writeFileSync(selectionFile, selectedText);
        const shellCmd = getConfiguredShellCommand();
        const cmd = `${shellCmd} ${commandFile} <${selectionFile} 2>&1`;
        exec(cmd, insertIntoEditor);
    };

    // Show input box and call handler after the user finished their input
    vscode.window.showInputBox({ prompt: 'Enter input:' }).then(handleInput);
};

const runSelection = function () {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    if (!editor) {
        window.showInformationMessage('No active text editor found.');
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
        window.showInformationMessage('Current selection is empty.');
    }
    const tempDir = os.tmpdir();
    const ext = process.platform === "win32" ? "bat" : "sh";
    const commandFile = `${tempDir}/temp_command.${ext}`;
    fs.writeFileSync(commandFile, selectedText);
    const shellCmd = getConfiguredShellCommand();
    var inp = process.platform === "win32" ? "<nul" : "</dev/null";
    var cmd = `${shellCmd} ${commandFile} 2>&1 ${inp}`;
    exec(cmd, (error, stdout, stderr) => {
        const trimmedOutput = stdout.trimEnd();
        editor.edit(editBuilder => {
            editBuilder.replace(selection, trimmedOutput);
        });
    });
};

const toggleEditorTerminalFocus = async function () {
    // Use the tracked focus state instead of current state
    if (lastFocusedElement === 'terminal') {
        // Terminal was focused, switch to editor
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            // Focus existing editor
            await vscode.window.showTextDocument(activeEditor.document);
            lastFocusedElement = 'editor';
        } else {
            // No active editor, create a new untitled document
            const doc = await vscode.workspace.openTextDocument();
            await vscode.window.showTextDocument(doc);
            lastFocusedElement = 'editor';
        }
    } else {
        // Editor or unknown was focused, switch to terminal
        const activeTerminal = vscode.window.activeTerminal;
        if (activeTerminal) {
            // Focus existing terminal
            activeTerminal.show();
            lastFocusedElement = 'terminal';
        } else {
            // No active terminal, create a new one
            const terminal = vscode.window.createTerminal('vstosc Terminal');
            terminal.show();
            lastFocusedElement = 'terminal';
        }
    }
};

type GoToAnythingItem = vscode.QuickPickItem & { key?: string };

const goToAnything = function () {
    const focusTargets: Record<string, { label: string; command: string; onExecute?: () => void }> = {
        'a': { label: 'Active Editor Group', command: 'workbench.action.focusActiveEditorGroup', onExecute: () => { lastFocusedElement = 'editor'; } },
        'b': { label: 'Sidebar', command: 'workbench.action.focusSideBar' },
        'c': { label: 'Secondary Sidebar', command: 'workbench.action.focusSecondarySideBar' },
        'd': { label: 'Debug Console', command: 'workbench.debug.action.focusRepl' },
        'e': { label: 'Explorer', command: 'workbench.view.explorer' },
        'f': { label: 'Search', command: 'workbench.view.search' },
        'g': { label: 'Source Control', command: 'workbench.scm.focus' },
        'i': { label: 'AI Chat', command: 'workbench.action.chat.openagent' },
        'j': { label: 'Settings', command: 'workbench.action.openSettings' },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'J': { label: 'Settings (JSON)', command: 'workbench.action.openSettingsJson' },
        'k': { label: 'Keyboard Shortcuts', command: 'workbench.action.openGlobalKeybindings' },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'K': { label: 'Keyboard Shortcuts (JSON)', command: 'workbench.action.openGlobalKeybindingsFile' },
        'p': { label: 'Panel', command: 'workbench.action.focusPanel' },
        's': { label: 'Status Bar', command: 'workbench.action.focusStatusBar' },
        't': { label: 'Terminal', command: 'workbench.action.terminal.focus', onExecute: () => { lastFocusedElement = 'terminal'; } },
        'o': { label: 'Outline', command: 'outline.focus' },
        'x': { label: 'Extensions', command: 'workbench.view.extensions' },
    };

    const quickPick = vscode.window.createQuickPick<GoToAnythingItem>();
    quickPick.title = 'Go To Anything';
    quickPick.ignoreFocusOut = true;
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;
    quickPick.placeholder = 'Line[:Column] or letter shortcut (see list below)';
    const targetItems: GoToAnythingItem[] = Object.entries(focusTargets).map(([key, target]) => ({
        label: `${key} -> ${target.label}`,
        description: `Press ${key}`,
        key,
    }));
    const instructionItem: GoToAnythingItem = {
        label: '',
        detail: '',
        alwaysShow: true,
    };
    const refreshItems = () => {
        quickPick.items = [instructionItem, ...targetItems];
    };

    const lineColumnPattern = /^(\d+)(?::(\d+))?$/;
    const lineWithPendingColumnPattern = /^(\d+):$/;

    const describeLineRange = () => {
        const editor = vscode.window.activeTextEditor;
        return editor ? `1 to ${editor.document.lineCount}` : 'the current document';
    };

    const setInstruction = (label: string, detail?: string) => {
        instructionItem.label = label;
        instructionItem.detail = detail ?? '';
        refreshItems();
    };

    const setDefaultInstruction = () => {
        setInstruction(
            `Type a line number to go to (${describeLineRange()}).`,
            'Press a listed key to switch focus instantly.'
        );
    };

    const focusTarget = async (key: string) => {
        const target = focusTargets[key];
        if (!target) {
            return;
        }
        await vscode.commands.executeCommand(target.command);
        target.onExecute?.();
    };

    const goToLineColumn = (line: number, column?: number) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active text editor to navigate to.');
            return false;
        }

        const document = editor.document;
        const maxLine = document.lineCount;
        const targetLine = Math.min(Math.max(line, 1), maxLine) - 1;
        const lineLength = document.lineAt(targetLine).text.length;
        const targetColumn = column ? Math.max(column, 1) - 1 : 0;
        const cappedColumn = Math.min(targetColumn, lineLength);
        const position = new vscode.Position(targetLine, cappedColumn);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        lastFocusedElement = 'editor';
        return true;
    };

    const resolveFocusKey = (value: string): string | undefined => {
        if (value.length !== 1) {
            return undefined;
        }
        if (focusTargets[value]) {
            return value;
        }
        const lower = value.toLowerCase();
        if (focusTargets[lower]) {
            return lower;
        }
        return undefined;
    };

    const handleValue = (rawValue: string, triggeredByAccept = false) => {
        const normalized = rawValue.trim();
        const lowered = normalized.toLowerCase();
        if (!normalized) {
            setDefaultInstruction();
            return;
        }

        const focusKey = resolveFocusKey(normalized);

        if (/^\d+$/.test(lowered)) {
            setInstruction(
                `Ready to jump to line ${normalized}.`,
                'Press "Enter" to go there or type ":" to add a column number.'
            );
        } else if (lineWithPendingColumnPattern.test(lowered)) {
            const linePart = normalized.slice(0, -1);
            setInstruction(
                `Add a column number for line ${linePart}.`,
                'Enter a column or press "Enter" to stay at column 1.'
            );
        } else if (lineColumnPattern.test(lowered)) {
            const [linePart, columnPart] = normalized.split(':');
            if (columnPart) {
                setInstruction(
                    `Ready to jump to ${linePart}:${columnPart}.`,
                    'Press "Enter" when you are ready.'
                );
            } else {
                setInstruction(
                    `Ready to jump to ${linePart}.`,
                    'Press "Enter" when you are ready.'
                );
            }
        } else if (focusKey) {
            setInstruction(
                `Jumping to ${focusTargets[focusKey].label}...`,
                'This will close the picker automatically.'
            );
        } else {
            setDefaultInstruction();
        }

        if (focusKey) {
            focusTarget(focusKey).finally(() => quickPick.hide());
            return;
        }

        if (!triggeredByAccept) {
            return;
        }

        const match = lineColumnPattern.exec(lowered);
        if (match) {
            const line = parseInt(match[1], 10);
            const column = match[2] ? parseInt(match[2], 10) : undefined;
            if (line > 0 && (!column || column > 0)) {
                if (goToLineColumn(line, column)) {
                    quickPick.hide();
                }
                return;
            }
        }
    };

    quickPick.onDidChangeValue((value) => {
        handleValue(value, false);
    });

    quickPick.onDidChangeSelection((selection) => {
        const picked = selection[0];
        if (!picked) {
            return;
        }
        const targetKey = picked.key;
        if (!targetKey) {
            quickPick.selectedItems = [];
            return;
        }
        focusTarget(targetKey).finally(() => quickPick.hide());
    });

    quickPick.onDidAccept(() => {
        if (quickPick.selectedItems.length > 0) {
            const picked = quickPick.selectedItems[0];
            const targetKey = picked.key;
            if (targetKey) {
                focusTarget(targetKey).finally(() => quickPick.hide());
            } else {
                quickPick.selectedItems = [];
            }
            return;
        }
        handleValue(quickPick.value, true);
    });

    quickPick.onDidHide(() => {
        quickPick.dispose();
    });

    setDefaultInstruction();
    quickPick.show();
};

export function activate(context: vscode.ExtensionContext) {
    let registrationObjs = [
        vscode.commands.registerCommand('vstosc.knitRmd', knitRmd),
        vscode.commands.registerTextEditorCommand('vstosc.mathMode', mathMode),
        vscode.commands.registerTextEditorCommand('vstosc.runCommand', runCommand),
        vscode.commands.registerTextEditorCommand('vstosc.runSelection', runSelection),
        vscode.commands.registerTextEditorCommand('vstosc.updateRDocstring', updateRDocstring),
        vscode.commands.registerTextEditorCommand('vstosc.testRFunction', testRFunction),
        vscode.commands.registerCommand('vstosc.toggleEditorTerminalFocus', toggleEditorTerminalFocus),
        vscode.commands.registerCommand('vstosc.goToAnything', goToAnything),
    ];

    // Track focus changes
    const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            lastFocusedElement = 'editor';
        }
    });

    const onDidChangeActiveTerminal = vscode.window.onDidChangeActiveTerminal((terminal) => {
        if (terminal) {
            lastFocusedElement = 'terminal';
        }
    });

    // Initialize focus state
    if (vscode.window.activeTextEditor) {
        lastFocusedElement = 'editor';
    } else if (vscode.window.activeTerminal) {
        lastFocusedElement = 'terminal';
    }

    context.subscriptions.push(...registrationObjs, onDidChangeActiveTextEditor, onDidChangeActiveTerminal);
};

export function deactivate() { };
