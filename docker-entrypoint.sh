#!/bin/sh
set -e
sed -e "s|apiHOST|${GIRDER_API_URL}|g" -i /srv/dashboard/index.html
nginx -g "daemon off;"
