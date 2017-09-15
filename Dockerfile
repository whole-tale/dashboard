FROM risingstack/alpine:3.4-v7.9.0-4.5.0 as builder

RUN npm -g install bower

COPY .git ./.git
COPY app ./app
COPY config ./config
COPY mirage ./mirage
COPY public ./public
COPY tests ./tests
COPY vendor ./vendor
COPY bower.json .
COPY ember-cli-build.js .
COPY package.json .

RUN sed -i config/environment.js \
        -e 's|%apiHOST%|https://girder.dev.wholetale.org|'
RUN sed -i app/templates/common/footer.hbs \
        -e "s/{commit}/$(git log --pretty=format:'%h' -n 1)/"

RUN unset NODE_ENV && npm -s install
RUN bower install --allow-root
RUN ./node_modules/.bin/ember build --environment=production

FROM python:3.6-alpine
WORKDIR /srv/dashboard
COPY --from=builder /usr/src/node-app/dist .
EXPOSE 4200
CMD ["python3", "-m", "http.server", "4200"]
