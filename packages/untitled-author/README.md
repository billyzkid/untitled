# untitled-author

This package provides the global commands for use by story/extension authors.

## Installation

```sh
npm install untitled-author --global
```

## Usage

To author a new story, run:

```sh
untitled-author my-story
cd my-story
```

Or, to author a new extension, run:

```sh
untitled-author my-extension --extension
cd my-extension
```

This will create a directory named "my-story" (or "my-extension") inside the current directory, generate the initial project structure, and then install the package dependencies. Once the installation is done, you can run the following commands:

- `npm start`
- `npm test`
- `npm run build`
- `npm run eject`