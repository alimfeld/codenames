#!/bin/sh
service nginx start
gunicorn3 -c /codenames/etc/gunicorn.py server:app
