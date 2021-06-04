#!/bin/bash

# AVOID the same network zone/range as the SFTP receiver service
# for Wekan & OrientDB web-UI
FRONTEND_IP=127.0.0.1 
# for Wekan web-UI only
FRONTEND_PORT=8080
SFTPCONF_PORT=8888
SFTP_PORT=2222

if ! command -v curl &> /dev/null
then
    echo "curl missing... pls install in order to proceed further"
    exit
fi

if ! command -v docker &> /dev/null
then
    echo "docker is missing... using https://get.docker.com/ to install..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# dealing with CentOS 
if ! command -v docker-compose &> /dev/null
then
    echo "docker-compose is missing... using https://get.docker.com/ to install..."
    sudo curl -L https://github.com/docker/compose/releases/download/1.29.1/docker-compose-`uname -s`-`uname -m` -o /usr/bin/docker-compose
    sudo chmod +x /usr/bin/docker-compose
fi

case $OSTYPE in
  "linux-gnu"*) # updated to 3.0.34 on 23-Apr-2021 for Arm64
    echo "detected GNU Linux..."
    # Get the first IP address
    IPADDR=$(hostname -I | awk '{print $1}')    

    # protect uploaded contents, see http://spgl.jym.pw/RnD/openedr/-/issues/7#note_585
    sudo chown 1001:0 ./backend/sftp/uploads
    sudo chmod g+s ./backend/sftp/uploads
    
    # this only works in linux with ACL enabled
    # -m (modify) d (default) u (user) -w- (write-only)
    sudo setfacl -m d:u::-w- ./backend/sftp/uploads
    ;;
  "darwin"*)
    echo "detected macOS..."
    touch ./.macOS # so that ./orientdb/entrypoint can use the correct start ODB options
    IPADDR=$(ipconfig getifaddr en0)
    if [[ $IPADDR == "" ]]; then
        IPADDR=$(ipconfig getifaddr en1)
    fi
    ;;
esac

# caters to Arm64 Linux/macOS
case "$(arch)" in
  aarch64|arm64) # updated to 3.0.34 on 23-Apr-2021 for Arm64
    ODB_IMAGE="jymcheong/openedr:orientdb" 
    ;;
  x86_64)
    ODB_IMAGE="orientdb:3.0.34"
    ;;
  *)
    ODB_IMAGE="orientdb:3.0.34"
    ;;
esac

echo "Using $IPADDR for SFTP destination address"
echo "USERID=$UID" > .env
echo "ODB_IMAGE=$ODB_IMAGE" >> .env
echo "FRONTEND_IP=$FRONTEND_IP" >> .env
echo "FRONTEND_PORT=$FRONTEND_PORT" >> .env
echo "SFTP_HOST=$IPADDR" >> .env
echo "SFTPCONF_PORT=$SFTPCONF_PORT" >> .env
echo "SFTP_PORT=$SFTP_PORT" >> .env
echo "C2_PATH=./backend/sftp/response/" >> .env

# sftp/scripts/generateSFTPconf.sh will read this file
# to generate sftpconf.zip, which is needed at client-side
echo $IPADDR > ./backend/sftp/IPaddresses

# sftp container will shift uploaded files & signal folders into here
echo "UPLOAD_PATH=./backend/sftp/tobeinserted" >> .env

touch orientdb/orient.pid
# docker-compose will take care of the rest of the services
sudo docker-compose up -d

# because we start docker-compose with sudo & clientconf will be owned by root
# subsequent write to clientconf will fail without changing ownership
sudo chown $(id -u) ./clientconf

while [ ! -f ./backend/sftp/keys/sftpconf.zip ]; do
  echo "Wait for sftpconf.zip..."
  sleep 5 # orientdb/entrypoint will write this file upon successful schema & functions import
done 

cp ./backend/sftp/keys/sftpconf.zip ./clientconf
MSG="\$SFTPCONFURL='http://$IPADDR:$SFTPCONF_PORT/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'))"
echo $MSG > ./clientconf/index.html

echo ""
echo "Please copy the LAST line (\$SFTP...), paste into an ADMIN powershell session" 
echo "& press enter to install at Windows endpoints:"
echo ""
echo $MSG
