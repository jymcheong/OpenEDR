#!/bin/bash

# Pick a valid network interface or first non-localhost
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

# Get IP address
IPADDR=$(/sbin/ifconfig $INTERFACE |grep 'inet ' | awk -F' ' '{print $2}' | head -1)
echo "Using $IPADDR"

# Start up docker container
cd backend/sftp
echo $IPADDR > ./scripts/IPaddresses

# Mount write-only directory as 1 of the container's volumes
if [ -f "/usr/bin/bindfs" ]; then
    echo "Mounting write-only uploads directory..."
    sudo bindfs --delete-deny --create-for-user=$USER --force-group=$GROUPS --create-with-perms=g+w,o-rw -p o+w tobeinserted uploads
    echo "Mounting read-only response directory..."
    sudo bindfs -o ro c2 response
fi

docker-compose up -d


