#!/usr/bin/env node

"use strict";

var chalk = require("chalk");
var childProcess = require("child_process");
var commander = require("commander");
var crossSpawn = require("cross-spawn");
var fsExtra = require("fs-extra");
var packageJson = require("./package.json");
var path = require("path");
var semver = require("semver");

console.warn(`${packageJson.name} is not implemented!`);