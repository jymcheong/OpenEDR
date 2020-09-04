#!/bin/bash

export ORIENTDB_ROOT_PASSWORD=`< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-16};echo;`
export ORIENTDB_WRITER_PASSWORD=`< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-16};echo;`
export ORIENTDB_HOME=`pwd`
ORIENTDB_VERSION=3.0.28

wget https://s3.us-east-2.amazonaws.com/orientdb3/releases/$ORIENTDB_VERSION/orientdb-$ORIENTDB_VERSION.tar.gz

mkdir -p odb
tar zxvf orientdb-$ORIENTDB_VERSION.tar.gz -C odb/ --strip-components=1
cd odb/bin/
tmux new-session -d -s odb './server.sh -Dlog.console.level=WARNING -Dlog.file.level=warning'
cd ../../

echo "Started OrientDB, waiting for 10 secs..."
sleep 10
echo "Creating database & importing schema..."
odb/bin/console.sh "create database remote:localhost/DataFusion root $ORIENTDB_ROOT_PASSWORD; import database backend/exportScripts/schema.gz;"

echo "Importing server-side functions..."
odb/bin/console.sh "use remote:localhost/DataFusion root $ORIENTDB_ROOT_PASSWORD; import database backend/exportScripts/functions.json -merge=true;"

echo "Adding root & writer accounts..."
odb/bin/console.sh "use remote:localhost/DataFusion root $ORIENTDB_ROOT_PASSWORD; update ouser set password='$ORIENTDB_WRITER_PASSWORD' where name = 'writer';"

# create the .env file for backend scripts to use
echo "ORIENTDB_HOST=localhost" > ./.env
echo "ORIENTDB_PORT=2424" >> ./.env
echo "ORIENTDB_NAME=DataFusion" >> ./.env
echo "ORIENTDB_USER=writer" >> ./.env
echo "ORIENTDB_PASSWORD=$ORIENTDB_WRITER_PASSWORD" >> ./.env
echo "C2_PATH=$PWD/backend/sftp/c2/" >> ./.env
chmod 600 ./.env

# export using root account, using this to store. Better to replace with writer
cd backend/exportScripts
echo "ORIENTDB_HOST=localhost" > ./.env
echo "ORIENTDB_PORT=2424" >> ./.env
echo "ORIENTDB_NAME=DataFusion" >> ./.env
echo "ORIENTDB_USER=root" >> ./.env
echo "ORIENTDB_PASSWORD=$ORIENTDB_ROOT_PASSWORD" >> ./.env
chmod 600 ./.env

# we kill it for now because we will add it in pm2 in 3_Backend.sh script
tmux kill-session -t odb