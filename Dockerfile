FROM node:12 AS builder
WORKDIR /client
# install dependencies 
COPY client/package.json .
RUN npm install
# create production build
COPY client .
RUN npm run build

FROM alpine:3 AS models
WORKDIR /models
# fetch
RUN wget https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.de.300.bin.gz

FROM debian:buster
WORKDIR /codenames
# copy the models
COPY --from=models /models/*.gz server/i18n/
# install system packages
RUN apt-get update && apt-get install -y \
    nginx \
    python3 \
    python3-pip \
    uwsgi \
    uwsgi-plugin-python3
# configure services
COPY etc etc
RUN rm /etc/nginx/sites-enabled/default
RUN ln -s /codenames/etc/nginx.conf /etc/nginx/sites-enabled/codenames
RUN ln -s /codenames/etc/uwsgi.ini /etc/uwsgi/apps-enabled/codenames.ini
# install python packages
COPY server/requirements.txt server/
RUN pip3 install -r server/requirements.txt && rm server/requirements.txt
# copy application
COPY server/*.py server/
COPY server/i18n server/i18n
COPY --from=builder /client/build client
# expose port
EXPOSE 80
# entrypoint
COPY entrypoint.sh .
ENTRYPOINT /codenames/entrypoint.sh
