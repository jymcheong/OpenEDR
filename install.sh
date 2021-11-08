#!/bin/bash

#
# This script was tested on Ubuntu 16-20 server (WSL2 inclusive) & macOS (Intel & M1)
# git clone ... or download the server sub-directory zip file to extract
# cd into new directory
# ./install.sh

COMPOSECMD="docker-compose"
if ! command -v docker &> /dev/null
then
    echo "docker is missing! Please install to proceed further."
    exit
fi

if ! command -v docker-compose &> /dev/null
then
    if ! docker --help |grep -q "compose";
    then
        echo 'Please install docker-compose or a version of docker with compose option!'
        exit
    fi
    COMPOSECMD="docker compose"
fi

# Set default to 127.0.0.1
TIMEOUT=10
DEFAULT_ADDRESS=127.0.0.1
# for Wekan web-UI only
FRONTEND_PORT=8080
# Endpoint will get the SFTP configuration package
SFTPCONF_PORT=8888
# Endpoints uploads to this port but if changed,
# you have to manually change the sftpconf.json within ./clientconf/sftpconf.zip
SFTP_PORT=2222

# Store all IP addresses of the machine into an array
IPcmd="ifconfig"
if ! command -v ifconfig &> /dev/null
then # cases where ifconfig or net-tools is not installed or not there like macOS
    IPcmd="ip a"
fi

I=0
declare -a ipArray
ipArray=(`$IPcmd | awk '$1 == "inet" {gsub(/\/.*$/, "", $2); print $2}'`)

# List out the IP addresses for users to select 
echo "List of IP addresses"
for key in "${!ipArray[@]}"
do
    echo "$key: ${ipArray[$key]}"
    I=$((I+1))
done

prompt_address_selection() {
    # Ask user to enter index number for the desired IP address
    return_value=$DEFAULT_ADDRESS
    read -t $TIMEOUT -p "$1" option
    # If user does not enter within 10 seconds, set FRONTEND_IP to default 127.0.0.1
    if [[ $? -gt 128 ]] ; then
        echo -e "\nTimeout. Setting IP address to default $DEFAULT_ADDRESS..."
    else
        # Check if input only contain numbers
        if [[ $option < $I ]] ; then
            # If user enters without any input, set FRONTEND_IP to default 127.0.0.1
            return_value=${ipArray[option]}        
        else
            echo "Invalid input. Setting IP address to default $DEFAULT_ADDRESS..."
        fi
    fi
}

# Prompt for selections
prompt_address_selection "Select FRONTEND address (set to $DEFAULT_ADDRESS after $TIMEOUT-sec timeout): "
FRONTEND_IP=$return_value
echo "Selected $FRONTEND_IP for FRONTEND web access."

prompt_address_selection "Select SFTP address (set to $DEFAULT_ADDRESS after $TIMEOUT-sec timeout): "
SFTP_IP=$return_value
echo "Selected $SFTP_IP for SFTP event-collection access."

# files will be move the instant it is closed, so low risk
sudo chmod 777 ./backend/sftp/uploads

case $OSTYPE in
  "darwin"*)
    echo "detected macOS..."
    touch ./.macOS # so that ./orientdb/entrypoint can use the correct start ODB options
    ;;
esac

echo "Using $SFTP_IP for SFTP destination address"
echo "USERID=$UID" > .env
echo "FRONTEND_IP=$FRONTEND_IP" >> .env
echo "FRONTEND_PORT=$FRONTEND_PORT" >> .env
echo "SFTP_HOST=$SFTP_IP" >> .env
echo "SFTPCONF_PORT=$SFTPCONF_PORT" >> .env
echo "SFTP_PORT=$SFTP_PORT" >> .env
echo "C2_PATH=./backend/sftp/response/" >> .env
echo "TOBEINSERTED_PATH=./backend/sftp/tobeinserted" >> .env
echo "UPLOAD_PATH=./backend/sftp/uploads" >> .env
echo "SAMPLES_ARCHIVE_PATH=./backend/sftp/samplearchive" >> .env

# sftp/scripts/generateSFTPconf.sh will read this file
# to generate sftpconf.zip, which is needed at client-side
echo $SFTP_IP > ./backend/sftp/IPaddresses

# docker-compose will take care of the rest of the services
sudo $COMPOSECMD up -d

#MSG="\$SFTPCONFURL='http://$SFTP_IP:$SFTPCONF_PORT/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'))"
MSG="start-process -verb runas -Filepath powershell -ArgumentList \"-ExecutionPolicy Bypass\", '-Command \"\$SFTPCONFURL=''http://$SFTP_IP:$SFTPCONF_PORT/sftpconf.zip'';[scriptblock]::Create((New-Object System.Net.WebClient).DownloadString(''https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'')).Invoke();pause;\"'"
echo '# Copy the following & run from powershell session to install host agents:<br>' > ./clientconf/index.html
echo $MSG >> ./clientconf/index.html

echo ""
echo "Please visit http://$($SFTP_IP):$($SFTPCONF_PORT)/ for Windows agents installation instructions."
echo ""

