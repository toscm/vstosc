# Copilot Instructions for vstosc

## Project Overview

**vstosc** is a Visual Studio Code extension developed by [Tobias Schmidt (ToSc)](https://github.com/toscm) for use by himself and his colleagues. The extension provides productivity-enhancing commands for developers working with shell commands, R programming, and LaTeX math formatting directly within VS Code.

## Project Purpose

This extension bridges the gap between VS Code and external tools by providing:
- **Shell Integration**: Execute shell commands and display output directly in the editor
- **R Development Tools**: Enhanced R programming workflow with roxygen2 documentation and testing support
- **LaTeX Math Support**: Quick insertion of math mode syntax
- **Rmarkdown Support**: One-click knitting of R Markdown documents
- **Focus Management**: Smart switching between terminal and editor for improved workflow

## Project Structure

```
vstosc/
├── .github/                    # GitHub configuration and workflows
│   ├── workflows/              # CI/CD automation
│   │   ├── build.yml          # Build verification workflow
│   │   └── publish.yml        # Extension publishing workflow
│   └── copilot-instructions.md # This file
├── doc/                        # Documentation and demo materials
│   ├── *.gif                  # Demo animations for README
│   ├── *.mp4                  # Demo videos
│   └── compress.sh            # Script for compressing demo media
├── src/                        # TypeScript source code
│   ├── extension.ts           # Main extension entry point and command registration
│   ├── util.ts                # Shared utility functions for R function analysis
│   ├── updateRDocstring.ts    # R documentation generation logic
│   ├── testRFunction.ts       # R function testing workflow
│   └── test/                  # Test suite
│       ├── runTest.ts         # Test runner configuration
│       └── suite/
│           ├── extension.test.ts # Basic extension tests
│           └── index.ts       # Test suite setup
├── test_data/                  # Sample R files for testing
│   └── functions.R            # Test R functions with various formats
├── package.json               # Extension manifest and dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # User documentation
```

## Core Features

### 1. Shell Command Integration
- **`runSelection`**: Executes selected text as shell command, replaces selection with output
- **`runCommand`**: Prompts for command input, executes with selected text as stdin
- Cross-platform compatibility (Windows `cmd.exe`, Unix `/bin/sh`)

### 2. R Development Tools
- **`updateRDocstring`**: Auto-generates roxygen2 documentation for R functions
  - Requires R package `toscutil` (≥2.7.1)
  - Works with functions containing dots in names
  - Handles cursor positioning within function or existing docstring
- **`testRFunction`**: Intelligent R function testing
  - Auto-detects test files in `tests/testthat/` directory
  - Supports both `test-` and `test_` naming conventions
  - Creates new test files if none exist
  - Works with R package structure detection

### 3. LaTeX and R Markdown Support
- **`mathMode`**: Inserts `~$$` with cursor positioned between dollar signs
- **`knitRmd`**: Sends `rmarkdown::render()` command to active terminal

### 4. Focus Management
- **`toggleEditorTerminalFocus`**: Smart focus switching between terminal and editor
  - If editor is focused: switches to last active terminal (creates one if none exists)
  - If terminal is focused: switches to last active editor (creates untitled document if none exists)
  - If anything else is focused: switches to last active editor
  - Default keyboard shortcut: `Ctrl+`` (Windows/Linux) or `Cmd+`` (Mac)

## Technical Implementation

### Architecture
- **Language**: TypeScript
- **Target**: VS Code Extension API v1.79.1+
- **Build System**: TypeScript compiler with esbuild bundling
- **Testing**: Mocha test framework

### Key Components

#### Extension Activation (`src/extension.ts`)
- Registers all commands with VS Code API
- Handles command lifecycle and error management
- Provides platform-specific shell command execution

#### R Language Support (`src/util.ts`, `src/updateRDocstring.ts`, `src/testRFunction.ts`)
- **Function Detection**: Regex-based R function parsing (`/^([\w.]+)\s*(<-|=)\s*function\b/`)
- **Documentation Integration**: Interfaces with R's `toscutil` package
- **Package Structure**: Automatically detects R package root via `DESCRIPTION` file
- **Test Discovery**: Intelligent test file location and creation

### Command Registration Pattern
```typescript
vscode.commands.registerTextEditorCommand('vstosc.commandName', commandFunction)
```

## Development Guidelines

### Code Style and Patterns
1. **Error Handling**: Use helper functions (`showNoEditorMsgAndExit()`, `showNoTerminalMsgAndExit()`) for consistent error messaging
2. **Cross-Platform**: Always handle Windows vs Unix differences in shell commands
3. **Path Normalization**: Use `path.normalize()` and replace backslashes for cross-platform compatibility
4. **Logging**: Include console logging for debugging R-related functions

### Adding New Commands
1. Define command function in appropriate module
2. Register command in `activate()` function in `extension.ts`
3. Add command contribution to `package.json`:
   ```json
   {
     "command": "vstosc.newCommand",
     "title": "vstosc: Command Description"
   }
   ```
4. Update README.md with usage documentation
5. Consider adding demo GIF/video to `doc/` folder

### Testing Guidelines
- Add tests to `src/test/suite/extension.test.ts`
- Use sample R functions in `test_data/functions.R` for R-specific testing
- Test cross-platform compatibility for shell commands

### R Integration Requirements
- **Dependencies**: Ensure R and required packages (`toscutil`) are documented
- **Path Handling**: Always use forward slashes for R command compatibility
- **Error Messages**: Provide clear guidance when R dependencies are missing

## Build and Deployment

### Development Workflow
1. **Setup**: `npm install`
2. **Development**: `F5` to launch Extension Development Host
3. **Build**: `npm run compile` or `npm run watch`
4. **Testing**: `npm test`
5. **Package**: `vsce package`

### Publishing Process
- **Automated**: Push tags to main branch triggers GitHub Actions workflow
- **Manual**: Use `vsce publish` with appropriate credentials
- **Version Management**: Follow semantic versioning in `package.json`

### GitHub Actions
- **Build Workflow**: Validates TypeScript compilation and linting
- **Publish Workflow**: Automatically publishes to VS Code Marketplace on tagged commits

## Dependencies and Requirements

### Runtime Dependencies
- VS Code ≥1.79.1
- For R features: R installation with `toscutil` package (≥2.7.1)

### Development Dependencies
- TypeScript 4.1.2+
- VS Code Extension API types
- esbuild for bundling
- ESLint for code quality
- Mocha for testing

## Maintenance Notes

### Keeping This File Updated
**IMPORTANT**: This copilot-instructions.md file should be updated whenever:
- New commands or features are added
- Project structure changes significantly
- Dependencies or requirements change
- Build/deployment process is modified
- Major architectural changes are made

### Version Management
- Update version in `package.json` following semantic versioning
- Update `CHANGELOG.md` with notable changes
- Tag releases for automatic publishing

### Cross-Platform Considerations
- Test shell commands on both Windows and Unix systems
- Verify path handling across different operating systems
- Ensure R integration works with different R installation methods

### Performance Considerations
- Use esbuild for efficient bundling and fast startup
- Minimize synchronous file operations
- Handle large R files efficiently in docstring generation

## Common Development Scenarios

### Adding a New Shell Command Feature
1. Study existing `runCommand`/`runSelection` implementations
2. Handle platform-specific shell differences
3. Implement proper error handling and user feedback
4. Test with various input scenarios

### Extending R Language Support
1. Understand the R function detection regex patterns
2. Consider R package structure requirements
3. Test with various R function definition styles
4. Ensure compatibility with existing `toscutil` package

### Improving Documentation Features
1. Study roxygen2 documentation standards
2. Test with complex function signatures
3. Handle edge cases in function parsing
4. Provide clear error messages for missing dependencies

This documentation serves as a comprehensive guide for anyone contributing to or maintaining the vstosc extension.