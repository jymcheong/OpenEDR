[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/5YeH1RwzqXU/0.jpg)](https://www.youtube.com/watch?v=5YeH1RwzqXU)

# Getting Started
**Use a sudoer account for Ubuntu or macOS docker host**. For Windows, please refer to https://docs.docker.com/docker-for-windows/wsl/). 

* Tested backend installation ([see screencast](https://asciinema.org/a/AqZUQgakqMAErdWqoDc9b3dyS)) on Ubuntu 16-20 servers, with (at least) 1 vCPU, 3GB RAM & 50GB disk.
* Host agents installation tested on Win10/server 2012R2 to 2019 64bit
* Windows endpoints need to be able to reach the backend at TCP port 2222

## Steps
* With a sudoer account, run: 

`curl -L https://raw.githubusercontent.com/jymcheong/OpenEDR/master/install.sh |bash`
* Last powershell line (`$SFTPCONFURL=...`) from console can be pasted to endpoint for host agent installations. **Please use admin powershell session**.
