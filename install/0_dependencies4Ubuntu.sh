#!/bin/bash

# install all the necessary dependencies...
sudo apt-get update  
sudo apt install git zip bindfs curl tmux moreutils default-jre net-tools -y 
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt install nodejs build-essential -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable edge"
sudo apt-get update
sudo apt-cache policy docker-ce
sudo apt-get install -y docker-ce docker-compose

sudo /etc/init.d/docker start