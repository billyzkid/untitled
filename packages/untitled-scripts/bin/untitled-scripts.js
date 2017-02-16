#!/usr/bin/env node

"use strict";

const script = process.argv[2];
const args = process.argv.slice(3);
const code = require("../build").run(script, args);

process.exit(code);