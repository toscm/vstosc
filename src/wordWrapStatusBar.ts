import * as vscode from 'vscode';

/**
 * Status bar controls for word wrapping.
 *
 * Two items, both applying to the language of the active editor rather than
 * globally, which is the part VS Code's own UI and the existing marketplace
 * extensions do not offer:
 *
 *   Wrap: off | on | 66      -> editor.wordWrap + editor.wordWrapColumn
 *   Rewrap: 66               -> rewrap.wrappingColumn
 *
 * Writing a setting "in language" means it lands in a "[markdown]" block in
 * settings.json instead of at the top level, so a 66 column measure for prose
 * does not follow you into TypeScript.
 *
 * Both items carry an id and a name, which is what puts them in the status
 * bar's right-click menu so a user can switch either off for good. There is
 * no way to register an item that starts out hidden: StatusBarItem offers
 * show() and hide() and nothing else, and an item that was never shown is not
 * in that menu either. So both start visible, and the Rewrap one is shown
 * unconditionally rather than only when a Rewrap extension can be detected --
 * detection cannot see across extension hosts, so over a remote connection it
 * reported "not installed" for an extension that was installed locally.
 */

const DEFAULT_COLUMNS = [60, 66, 72, 80, 100, 120];

/**
 * Priorities that place the items directly right of "Spaces: 4".
 *
 * VS Code's own editor status entries sit in the 100.x band, and on the right
 * hand side a HIGHER priority means further LEFT: indentation is 100.4 and
 * encoding 100.3, so anything between the two lands in the gap.
 */
const WRAP_PRIORITY = 100.35;
const REWRAP_PRIORITY = 100.34;

/** The word wrap modes Alt+Z steps through, in order. */
const WRAP_CYCLE = ['off', 'on', 'bounded'];

const CUSTOM_PICK_LABEL = 'Custom...';
const REWRAP_DEFAULT_PICK_LABEL = 'Default';

type WrapPick = vscode.QuickPickItem & { value: 'off' | 'on' | 'custom' | 'default' | number };

/**
 * Next mode in the Alt+Z cycle.
 *
 * "wordWrapColumn" is treated as "bounded" for cycling purposes: both are
 * column modes and the status bar shows them the same way, so the cycle has
 * three visible steps rather than four.
 */
export function nextWrapMode(current: string | undefined): string {
    const normalized = current === 'wordWrapColumn' ? 'bounded' : (current ?? 'off');
    const index = WRAP_CYCLE.indexOf(normalized);
    return WRAP_CYCLE[(index + 1) % WRAP_CYCLE.length];
}

/** Where the column shown on the Rewrap item came from. */
export interface RewrapColumn {
    column: number;
    /** 'rewrap' when set explicitly, otherwise what it was inherited from. */
    source: 'rewrap' | 'rulers' | 'editor' | 'fallback';
}

/**
 * The column Rewrap will actually use, following its own documented order.
 *
 * Rewrap takes rewrap.wrappingColumn when set, otherwise the first editor
 * ruler, otherwise editor.wordWrapColumn, whose VS Code default is 80. So the
 * item always shows a number: an unset rewrap.wrappingColumn is not an absence
 * but an inheritance, and printing "auto" hid which column that resolved to.
 */
export function resolveRewrapColumn(
    wrappingColumn: number | undefined,
    rulers: unknown[] | undefined,
    wordWrapColumn: number | undefined,
): RewrapColumn {
    if (wrappingColumn && wrappingColumn > 0) {
        return { column: wrappingColumn, source: 'rewrap' };
    }

    // A ruler is either a number or an object with a column property.
    const firstRuler = (rulers ?? [])
        .map(ruler => typeof ruler === 'number'
            ? ruler
            : (ruler as { column?: number } | null)?.column)
        .find((column): column is number => typeof column === 'number' && column > 0);

    if (firstRuler !== undefined) {
        return { column: firstRuler, source: 'rulers' };
    }
    if (wordWrapColumn && wordWrapColumn > 0) {
        return { column: wordWrapColumn, source: 'editor' };
    }
    return { column: 80, source: 'fallback' };
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

/** Label for the Rewrap item. Always a column, never a mode. */
export function formatRewrapLabel(resolved: RewrapColumn): string {
    return `Rewrap: ${resolved.column}`;
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

/** Tooltip line saying which setting the shown column actually came from. */
const describeRewrapSource = (resolved: RewrapColumn, languageId: string): string => {
    switch (resolved.source) {
        case 'rewrap':
            return `Rewrap wraps ${languageId} at column ${resolved.column}.`;
        case 'rulers':
            return `Rewrap has no column set for ${languageId}, so it follows your first editor ruler at column ${resolved.column}.`;
        case 'editor':
            return `Rewrap has no column set for ${languageId}, so it follows editor.wordWrapColumn at column ${resolved.column}.`;
        default:
            return `Rewrap has no column set for ${languageId} and no ruler to follow, so it wraps at the default column of ${resolved.column}.`;
    }
};

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
        // Named items, so that VS Code remembers the position if the user
        // drags them somewhere else in the status bar.
        this.wrapItem = vscode.window.createStatusBarItem(
            'vstosc.wordWrap', vscode.StatusBarAlignment.Right, WRAP_PRIORITY);
        this.wrapItem.name = 'Word Wrap';
        this.wrapItem.command = 'vstosc.selectWordWrap';
        this.rewrapItem = vscode.window.createStatusBarItem(
            'vstosc.rewrapColumn', vscode.StatusBarAlignment.Right, REWRAP_PRIORITY);
        this.rewrapItem.name = 'Rewrap Column';
        this.rewrapItem.command = 'vstosc.selectRewrapColumn';

        this.disposables.push(
            this.wrapItem,
            this.rewrapItem,
            vscode.window.onDidChangeActiveTextEditor(() => this.refresh()),
            vscode.workspace.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration('editor.wordWrap') ||
                    event.affectsConfiguration('editor.wordWrapColumn') ||
                    event.affectsConfiguration('editor.rulers') ||
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

        const resolved = resolveRewrapColumn(
            vscode.workspace.getConfiguration('rewrap', document).get<number>('wrappingColumn'),
            editorConfig.get<unknown[]>('rulers'),
            wordWrapColumn,
        );

        this.rewrapItem.text = formatRewrapLabel(resolved);
        this.rewrapItem.tooltip =
            describeRewrapSource(resolved, document.languageId) +
            `\nClick to change it for ${document.languageId} in ${describeTarget()}.`;
        this.rewrapItem.show();
    }

    /**
     * Step the word wrap mode: off -> on -> bounded -> off.
     *
     * This is bound to Alt+Z in place of VS Code's own
     * editor.action.toggleWordWrap. The built-in command applies a
     * session-only override to the editor rather than writing a setting, and
     * the API exposes no way to read that override back, so a status bar item
     * cannot reflect it. Owning the keybinding and writing the setting keeps
     * the two in step, and gains the third state at the same time.
     */
    async cycleWordWrap() {
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            vscode.window.showInformationMessage('No active text editor found.');
            return;
        }

        const editorConfig = vscode.workspace.getConfiguration('editor', document);
        const next = nextWrapMode(editorConfig.get<string>('wordWrap'));

        await editorConfig.update('wordWrap', next, getTarget(), true);
        this.refresh();
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
