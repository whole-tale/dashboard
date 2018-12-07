#!/bin/sh
set -e
sed -e "s|apiHOST|${GIRDER_API_URL}|g" -i /srv/dashboard/index.html
sed -e "s|dashboardHOST|${DASHBOARD_URL}|g" -i /srv/dashboard/index.html
sed -e "s|dataOneHOST|${DATAONE_URL}|g" -i /srv/dashboard/index.html
sed -e "s|authPROVIDER|${AUTH_PROVIDER}|g" -i /srv/dashboard/index.html
nginx -g "daemon off;"
