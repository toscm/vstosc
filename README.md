# vstosc

VSCode commands from tosc.

⚠️ This is only a demo version. Use at your own risk!

## Installation

![image](https://github.com/toscm/vstosc/assets/12760468/81d9d3e7-78aa-47a3-bf3a-6536970f1d50 )

## Usage

Hit `F1` or `Ctrl+Shift+P` to open the Command Palette and then choose a [command](#commands).

![image](https://github.com/toscm/vstosc/assets/12760468/da1297b3-9671-4e8c-8f74-bca2064762e2)
![image](https://github.com/toscm/vstosc/assets/12760468/03343a69-bc56-4e2a-82db-bf32fd924d51)

For often used commands you might want to define a shortcut as shown below:

![image](https://github.com/toscm/vstosc/assets/12760468/45201d5b-1555-4485-b7c6-6658fdc3841f)
![image](https://github.com/toscm/vstosc/assets/12760468/f24fcc2f-677d-474e-8129-6ef3fa99988a)

## Commands

### knitRmd:

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
7. Run `vsce package` to build the new package in VSCode package format `.vsix`
8. Login to the [VSCode Marketplace](https://marketplace.visualstudio.com/manage/publishers/toscm) using a valid access token for the [Azure DevOps Organization toscm](https://dev.azure.com/toscm/) using command `vsce login toscm`
9. Publish the extension using command `vsce publish`
10. Do not forget to push your changes and tag the commit


For further guidelines see [VSCode Extension API](https://code.visualstudio.com/api) and [VSCode Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
