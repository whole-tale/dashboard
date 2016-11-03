FROM node:4

RUN npm -s install -g bower

RUN git clone https://github.com/whole-tale/dashboard /srv

WORKDIR /srv

RUN npm -s install
RUN bower install --allow-root

EXPOSE 4200
ENTRYPOINT ["/srv/node_modules/.bin/ember", "serve"]
