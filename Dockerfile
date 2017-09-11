FROM risingstack/alpine:3.4-v7.9.0-4.5.0

RUN unset NODE_ENV && \
  git clone https://github.com/whole-tale/dashboard && \
  cd dashboard && \
  sed -i app/templates/common/footer.hbs \
      -e "s/{commit}/$(git log --pretty=format:'%h' -n 1)/" && \
  sed -i config/environment.js \
      -e 's|%apiHOST%|https://girder.prod.wholetale.org|' && \
  npm -s install bower && \
  npm -s install && \
  ./node_modules/.bin/bower install --allow-root && \
  ./node_modules/.bin/ember build --environment=production && \
  cp -r dist/* ../ && \
  cd .. && rm -rf /tmp/* /root/.[a-z]* dashboard

EXPOSE 4200
CMD ["python", "-m", "SimpleHTTPServer", "4200"]
