#!/bin/bash

# This script automates the hosting of windows-clients installation powershell script
# & the necessary SFTP configurations for event files upload.

PORT=8081
mkdir -p $HOME/clientinstall
sleep 10 # wait for sftpconf.zip to appear, it is created within container's scripting
cp ./backend/sftp/keys/sftpconf.zip $HOME/clientinstall
# There are alternative ways to define the variable $SFTPCONFURL in a powershell session

cd $HOME/clientinstall
INSTALLMSG=false
ver=$(python -c"import sys; print(sys.version_info.major)")
if [ $ver -eq 2 ]; then
    INSTALLMSG=true
    python -m SimpleHTTPServer $PORT > $HOME/clientinstall.log &
elif [ $ver -eq 3 ]; then
    INSTALLMSG=true
    python -m http.server $PORT > $HOME/clientinstall.log &
else 
    echo "Please use a webserver to host $HOME/clientinstall files"
fi

if $INSTALLMSG ; then
   echo "Please use powershell session with ADMIN rights, copy-&-paste the LAST line\n & press enter to install at Windows endpoints:"
   echo ""
   MSG="\$SFTPCONFURL='http://$IPADDR:$PORT/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'))"
   echo $MSG 
   echo $MSG > ~/clientinstall/readme.txt
fi