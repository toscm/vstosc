# vstosc

VSCode commands from tosc.

## Installation

TODO

## Usage

TODO

## Commands

### KnitRmd:

Sends the following text to the currently active console:

```R
if (exists("params")) rm(params)
rmarkdown::render("<path-of-currently-active-file")
```
## Contribute

1. Clone this repo and open the folder in VSCode
2. Modify [package.json](package.json) and [src/extensions.ts](src/extensions.ts) as required (ChatGPT is your friend).
3. Hit F5 to and run the extension in a new *Extension Development Host* window.
4. See [Debugging the extension](https://code.visualstudio.com/api/get-started/your-first-extension#debugging-the-extension) in case something isn't working as expected.
5. 

For further guidelines see [VSCode's Extension Docs](https://code.visualstudio.com/api)
