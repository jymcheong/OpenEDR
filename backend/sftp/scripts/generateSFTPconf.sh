#!/bin/bash

## Extract SFTP user name
sftpuser=""
userConfFinalPath="/var/run/sftp/users.conf"
if [ -f "$userConfFinalPath" ] && [ "$(wc -l < "$userConfFinalPath")" -gt 0 ]; then
        # Import users from final conf file
        while IFS= read -r user || [[ -n "$user" ]]; do
            sftpuser="$user"
        done < "$userConfFinalPath"
fi
sftpuser=${sftpuser/"::1001"/}
echo $sftpuser

## Extract key file name
keyfile=`ls /etc/ssh/keys/sftpconf |grep id`
echo "$keyfile"

## Extract IP addresses
payload=""
file="/etc/IPaddresses"
while read -r line
do                     # need to match docker-compose.yml port-mapping (host side, it's listening to 2222 within container)
  payload='{"address":"'$line'","port":"2222","user":"'$sftpuser'","keyName":"'$keyfile'"},'$payload
done < $file
payload=${payload::-1}

cp /etc/ssh/keys/sftpconf/sftpconf.json.template /etc/ssh/keys/sftpconf/sftpconf.json
sed -i 's/{}/'$payload'/g' /etc/ssh/keys/sftpconf/sftpconf.json

# this zip file is for Upload.exe
cd /etc/ssh/keys/
zip -r sftpconf.zip "sftpconf/"

mv sftpconf.zip /home/clientconf