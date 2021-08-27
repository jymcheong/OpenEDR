#!/bin/bash

sudo docker stop openedr-app
sudo docker stop orientdb

rm -rf ../../orientdb/import_completed

sudo docker start orientdb
sudo docker start openedr-app
sudo docker logs -f -n 100 orientdb
