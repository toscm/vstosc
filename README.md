[![version](https://img.shields.io/vscode-marketplace/v/toscm.vstosc.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=toscm.vstosc)
[![installs](https://img.shields.io/vscode-marketplace/d/toscm.vstosc.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=toscm.vstosc)
[![build](https://github.com/toscm/vstosc/actions/workflows/build.yml/badge.svg)](https://github.com/toscm/vstosc/actions/workflows/build.yml)

# vstosc

VSCode commands from [ToSc](https://github.com/toscm/vstosc) and [LiHu](https://github.com/huy29433).

## Installation

Open the Extensions Tab in VSCode's activity bar and search for `vstosc`. Then click `install`.

<img src="https://github.com/toscm/vstosc/assets/12760468/84d0406c-6607-4c2c-98d5-20e9990e1510" alt="image" width=49%>

## Usage

Hit `F1` or `Ctrl+Shift+P` to open the Command Palette and then choose a [command](#commands).

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

### updateRDocstring

Updates the [roxygen2](https://roxygen2.r-lib.org/) docstring of the R function the cursor currently is in.

⚠️WARNING: This command requires the R package [toscutil](https://github.com/toscm/toscutil) (version 2.7.1 or greater). For now you have to install it by hand using command: `install.packages("toscutil")` from within a running R session.

🗒️NOTE: In case a function is defined multiple times in the same file. The generated roxygen2 docstring will always be based on the last definition of the function.

<img src="https://github.com/toscm/vstosc/assets/12760468/e6633221-1de7-4d8d-baee-fcf2cdc84b62" alt="image" width=49%>

### runSelection

Executes the current selection in a shell (`/bin/sh` or `cmd.exe`) and replaces the selection with the command output.

<img src="https://github.com/toscm/vstosc/assets/12760468/1bbebada-5916-4a34-82fe-0d5bc30a5877" alt="image" width=49%>

### runCommand

Opens an input box asking the user for a command. The entered command will be run in a shell (`/bin/sh` or `cmd.exe`) and the output is inserted at the current cursor position. In case there is text selected while the command is executed, the selected text will be used as stdin for the command and replaced with the command's output.

<img src="https://github.com/toscm/vstosc/assets/12760468/dc442bb0-8d9d-4e88-9397-353b4621da77" alt="image" width=49%>

### knitRmd

Sends the following text to the currently active console:

```R
rmarkdown::render("<path-of-currently-active-file")
```

### mathMode

Inserts `~$$` at the current position and places the cursor in between `$$`. A potential leading space is removed.

## Contribute

1. Clone this repo and open the folder in VSCode
2. Run `npm install` to install all dependencies
3. Modify [package.json](package.json) and [src/extensions.ts](src/extensions.ts) as required (ChatGPT is your friend).
4. Hit F5 to and run the extension in a new *Extension Development Host* window.
5. See [Debugging the extension](https://code.visualstudio.com/api/get-started/your-first-extension#debugging-the-extension) in case something isn't working as expected.
6. Increase the version in [package.json](package.json) according to the rules of [Semantic versioning](https://semver.org/)
7. Push your changes and tag the commit (see section [publish](#publish) for details about the publishing process triggered by tagging a commit from the main branch)

### Publish

Whenever a commit from the main branch receives a tag, the [publish](.github/workflows/publish.yml) action is triggered, which uploads the extension `vsce` to the [VSCode Marketplace](https://marketplace.visualstudio.com/manage/publishers/toscm). In case the pipeline fails and you want to do the publishing manually, the following steps would be required:

1. Run `npm install -g @vscode/vsce` to install the Visual Studio Code Extension Tool.
2. Run `vsce package` to build the new package in VSCode package format `.vsix`
3. Login to the [VSCode Marketplace](https://marketplace.visualstudio.com/manage/publishers/toscm) using a valid access token for the [Azure DevOps Organization toscm](https://dev.azure.com/toscm/) using command `vsce login toscm`
4. Publish the extension using command `vsce publish`

For further guidelines see [VSCode Extension API](https://code.visualstudio.com/api) and [VSCode Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
