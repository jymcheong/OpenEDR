#!/bin/bash

# please run from the root folder of the source tree:
# $ install/4_Frontend.js

if [ $# -eq 0 ]
then
    echo "Please provide a valid network interface (eg. eth0)..."
    exit
else
    OP=$(ifconfig $1 2>&1)
    if ifconfig $1 2>&1| grep "Device not" - > /dev/null;
    then
        echo "$1 not found... exiting"
        exit
    fi
    INTERFACE=$1
fi

IPADDR=$(/sbin/ifconfig $INTERFACE |grep 'inet ' | awk -F' ' '{print $2}' | head -1)

npm i ws@7.2.0 express@4.17.1 body-parser@1.19.0 mongodb@3.2.7 console-stamp@0.2.9 squirrelly@7.7.0 moment@2.24.0

pm2 start frontend/dashboard/dashboardController.js
pm2 start frontend/frontend.js
pm2 save
pm2 startup

git clone https://github.com/wekan/wekan

# backup the stuff to be overwritten
cp wekan/docker-compose.yml wekan/docker-compose.yml.org
cp install/wekanMods/docker-compose.yml wekan/

cp wekan/client/components/cards/cardDetails.styl wekan/client/components/cards/cardDetails.styl.org
cp install/wekanMods/cardDetails.styl wekan/client/components/cards/cardDetails.styl

cd wekan/
sed -i 's/ROOT_URL=.*/ROOT_URL=http:\/\/'"$IPADDR"'/g' docker-compose.yml
docker-compose up -d
cd ../install/wekanMods/dump
tar zxvf wekan.tgz
docker cp wekan wekan-db:/dump
sleep 5
docker exec -it wekan-db mongorestore --drop
# default wekan user: admin
# password: wekanROCKS

pm2 restart frontend
