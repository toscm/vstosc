# Change Log

All notable changes to the "vstosc" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 1.7.0

- Added command [generateMarkdownReferenceLinks](README.md#generatemarkdownreferencelinks) to automatically generate reference-style links from Markdown headings.

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