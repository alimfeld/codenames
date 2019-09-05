# Codenames

Play Codenames against software which uses a word embedding model.

The Codenames application in this repo consists of both a server and client.

The server exposes an API to interact with the Codenames engine (i.e. for
generating clues and making guesses). It is written in Python and uses
[gensim](https://github.com/RaRe-Technologies/gensim) on the engine side and
[Flask](https://github.com/pallets/flask) on the web side.

The client renders a UI and manages the game state. It is written in JavaScript
using [React](https://reactjs.org).

# Development

## Prerequisites

* python & pip (Python 2 and 3 should work both fine)
* node & npm

## Setup

* Clone this repo
* Install server dependencies:
  `codenames/server$ pip install -r requirements.txt`
* Install client dependencies:
  `codenames/client$ npm install`
* Download a pre-trained binary [fastText](https://fasttext.cc) model from
  https://fasttext.cc/docs/en/crawl-vectors.html and decompress it to
  `codenames\server\i18n`

Note: Only the german binary model is supported for now: `cc.de.300.bin`

## Run the applications

* Start the server:
  `codenames/server$ export FLASK_APP=server.py && python -m flask run`
* Start the client:
  `codenames/client$ npm start`
* Open http://localhost:3000 in your web browser

Note: The server takes a long time to start while loading the huge fastText
model into memory.

