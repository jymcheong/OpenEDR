#!/bin/bash


rm -rf dump/wekan
sudo docker restart wekan-db
sudo docker logs -f wekan-db 
