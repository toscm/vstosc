# vstosc

VSCode commands from tosc.

⚠️ This is only a demo version. Use at your own risk!

## Installation

TODO

## Usage

TODO

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
