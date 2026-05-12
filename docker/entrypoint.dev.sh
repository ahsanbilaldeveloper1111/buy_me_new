#!/bin/sh
set -e

# Reinstall when package.json or package-lock.json *content* changes (mtime is unreliable after git pull).
deps_sig() {
  { cat package.json; [ -f package-lock.json ] && cat package-lock.json; } | sha256sum | awk '{print $1}'
}

SIG=node_modules/.deps-signature
want="$(deps_sig)"
have=""
[ -f "$SIG" ] && have="$(cat "$SIG")"

if [ ! -d node_modules ] || [ "$want" != "$have" ]; then
  npm install --ignore-scripts
  mkdir -p node_modules
  printf '%s' "$want" >"$SIG"
fi

npm run prisma:migrate:deploy
exec "$@"
