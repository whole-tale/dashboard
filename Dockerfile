FROM node:4

RUN npm install -g ember-cli
RUN npm install -g bower

RUN git clone https://github.com/whole-tale/dashboard /srv

WORKDIR /srv

RUN npm install
RUN bower install --allow-root

EXPOSE 4200
ENTRYPOINT ["ember", "serve"]
