#!/bin/bash

# This script automates the hosting of windows-clients installation powershell script
# & the necessary SFTP configurations for event files upload.

PORT=8081
mkdir -p $HOME/clientinstall
sleep 10 # wait for sftpconf.zip to appear, it is created within container's scripting
cp ./backend/sftp/keys/sftpconf.zip $HOME/clientinstall

cd $HOME/clientinstall
MSG="\$SFTPCONFURL='http://$IPADDR:$PORT/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'))"
echo $MSG > ~/clientinstall/readme.txt

sudo docker run -d --name configurationHosting -p $PORT:80 -v $PWD/readme.txt:/usr/share/caddy/index.html -v $PWD:/usr/share/caddy -v caddy_data:/data caddy

echo ""
echo "Please use powershell session with ADMIN rights, copy-&-paste the LAST line\n & press enter to install at Windows endpoints:"
echo $MSG