#!/bin/sh
set -eu
# Apply pending migrations before the server accepts traffic.
node scripts/db.mjs migrate
exec "$@"
