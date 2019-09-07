FROM node:12 AS builder
WORKDIR /client
# install dependencies 
COPY client/package.json .
RUN npm install
# build the client
COPY client .
RUN npm run build

FROM debian:buster
WORKDIR /codenames
# install system packages
RUN apt-get update && apt-get install -y \
    gunicorn3 \
    nginx \
    python3 \
    python3-pip \
    wget
# fetch the model
RUN wget https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.de.300.bin.gz \
    -nv --show-progress --progress=bar:force:noscroll -P server/i18n
# configure services
COPY etc etc
RUN rm /etc/nginx/sites-enabled/default
RUN ln -s /codenames/etc/nginx.conf /etc/nginx/sites-enabled/codenames
# install python packages
COPY server/requirements.txt server/
RUN pip3 install -r server/requirements.txt
# copy the server code
COPY server server
# copy the client code
COPY --from=builder /client/build client
# entrypoint & port
COPY entrypoint.sh .
ENTRYPOINT ./entrypoint.sh
EXPOSE 80
