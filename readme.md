# Demo
Click thumbnail below to watch:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/5YeH1RwzqXU/0.jpg)](https://www.youtube.com/watch?v=5YeH1RwzqXU)

# Getting Started

## Overview

You can install OpenEDR backend on **directly on** **Ubuntu/Debian, MacOS (need a sudoer account**) or Windows Pro (or beyond) with **docker installed**, or within a Ubuntu/Debian Virtual Machine with the following specs: 

* 1 vCPU, 4GB RAM & 50GB disk (note that Ubuntu 20 has wonky DNS that may affect installation).
* Host agents tested on Win10 & Server 2012R2 to 2019 64bit (we monitor these 'endpoints')
* Windows endpoints needs to reach backend TCP port 2222 & 8888 

## Installation Steps
**DO NOT preceed** with `sudo` **for Ubuntu/Debian & MacOS**, start a shell session & run the following:

`curl -L https://github.com/jymcheong/OpenEDR/tarball/master | tar xz && mv jym* openEDR && cd openEDR && ./install.sh`



*For **Windows Pro+ with [WSL2 & Docker installed](https://docs.docker.com/desktop/windows/wsl/)***, start a Powershell session, copy & run the following:

`$tmp = New-TemporaryFile | Rename-Item -NewName { $_ -replace 'tmp$', 'zip' } -PassThru; Invoke-WebRequest -OutFile $tmp https://github.com/jymcheong/OpenEDR/zipball/master; $tmp | Expand-Archive -DestinationPath .\ ; Move-Item jym* openedr ; $tmp | Remove-Item; cd openedr; get-content -raw .\install.ps1 | iex` 

Default Powershell location is user's home folder eg. `C:\Users\yourusername`. If you did not change directory after launching Powershell sessions, a `C:\Users\yourusername\openedr` folder will be created. 

### Select IP Addresses for SFTP Receiver & Monitoring Frontends

The installation script will prompt you to select addresses for the two stated purposes. 

- Windows endpoints installed with host-agents will upload to the SFTP Receiver via that selected IP
- To access OrientDB & Alert monitoring web interfaces, select an address *preferably from a different interface* from the SFTP Receiver.

Kudos to [YJ's contribution for this enhancement](https://www.notion.so/jymcheong/Prompt-IP-address-selection-during-backend-installation-b1d21b69cc3c4e3aad98802f0a71ba1d).

### Testing Connection between Windows endpoint -> Backend

Simply visit:

```
http://<YOUR_SFTP_RECEIVER_IP>:8888/
```

**If the page does not load, it means there's some connectivity issues to resolve.** Otherwise you will see Powershell commands for installing host agents, similar to the following (within the bigger red box,  **Copy everything.**):

![connectivityTest](connectivityTest.png)



### Use Powershell  to install host agents

**Paste into an admin powershell session to run those commands**. You should REBOOT the Windows endpoint before proceeding...

Go **your backend** (NOT the Windows endpoint), use `docker logs -f orientdb` & you should see something like this:

![Screenshot 2021-09-17 at 9.08.01 AM](orientdbLogging.png)

- This is the log console of OrientDB where all the events are stored
- It is useful for **single** endpoint exploration, for instance as a pen-tester, you can see in real-time what kind of process sequence as a result of executing your payload.
- As a student, you can see the repeated patterns whenever Windows reboot or you fired up typical apps like Browser, MS-Office & so on...

## Run a Quick Test!

https://github.com/jymcheong/OpenEDR/wiki/3.-Detection-&-False-Positives

## Other installation scenarios

https://github.com/jymcheong/OpenEDR/wiki/0.-Installation

# Shout-Outs

To Microsoft for Sysmon, Nxlog for Nxlog-CE, OrientDB & Wekan!
