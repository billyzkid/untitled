#!/bin/bash

# Start in scripts directory even if run from root
cd "$(dirname "$0")"

# Exit the script on any command with non-zero return code
set -e

# Echo every command being executed
#set -x

# Go to root
cd ..

rm -fr node_modules/
rm -f *.log

for D in packages/*; do
  if [ -d "${D}" ]; then
    rm -fr ${D}/build/
    rm -fr ${D}/coverage/
    rm -fr ${D}/node_modules/
    rm -f ${D}/*.log
  fi
done
