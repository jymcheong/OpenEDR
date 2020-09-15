# Demo
Click thumbnail below to watch:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/5YeH1RwzqXU/0.jpg)](https://www.youtube.com/watch?v=5YeH1RwzqXU)

# Getting Started
**Use a sudoer account for Ubuntu or macOS docker host**. For Windows, please refer to https://docs.docker.com/docker-for-windows/wsl/). 

* Tested backend installation ([see screencast](https://asciinema.org/a/AqZUQgakqMAErdWqoDc9b3dyS)) on Ubuntu 16-20 servers, with (at least) 1 vCPU, 3GB RAM & 50GB disk.
* Host agents installation tested on Win10 & Server 2012R2 to 2019 64bit
* Windows endpoints need to be able to reach the backend at TCP port 2222 & 8081

## Installation Steps
With a sudoer account, install the backend with: 

`curl -L https://raw.githubusercontent.com/jymcheong/OpenEDR/master/install.sh |bash`

Use the output from the backend installation script looks similar to the following: 

```
$SFTPCONFURL='http://<YOUR_IP_ADDRESS>:8081/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'))
```

It is a powershell command  that can be pasted to endpoint for host agent installations. **Please use admin powershell session**.

<<<<<<< Updated upstream
## Learn More
https://github.com/jymcheong/OpenEDR/wiki
=======
## Do a quick test!
https://github.com/jymcheong/OpenEDR/wiki/3.-Detection-&-False-Positives
>>>>>>> Stashed changes
