import childProcess from "child_process";
import path from "path";

const repositoryUrlRegExp = /\S+?([\w-]+\/[\w-]+)\.git/;
const pathSepRegExp = /[\\/]/g;
const pathSep = "/";
const space = " ";

function executeCommand(command) {
  return childProcess.execSync(command, { encoding: "utf8" }).trim();
}

function getStatus(verbose) {
  let command = "git status";

  if (verbose) {
    command += " --verbose";
  }

  return executeCommand(command);
}

function getRemote(verbose) {
  let command = "git remote";

  if (verbose) {
    command += " --verbose";
  }

  return executeCommand(command);
}

function getLog(revisionRange, ...paths) {
  let command = "git log --pretty=\"%H;%D\" --first-parent";

  if (revisionRange) {
    command += ` ${revisionRange}`;
  }

  if (paths && paths.length > 0) {
    command += ` -- ${paths.join(space)}`;
  }

  return executeCommand(command);
}

function getRepositoryUrl() {
  const remote = getRemote(true);
  const match = remote.match(repositoryUrlRegExp);

  return (match) ? match[0] : null;
}

function getRepositoryName() {
  const remote = getRemote(true);
  const match = remote.match(repositoryUrlRegExp);

  return (match) ? match[1] : null;
}

function getRepositoryPath() {
  const result = executeCommand("git rev-parse --show-toplevel");

  return path.normalize(result);
}

function getRelativePath(from, to) {
  return path.relative(from, to).replace(pathSepRegExp, pathSep);
}

export {
  getStatus,
  getRemote,
  getLog,
  getRepositoryUrl,
  getRepositoryName,
  getRepositoryPath,
  getRelativePath
};
