[![version](https://img.shields.io/vscode-marketplace/v/toscm.vstosc.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=toscm.vstosc)
[![installs](https://img.shields.io/vscode-marketplace/d/toscm.vstosc.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=toscm.vstosc)
[![build](https://github.com/toscm/vstosc/actions/workflows/build.yml/badge.svg)](https://github.com/toscm/vstosc/actions/workflows/build.yml)

# VSTosc

General commands to boost productivity:

- [goToAnything](#gotoanything) – Jump to UI areas or line:column instantly
- [runCommand](#runcommand) – Pipe current selection into any shell command
- [runSelection](#runselection) – Execute current selection as shell command
- [insertNumbers](#insertnumbers) – Generate and insert number sequences
- [toggleEditorTerminalFocus](#toggleeditorterminalfocus) – Smart
  editor/terminal toggle

Specialized commands for R development:

- [knitRmd](#knitrmd) – Render current file via `rmarkdown::render`
- [updateRDocstring](#updaterdocstring) – Generate roxygen2 docs for currently
  selected R function
- [testRFunction](#testrfunction) – Run `testthat` file of currently selected R
  function

## Installation

Open the Extensions Tab in VSCode's activity bar and search for `vstosc`. Then
click `install`.

<img
src="https://github.com/toscm/vstosc/assets/12760468/84d0406c-6607-4c2c-98d5-20e9990e1510"
alt="image" width=49%>

## Usage

Hit `F1` or `Ctrl+Shift+P` to open the Command Palette and then choose a
[command](#commands).

<div style="display: flex;">
<img src="https://github.com/toscm/vstosc/assets/12760468/da1297b3-9671-4e8c-8f74-bca2064762e2" alt="image" width=49%>
<img src="https://github.com/toscm/vstosc/assets/12760468/03343a69-bc56-4e2a-82db-bf32fd924d51" alt="image" width=49%>
</div>

For often used commands you might want to define a shortcut as shown below:

<div style="display: flex;">
<img src="https://github.com/toscm/vstosc/assets/12760468/45201d5b-1555-4485-b7c6-6658fdc3841f" alt="image" width=49%>
<img src="https://github.com/toscm/vstosc/assets/12760468/f24fcc2f-677d-474e-8129-6ef3fa99988a" alt="image" width=49%>
</div>

## Commands

### runCommand

Opens an input box asking the user for a command. The entered command runs
inside a configurable shell and the output (with trailing whitespace removed) is
inserted at the current cursor position. If text is selected, it is passed as
stdin to the command and replaced with the output (with trailing whitespace
removed).

The following settings can be used to customize the shell used for command
execution:

- `vstosc.shell.windows` – default `cmd.exe /q /c`
- `vstosc.shell.mac` – default `/bin/sh -e`
- `vstosc.shell.linux` – default `/bin/sh -e`

Each command is written to a temporary file, which is then executed using the
configured shell. When customizing the shell command, make sure it accepts the
pattern `<shell-command> <script-file>`, where `<script-file>` is the temporary
file created by the extension. For example, to run everything through Git Bash
on Windows, set `vstosc.shell.windows` to `"C:/Program Files/Git/bin/bash.exe"
-lc`.

<img
src="https://github.com/toscm/vstosc/assets/12760468/dc442bb0-8d9d-4e88-9397-353b4621da77"
alt="image" width=49%>

### runSelection

Executes the current selection using the same shell configuration described
under [runCommand](#runcommand) (defaults: `/bin/sh -e` on macOS/Linux, `cmd.exe
/q /c` on Windows) and replaces the selection with the command output (with
trailing whitespace removed).

<img
src="https://github.com/toscm/vstosc/assets/12760468/1bbebada-5916-4a34-82fe-0d5bc30a5877"
alt="image" width=49%>

### updateRDocstring

Updates the [roxygen2](https://roxygen2.r-lib.org/) docstring of the R function
the cursor currently is in.

⚠️WARNING: This command requires the R package
[toscutil](https://github.com/toscm/toscutil) (version 2.7.1 or greater). For
now you have to install it by hand using command: `install.packages("toscutil")`
from within a running R session.

🗒️NOTE: In case a function is defined multiple times in the same file. The
generated roxygen2 docstring will always be based on the last definition of the
function.

<img
src="https://github.com/toscm/vstosc/assets/12760468/e6633221-1de7-4d8d-baee-fcf2cdc84b62"
alt="image" width=49%>

### testRFunction

Execute test cases for the R function where the cursor is currently positioned.

1. If the file path of the currently edited file matches glob pattern
   `{package_dir}/tests/testthat/test[-_]*.R`, command
   `testthat::test_file("${currentFilePath}")` is sent to the currently active
   terminal.
2. If the currently edited file matches glob pattern `{package_dir}/**/*.R`, the
   name of the currently edited function is determined and command
   `testthat::test_file("{package_dir}/tests/testthat/test-{currentFunctionName}.R")`
   is sent instead.
3. If the current editor matches neither of the above glob patterns or no
   terminal is active, nothing happens (except for an info message explaining
   why).

To speed up the develop-test-cycle even more, you might want to define a
shortcut for this command. For instance, I have set up the following binding in
my `keybindings.json` file:

```json
{
    "key": "ctrl+shift+t",
    "command": "vstosc.testRFunction",
    "when": "editorTextFocus && editorLangId == 'r'"
}
```

### knitRmd

Sends the following text to the currently active console:

```R
rmarkdown::render("<path-of-currently-active-file")
```

### mathMode

Inserts `~$$` at the current position and places the cursor in between `$$`. A
potential leading space is removed.

### toggleEditorTerminalFocus

Smart focus switching between terminal and editor with `Ctrl+` `

This command replaces the default VS Code `Ctrl+` ` behavior with intelligent
bidirectional focus switching. Instead of just opening the terminal, it toggles
between your terminal and editor based on what was previously focused, creating
a seamless workflow for rapid switching during development.

The command uses focus tracking to remember whether you were last working in the
terminal or editor, ensuring the toggle behavior works correctly even when
accessed through the Command Palette.

### goToAnything

Allows keyboard-based navigation to any document position (`line[:column]`) or
VS Code UI area. UI targets jump instantly, while line/column entries follow the
classic `Go to Line/Column` flow (press `Enter` to confirm).

Default shortcut: `Alt+G` (`Option+G` on macOS).

Letters map to the following locations:

| Key | Destination               |
| --- | ------------------------- |
| `a` | Active editor group       |
| `b` | Sidebar                   |
| `c` | Secondary sidebar         |
| `d` | Debug console             |
| `e` | Explorer                  |
| `f` | Search                    |
| `g` | Source control            |
| `i` | AI Chat                   |
| `j` | Settings                  |
| `J` | Settings (JSON)           |
| `k` | Keyboard shortcuts        |
| `K` | Keyboard shortcuts (JSON) |
| `o` | Outline                   |
| `p` | Panel                     |
| `s` | Status bar                |
| `t` | Terminal                  |
| `x` | Extensions                |

Numbers behave like VS Code's built-in `Go to Line/Column` feature, e.g. `120`
jumps to line 120 and `42:15` jumps to line 42, column 15 (1-based). The options
list is displayed beneath the input so you can keep the key hints visible while
typing.

### insertNumbers

Generates and inserts number sequences at the current cursor position based on a
specification. The command opens an input dialog where you can specify the
number range and step size.

Supported formats:

1. `a:b` - Creates integers from `a` to `b` (inclusive)
   - Example: `3:7` generates: 3, 4, 5, 6, 7
   - Example: `7:3` generates: 7, 6, 5, 4, 3 (descending)
   - Example: `-2:2` generates: -2, -1, 0, 1, 2

2. `a:b:s` - Creates numbers from `a` to `b` with step size `s` (inclusive)
   - Example: `2:10:2` generates: 2, 4, 6, 8, 10
   - Example: `0:1:0.25` generates: 0, 0.25, 0.5, 0.75, 1
   - Example: `10:2:-2` generates: 10, 8, 6, 4, 2 (descending with negative
     step)

The numbers are inserted one per line at the cursor position. If text is
selected, it will be replaced with the generated numbers.

## Contribute

1. Clone this repo and open the folder in VSCode
2. Run `npm install` to install all dependencies
3. Modify [package.json](package.json) and
   [src/extensions.ts](src/extensions.ts) as required (ChatGPT is your friend).
4. Hit F5 to run the extension in a new *Extension Development Host* window.
5. See [Debugging the
   extension](https://code.visualstudio.com/api/get-started/your-first-extension#debugging-the-extension)
   in case something isn't working as expected.
6. Increase the version in [package.json](package.json) according to the rules
   of [Semantic versioning](https://semver.org/)
7. Push your changes and tag the commit (see section [publish](#publish) for
   details about the publishing process triggered by tagging a commit from the
   main branch)

### Publish

Whenever a commit from the main branch receives a tag, the
[publish](.github/workflows/publish.yml) action is triggered, which uploads the
extension `vsce` to the [VSCode
Marketplace](https://marketplace.visualstudio.com/manage/publishers/toscm). In
case the pipeline fails and you want to do the publishing manually, the
following steps would be required:

1. Run `npm install -g @vscode/vsce` to install the Visual Studio Code Extension
   Tool.
2. Run `vsce package` to build the new package in VSCode package format `.vsix`
3. Login to the [VSCode
   Marketplace](https://marketplace.visualstudio.com/manage/publishers/toscm)
   using a valid access token for the [Azure DevOps Organization
   toscm](https://dev.azure.com/toscm/) using command `vsce login toscm`
4. Publish the extension using command `vsce publish`

For further guidelines see [VSCode Extension
API](https://code.visualstudio.com/api) and [VSCode Publishing
Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
