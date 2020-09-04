#!/bin/bash

export ORIENTDB_ROOT_PASSWORD=`cat .env |grep PASSWORD |sed 's/ORIENTDB_PASSWORD=//g'`
export ORIENTDB_WRITER_PASSWORD=`cat ../../.env |grep PASSWORD |sed 's/ORIENTDB_PASSWORD=//g'`

# Import schema. THIS WILL WIPE EVERYTHING
docker exec -it orientdb console.sh "use remote:localhost/DataFusion root $ORIENTDB_ROOT_PASSWORD; import database /openedrserver/backend/exportScripts/schema.gz;"

echo "Importing server-side functions, OUSER & OROLE..."
docker exec -it orientdb console.sh "use remote:localhost/DataFusion root $ORIENTDB_ROOT_PASSWORD; import database /openedrserver/backend/exportScripts/functionsONLY.json -merge=true -migrateLinks=false -rebuildIndexes=false;"

echo "Update writer password"
docker exec -it orientdb console.sh "use remote:localhost/DataFusion root $ORIENTDB_ROOT_PASSWORD; update ouser set password='$ORIENTDB_WRITER_PASSWORD' where name = 'writer';"