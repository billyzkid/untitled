#!/usr/bin/env node

"use strict";

const args = process.argv.slice(2);
const code = require("../lib").execute(args);

process.exit(code);
