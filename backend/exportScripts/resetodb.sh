#!/bin/bash

sudo docker stop openedr-app
sudo docker stop orientdb

rm -rf ../../orientdb/databases/DataFusion
rm -rf ../../orientdb/databases/OSystem
rm -rf ../../orientdb/import_completed

sudo docker start orientdb
sudo docker start openedr-app
sudo docker logs -f orientdb
