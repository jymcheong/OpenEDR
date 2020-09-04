sudo apk --no-cache add sudo e2fsprogs syslinux mkinitfs curl build-base linux-headers git zip fuse bash python

sudo apk --no-cache add openjdk11 tini-static --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community

sudo apk --no-cache add docker docker-compose nodejs npm --repository=http://dl-cdn.alpinelinux.org/alpine/latest-stable/community

sudo rc-update add docker boot

sudo service docker start

# pre-compiled for alpine linux since there is no package
sudo cp ./setup/alpine/bindfs /usr/local/bin

# needed in 1_installSFTP.sh bindfs commands
sudo modprobe fuse

# even after docker service is started, there is still an error
# reboot solves: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running? 
sudo reboot