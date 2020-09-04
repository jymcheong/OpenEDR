#!/bin/bash

exit_script() {
  echo "P1: Caught sigterm in p1, sending TERM to p2"
  kill -TERM $child
  wait $child
}

trap exit_script SIGINT SIGTERM

mongod --oplogSize 128 --bind_ip_all &
child=$!
    
if [ ! -d /dump/wekan ]; then
    echo "Importing OpenEDR boards..."
    cd /dump  
    tar xvf ./wekan.tgz
    cd /
    mongorestore --drop    
fi

wait $child
