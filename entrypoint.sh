#!/bin/bash
set -e

if [ "$1" == 'dashboard' ]; then
   echo "Starting nginx with GIRDER_HOST=$GIRDER_HOST" 
   sed -i index.html -e "s|API_HOST|$GIRDER_HOST|g"
   nginx -g 'daemon off;'
else
   exec "$@"
fi
