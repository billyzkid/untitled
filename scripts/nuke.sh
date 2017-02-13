#!/bin/bash

# Start in scripts directory even if run from root
cd "$(dirname "$0")"

# Exit the script on any command with non-zero return code
set -e

# Echo every command being executed
set -x

# Go to root
cd ..

rm -rf node_modules/
rm -f *.log

for D in packages/*; do
  if [ -d "${D}" ]; then
    rm -rf ${D}/build/
    rm -rf ${D}/coverage/
    rm -rf ${D}/node_modules/
    rm -f ${D}/*.log
  fi
done