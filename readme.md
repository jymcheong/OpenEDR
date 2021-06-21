# Demo
Click thumbnail below to watch:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/5YeH1RwzqXU/0.jpg)](https://www.youtube.com/watch?v=5YeH1RwzqXU)

# Shout-Outs
To Microsoft for Sysmon, Nxlog for Nxlog-CE, OrientDB & Wekan!

# Getting Started
**Use a sudoer account for Ubuntu or macOS docker host**. For Windows, please refer to https://github.com/jymcheong/OpenEDR/issues/3). 

* Tested backend installation ([see screencast](https://asciinema.org/a/AqZUQgakqMAErdWqoDc9b3dyS)) on Ubuntu 16-20.04 LTS servers, with (at least) 1 vCPU, 4GB RAM & 50GB disk.
* Host agents tested on Win10 & Server 2012R2 to 2019 64bit
* Windows endpoints needs TCP port 2222 & 8888 to reach backend (Pls check firewall(s) settings)

**[Virtual Internship](https://github.com/jymcheong/Virtual-Internship): Year 1 undegrad's [adventure with OpenEDR](https://www.notion.so/jymcheong/YJ-s-Internship-c9c14b6f5c8e4827b8b0a9f33c499137)** 

## Installation Steps
For a SMOOTH INSTALLATION, PLS ENSURE YOU INSTALLED DOCKER SERVICE FIRST. Thanks :)

With a sudoer account (but **DO NOT preceed command with `sudo`**), install the backend with: 

`curl -L https://raw.githubusercontent.com/jymcheong/OpenEDR/master/install.sh |bash`

**PLEASE USE A UBUNTU 16-20 SERVER, either physical or Virtual Machine.** [But why not on Ubuntu/whatever-linux desktop directly?](https://github.com/jymcheong/OpenEDR/issues/15)

Use the output from the backend installation script looks similar to the following: 

```
$SFTPCONFURL='http://<YOUR_IP_ADDRESS>:8888/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'))
```

It is a powershell command  that can be pasted to endpoint for host agent installations. **Please use admin powershell session**.

Other installation scenarios: https://github.com/jymcheong/OpenEDR/wiki/0.-Installation

## Run a Quick Test!
https://github.com/jymcheong/OpenEDR/wiki/3.-Detection-&-False-Positives
