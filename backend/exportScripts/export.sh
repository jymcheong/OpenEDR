#!/bin/bash

export ORIENTDB_ROOT_PASSWORD=`cat .env |grep PASSWORD |sed 's/ORIENTDB_PASSWORD=//g'`

# export ONLY schema
sudo docker exec -it orientdb /bin/bash -c "/orientdb/bin/console.sh use \"remote:localhost/DataFusion root $ORIENTDB_ROOT_PASSWORD; export database /openedrserver/backend/exportScripts/schema.gz -includeRecords=false;\""

# export functions, OUSER & OROLE for FRESH installation; see ../orientdb/entrypoint
# Why using a script? The official EXPORT DATABASE is very slow, the larger the DB, the slower!
# output file: functions.json
# Don't worry about the password hash export, entrypoint will re-generate password for new installation
sudo docker exec -it openedr-app /bin/bash -c "cd /openedrserver/backend/exportScripts/ && node exportFunctions_ORole.js"

# export functions ONLY since OUSER & OROLE cannot be merged nor do you want it to overwrite. upgrade.sql uses this.
# output file: functionsONLY.json
sudo docker exec -it openedr-app /bin/bash -c "cd /openedrserver/backend/exportScripts/ && node exportFunctions.js"

sudo docker exec -it openedr-app /bin/bash -c "cd /openedrserver/backend/exportScripts/ && node writeODBfunctions2files.js"
