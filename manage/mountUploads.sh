#!/bin/bash

# Run from root of source directory
#> manage/mountUploads.sh

if ! bindfs |grep delete-deny > /dev/null 2>&1; then
    sudo bindfs --create-for-user=$USER --force-group=$GROUPS --create-with-perms=g+w,o-rw -p o+w -o nonempty $PWD/backend/sftp/tobeinserted $PWD/backend/sftp/uploads
else
    sudo bindfs --delete-deny --create-for-user=$USER --force-group=$GROUPS --create-with-perms=g+w,o-rw -p o+w -o nonempty $PWD/backend/sftp/tobeinserted $PWD/backend/sftp/uploads
fi

sudo docker start onewaysftp