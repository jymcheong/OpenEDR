#!/bin/bash

# This script automates the hosting of windows-clients installation powershell script
# & the necessary SFTP configurations for event files upload.

PORT=8081
mkdir -p $HOME/clientinstall
sleep 10 # wait for sftpconf.zip to appear, it is created within container's scripting
cp ./backend/sftp/keys/sftpconf.zip $HOME/clientinstall

cd $HOME/clientinstall
echo "Please use powershell session with ADMIN rights, copy-&-paste the LAST line\n & press enter to install at Windows endpoints:"
MSG="\$SFTPCONFURL='http://$IPADDR:$PORT/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol $
echo $MSG > ~/clientinstall/readme.txt

sudo docker run -d -p $PORT:80 -v $PWD/readme.txt:/usr/share/caddy/index.html -v $PWD:/usr/share/caddy -v caddy_data:/data caddy

echo ""
echo $MSG