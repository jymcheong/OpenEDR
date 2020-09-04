#!/bin/bash

# Run from root of source directory
#> manage/rotateLog.sh

DATE=`date "+%Y.%m.%d-%H.%M.%S"`
FNAME="sftp.log.UTC$DATE"
echo "Rotating sftp.log to sftp.log.UTC$FNAME ..."
mv backend/sftp/log/sftp.log $FNAME
PID=`docker exec -it onewaysftp ps -ef |grep rsyslogd |cut -d" " -f4`
docker exec -it onewaysftp kill -HUP $PID