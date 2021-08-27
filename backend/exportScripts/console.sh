#!/bin/bash

# With great power comes great responsibilities...
# This password is generated during fresh installation... not hardcoded
export ROOTPWD=`cat .env |grep PASSWORD |sed 's/ORIENTDB_PASSWORD=//g'`
echo "Copy & paste to start session: use remote:localhost/DataFusion root $ROOTPWD" 
# type exit to quit console
sudo docker exec -it orientdb bash -c "cd /openedrserver && /orientdb/bin/console.sh"
