# Change Log

All notable changes to the "vstosc" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 1.8.0

- Added a [word wrap status bar](README.md#word-wrap-status-bar): a `Wrap: off` / `Wrap: on` / `Wrap: 66` item, plus a separate `Rewrap: 66` item that only appears when Rewrap or Rewrap Revived is installed. Both read and write their settings for the language of the active editor, so a 66 column measure for Markdown does not follow you into TypeScript. Offered columns are 60, 66, 72, 80, 100 and 120, plus a free-text entry.
- Added the settings `vstosc.wordWrap.columns`, `vstosc.wordWrap.target` and `vstosc.wordWrap.columnMode`.
- The extension now activates on `onStartupFinished` instead of waiting for one of its commands, which is what a status bar item needs in order to appear at all.

## 1.7.1

- Bugfix: [generateMarkdownReferenceLinks](README.md#generatemarkdownreferencelinks) now writes the heading text alone as the link label. VS Code's Markdown symbol provider reports a heading with its markup attached, so the labels came out as `[## Relevant Links]: #relevant-links` instead of `[Relevant Links]: #relevant-links`. Closed ATX headings (`## Title ##`) lose their trailing hashes too.
- Bugfix: The reference links block is now always separated from the text above it by exactly one blank line, whether it is appended for the first time or replaced. Appending to a file that already ended in a newline used to glue the block straight onto the last line.

## 1.7.0

- Added command [generateMarkdownReferenceLinks](README.md#generatemarkdownreferencelinks) to automatically generate reference-style links from Markdown headings.
- Added an extension icon.
- Fixed the "retired" Marketplace badges in the README by switching from the discontinued shields.io Visual Studio Marketplace route to vsmarketplacebadges.dev.

## 1.6.1

- Bugfix: [insertNumbers](README.md#insertnumbers) now inserts numbers at every active cursor instead of only the first one.
- Bugfix: Number sequences written without an explicit step (e.g., `7:3`) now work in descending order again.
- Maintenance: Switched the integration test harness to `@vscode/test-electron` so `npm test` can download current VS Code builds reliably.

## 1.6.0

- Added command [insertNumbers](README.md#insertnumbers) to generate ascending, descending, or stepped number sequences directly in the editor.
- [runCommand](README.md#runcommand) and [runSelection](README.md#runselection) now keep leading whitespace so shell output retains indentation while still trimming trailing space.

## 1.5.1

- Improved [goToAnything](README.md#gotoanything) by adding quick targets for Source Control (`g`) and AI Chat (`i`) and by focusing the SCM view more reliably.

## 1.5.0

- Added command [goToAnything](README.md#gotoanything)
- Added settings for custom shells in commands [runCommand](README.md#runcommand) and [runSelection](README.md#runselection)
- Output produced by [runCommand](README.md#runcommand) and [runSelection](README.md#runselection) is now trimmed automatically of leading/trailing whitespace

## 1.4.1

- Bugfix: fixed GitHub Actions for testing and publishing the extension.

## 1.4.0

- Feature: Add command `vstosc.toggleEditorTerminalFocus` to toggle focus between editor and terminal

## 1.3.1

- Bugfix: `testRFunction` and `updateRDocstring` now also work for functions with a dot in their name
- Feature: `testRFunction` now works for R files in any subdirectory of the package (not just files in `R`)

## 1.3.0

- Added command [vstosc:testRFunction](README.md#testrfunction).
- Improved command [vstosc:updateRDocstring](README.md#updaterdocstring). It now also works when the cursor is positioned anywhere inside the function or its current roxygen docstring.

## [Unreleased]

- Initial release