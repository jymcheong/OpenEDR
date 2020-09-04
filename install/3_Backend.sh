#!/bin/bash

# run script from root of DataFusion 
npm i orientjs@3.0.8 console-stamp@0.2.9 jaro-winkler@0.2.8 event-stream@4.0.1 chokidar@3.3.0 dotenv@8.2.0 parse-function@5.4.4

# PM2 needs escalation to add to autostart at system boot
sudo npm i -g pm2

pm2 start odb/bin/server.sh -- "-Dlog.console.level=WARNING -Dlog.file.level=warning"
pm2 start backend/startProfiling.js
pm2 start backend/startDetection.js

if [ -f "/usr/bin/bindfs" ]; then
    pm2 start backend/insertEvent.js -- $PWD/backend/sftp/tobeinserted
else # cater to OSes that do not have bindfs
    pm2 start backend/insertEvent.js -- $PWD/backend/sftp/uploads
fi

# correct the ownership due to sudo npm earlier
sudo chown -R $USER ~/.npm/
pm2 save
pm2 startup

sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME