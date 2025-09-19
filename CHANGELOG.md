# Change Log

All notable changes to the "vstosc" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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