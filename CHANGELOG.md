# Change Log

All notable changes to the "vstosc" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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