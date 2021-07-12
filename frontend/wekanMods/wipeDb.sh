#!/bin/bash


sudo rm -rf dump/wekan
sudo rm -rf db/*
sudo docker restart wekan-db
sudo docker logs -f wekan-db 
