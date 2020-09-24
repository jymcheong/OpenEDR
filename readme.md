# Demo
Click thumbnail below to watch:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/5YeH1RwzqXU/0.jpg)](https://www.youtube.com/watch?v=5YeH1RwzqXU)

# Shout-Outs
To Microsoft for Sysmon, Nxlog for Nxlog-CE, OrientDB & Wekan!

# Getting Started
**Use a sudoer account for Ubuntu or macOS docker host**. For Windows, please refer to https://github.com/jymcheong/OpenEDR/issues/3). 

* Tested backend installation ([see screencast](https://asciinema.org/a/AqZUQgakqMAErdWqoDc9b3dyS)) on Ubuntu 16-20 servers, with (at least) 1 vCPU, 3GB RAM & 50GB disk.
* Host agents tested on Win10 & Server 2012R2 to 2019 64bit
* Windows endpoints need to be able to reach the backend at TCP port 2222 & 8888

## Installation Steps
With a sudoer account, install the backend with: 

`curl -L https://raw.githubusercontent.com/jymcheong/OpenEDR/master/install.sh |bash`

Use the output from the backend installation script looks similar to the following: 

```
$SFTPCONFURL='http://<YOUR_IP_ADDRESS>:8888/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'))
```

It is a powershell command  that can be pasted to endpoint for host agent installations. **Please use admin powershell session**.

Other installation scenarios: https://github.com/jymcheong/OpenEDR/wiki/0.-Installation

## Run a Quick Test!
https://github.com/jymcheong/OpenEDR/wiki/3.-Detection-&-False-Positives
