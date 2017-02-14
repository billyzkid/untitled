#!/usr/bin/env node

"use strict";

const args = process.argv.slice(2);
const code = require("../build").execute(args);

process.exit(code);