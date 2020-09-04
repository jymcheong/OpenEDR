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

cd backend/sftp

# /writeonly is mounted as /uploads within the 1waySFTP container. Upload.exe can ONLY write logs to /uploads, cannot read or delete
#sudo bindfs --delete-deny --create-for-user=docker --force-group=docker --create-with-perms=g+w,o-rw -p o+w $SFTPDIR/readwrite $SFTPDIR/writeonly

#docker-compose up -d

cd keys
keyfile=`ls |grep id`
echo "$keyfile"


# this zip file is for Upload.exe
# zip -r sftpconf.zip "sftpconf/"
