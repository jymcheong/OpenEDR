#!/bin/bash
# usage: sudo docker exec -it wekan-db /dump/export.sh

sudo docker exec -it wekan-db /bin/bash -c "rm -rf /dump/wekan && rm -rf /dump/wekan.tgz && mongodump && cd /dump && tar czvf wekan.tgz wekan/"