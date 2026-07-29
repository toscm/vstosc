import * as vscode from 'vscode';

/**
 * Status bar controls for word wrapping.
 *
 * Two items, both applying to the language of the active editor rather than
 * globally, which is the part VS Code's own UI and the existing marketplace
 * extensions do not offer:
 *
 *   Wrap: off | on | 66      -> editor.wordWrap + editor.wordWrapColumn
 *   Rewrap: 66               -> rewrap.wrappingColumn, only if Rewrap is
 *                               installed
 *
 * Writing a setting "in language" means it lands in a "[markdown]" block in
 * settings.json instead of at the top level, so a 66 column measure for prose
 * does not follow you into TypeScript.
 */

/** Extension ids of the two published Rewrap forks. */
const REWRAP_EXTENSION_IDS = ['stkb.rewrap', 'dnut.rewrap-revived'];

const DEFAULT_COLUMNS = [60, 66, 72, 80, 100, 120];

const CUSTOM_PICK_LABEL = 'Custom...';
const REWRAP_DEFAULT_PICK_LABEL = 'Default';

type WrapPick = vscode.QuickPickItem & { value: 'off' | 'on' | 'custom' | 'default' | number };

/** True as long as any Rewrap fork is installed and resolvable. */
export function isRewrapInstalled(): boolean {
    return REWRAP_EXTENSION_IDS.some(id => vscode.extensions.getExtension(id) !== undefined);
}

/**
 * Label for the word wrap item.
 *
 * Deliberately terse: the mode alone when wrapping is off or unbounded, the
 * column alone when it is bounded. Which of the two bounded modes is in use
 * is a detail for the tooltip, not for the status bar.
 */
export function formatWrapLabel(wordWrap: string | undefined, wordWrapColumn: number | undefined): string {
    switch (wordWrap) {
        case 'on':
            return 'Wrap: on';
        case 'bounded':
        case 'wordWrapColumn':
            return `Wrap: ${wordWrapColumn ?? 80}`;
        default:
            return 'Wrap: off';
    }
}

/** Label for the Rewrap item. Rewrap falls back to rulers when unset. */
export function formatRewrapLabel(wrappingColumn: number | undefined): string {
    return wrappingColumn && wrappingColumn > 0 ? `Rewrap: ${wrappingColumn}` : 'Rewrap: auto';
}

/** Parse and validate a hand-typed column. Returns null when unusable. */
export function parseColumn(input: string): number | null {
    const trimmed = input.trim();
    if (!/^\d+$/.test(trimmed)) {
        return null;
    }
    const value = parseInt(trimmed, 10);
    return value > 0 && value <= 1000 ? value : null;
}

const getColumns = (): number[] => {
    const configured = vscode.workspace.getConfiguration('vstosc').get<number[]>('wordWrap.columns');
    const usable = (configured ?? []).filter(c => Number.isInteger(c) && c > 0);
    return usable.length > 0 ? usable : DEFAULT_COLUMNS;
};

const getTarget = (): vscode.ConfigurationTarget => {
    const configured = vscode.workspace.getConfiguration('vstosc').get<string>('wordWrap.target');
    return configured === 'workspace'
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;
};

const getColumnMode = (): string => {
    const configured = vscode.workspace.getConfiguration('vstosc').get<string>('wordWrap.columnMode');
    return configured === 'wordWrapColumn' ? 'wordWrapColumn' : 'bounded';
};

const describeTarget = (): string =>
    getTarget() === vscode.ConfigurationTarget.Workspace ? 'workspace settings' : 'user settings';

/**
 * Ask for a column that is not in the preset list.
 *
 * `current` pre-fills the box so that nudging 66 to 68 does not mean typing
 * the number from scratch.
 */
async function promptForColumn(current: number | undefined): Promise<number | undefined> {
    const input = await vscode.window.showInputBox({
        prompt: 'Wrap column',
        value: current ? String(current) : '',
        validateInput: (value: string) =>
            parseColumn(value) === null ? 'Enter a whole number between 1 and 1000' : null,
    });

    if (input === undefined) {
        return undefined;
    }
    return parseColumn(input) ?? undefined;
}

export class WordWrapStatusBar {
    private readonly wrapItem: vscode.StatusBarItem;
    private readonly rewrapItem: vscode.StatusBarItem;
    private readonly disposables: vscode.Disposable[] = [];

    constructor() {
        this.wrapItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.wrapItem.command = 'vstosc.selectWordWrap';
        this.rewrapItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
        this.rewrapItem.command = 'vstosc.selectRewrapColumn';

        this.disposables.push(
            this.wrapItem,
            this.rewrapItem,
            vscode.window.onDidChangeActiveTextEditor(() => this.refresh()),
            vscode.extensions.onDidChange(() => this.refresh()),
            vscode.workspace.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration('editor.wordWrap') ||
                    event.affectsConfiguration('editor.wordWrapColumn') ||
                    event.affectsConfiguration('rewrap.wrappingColumn') ||
                    event.affectsConfiguration('vstosc.wordWrap')) {
                    this.refresh();
                }
            }),
        );

        this.refresh();
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }

    /** Redraw both items against the active editor, hiding them when there is none. */
    refresh() {
        const document = vscode.window.activeTextEditor?.document;

        if (!document) {
            this.wrapItem.hide();
            this.rewrapItem.hide();
            return;
        }

        const editorConfig = vscode.workspace.getConfiguration('editor', document);
        const wordWrap = editorConfig.get<string>('wordWrap');
        const wordWrapColumn = editorConfig.get<number>('wordWrapColumn');

        this.wrapItem.text = formatWrapLabel(wordWrap, wordWrapColumn);
        this.wrapItem.tooltip =
            `Word wrap for ${document.languageId}: ${wordWrap ?? 'off'}` +
            (wordWrap === 'bounded' || wordWrap === 'wordWrapColumn' ? ` at column ${wordWrapColumn ?? 80}` : '') +
            `\nClick to change it for ${document.languageId} in ${describeTarget()}.`;
        this.wrapItem.show();

        if (!isRewrapInstalled()) {
            this.rewrapItem.hide();
            return;
        }

        const wrappingColumn = vscode.workspace
            .getConfiguration('rewrap', document)
            .get<number>('wrappingColumn');

        this.rewrapItem.text = formatRewrapLabel(wrappingColumn);
        this.rewrapItem.tooltip =
            (wrappingColumn && wrappingColumn > 0
                ? `Rewrap wraps ${document.languageId} at column ${wrappingColumn}.`
                : `Rewrap has no column set for ${document.languageId}, so it follows editor.rulers or editor.wordWrapColumn.`) +
            `\nClick to change it for ${document.languageId} in ${describeTarget()}.`;
        this.rewrapItem.show();
    }

    /** The "Wrap: ..." item was clicked. */
    async selectWordWrap() {
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            vscode.window.showInformationMessage('No active text editor found.');
            return;
        }

        const editorConfig = vscode.workspace.getConfiguration('editor', document);
        const currentWrap = editorConfig.get<string>('wordWrap');
        const currentColumn = editorConfig.get<number>('wordWrapColumn');
        const isBounded = currentWrap === 'bounded' || currentWrap === 'wordWrapColumn';

        const items: WrapPick[] = [
            { label: 'off', description: 'No wrapping', value: 'off' },
            { label: 'on', description: 'Wrap at the viewport width', value: 'on' },
            ...getColumns().map((column): WrapPick => ({
                label: String(column),
                description: `Wrap at column ${column}`,
                value: column,
            })),
            { label: CUSTOM_PICK_LABEL, description: 'Enter a column', value: 'custom' },
        ];

        const current = isBounded ? String(currentColumn ?? 80) : (currentWrap ?? 'off');
        items.forEach(item => {
            if (item.label === current) {
                item.description = `${item.description} (current)`;
            }
        });

        const picked = await vscode.window.showQuickPick(items, {
            title: `Word wrap for ${document.languageId}`,
            placeHolder: `Applies to ${document.languageId} in ${describeTarget()}`,
        });

        if (!picked) {
            return;
        }

        let column: number | undefined;
        if (picked.value === 'custom') {
            column = await promptForColumn(isBounded ? currentColumn : undefined);
            if (column === undefined) {
                return;
            }
        } else if (typeof picked.value === 'number') {
            column = picked.value;
        }

        const target = getTarget();
        if (column === undefined) {
            await editorConfig.update('wordWrap', picked.value, target, true);
        } else {
            await editorConfig.update('wordWrap', getColumnMode(), target, true);
            await editorConfig.update('wordWrapColumn', column, target, true);
        }

        this.refresh();
    }

    /** The "Rewrap: ..." item was clicked. */
    async selectRewrapColumn() {
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            vscode.window.showInformationMessage('No active text editor found.');
            return;
        }

        const rewrapConfig = vscode.workspace.getConfiguration('rewrap', document);
        const currentColumn = rewrapConfig.get<number>('wrappingColumn');

        const items: WrapPick[] = [
            ...getColumns().map((column): WrapPick => ({
                label: String(column),
                description: `Rewrap at column ${column}`,
                value: column,
            })),
            { label: CUSTOM_PICK_LABEL, description: 'Enter a column', value: 'custom' },
            {
                label: REWRAP_DEFAULT_PICK_LABEL,
                description: 'Unset, so Rewrap follows editor.rulers or editor.wordWrapColumn',
                value: 'default',
            },
        ];

        const current = currentColumn && currentColumn > 0 ? String(currentColumn) : REWRAP_DEFAULT_PICK_LABEL;
        items.forEach(item => {
            if (item.label === current) {
                item.description = `${item.description} (current)`;
            }
        });

        const picked = await vscode.window.showQuickPick(items, {
            title: `Rewrap column for ${document.languageId}`,
            placeHolder: `Applies to ${document.languageId} in ${describeTarget()}`,
        });

        if (!picked) {
            return;
        }

        const target = getTarget();
        if (picked.value === 'default') {
            await rewrapConfig.update('wrappingColumn', undefined, target, true);
        } else {
            const column = picked.value === 'custom'
                ? await promptForColumn(currentColumn)
                : picked.value as number;
            if (column === undefined) {
                return;
            }
            await rewrapConfig.update('wrappingColumn', column, target, true);
        }

        this.refresh();
    }
}
