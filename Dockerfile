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
        -e 's|%apiHOST%|https://girder.prod.wholetale.org|'
RUN sed -i app/templates/common/footer.hbs \
        -e "s/{commit}/$(git log --pretty=format:'%h' -n 1)/"

RUN unset NODE_ENV && npm -s install
RUN bower install --allow-root
RUN ./node_modules/.bin/ember build --environment=production

FROM nginx:latest
WORKDIR /srv/dashboard
COPY --from=builder /usr/src/node-app/dist /srv/dashboard/.
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
