#!/bin/sh
set -e

if [ -f package-lock.json ] && ( [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ] || ! cmp -s package-lock.json node_modules/.package-lock.json ); then
  npm install --ignore-scripts
  cp package-lock.json node_modules/.package-lock.json
fi

npm run prisma:migrate:deploy
exec "$@"
