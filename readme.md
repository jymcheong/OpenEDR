# Demo
Click thumbnail below to watch:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/5YeH1RwzqXU/0.jpg)](https://www.youtube.com/watch?v=5YeH1RwzqXU)

# Getting Started

**Please use official docker installers for respective OSes stated in the diagram below.** [Installation script](https://github.com/jymcheong/OpenEDR#installation-steps) will prompt for selection of 2 IP addresses for SFTP & FRONTEND access.

![directInstallation](directInstallation.png)

When running OpenEDR backend **within a separate Linux VM to run docker, please ensure the Win 10 VM is using a network that can reach the backend VM.**

## System Requirements

The host running Linux & MacOS needs a sudoer account, or Windows 10 (Home or beyond), with the following specs: 

* i5 or better (1 v)CPU, min. 8GB RAM & 100GB SSD disk for host
* VM needs at least 1 vCPU, 4GB RAM & 10GB storage
* Host agents tested on Win10 & Server 2012R2 to 2019 64bit (we monitor these 'endpoints')
* Endpoints needs to access backend TCP port 2222 & 8888 (check for any firewall in-between)

## Installation Steps
**Use a shell on Linux (tested working on Ubuntu-SERVER 16-20) & MacOS**, run the following (**DO NOT preceed** with `sudo`):

`curl -L https://github.com/jymcheong/OpenEDR/tarball/master | tar xz && mv jym* openEDR && cd openEDR && ./install.sh`

*For **Windows 10 with [WSL2 (Home) / HyperV (Pro & beyond) & Docker installed](https://docs.docker.com/desktop/windows/wsl/)***, start a Powershell session, copy & run the following:

`$tmp = New-TemporaryFile | Rename-Item -NewName { $_ -replace 'tmp$', 'zip' } -PassThru; Invoke-WebRequest -OutFile $tmp https://github.com/jymcheong/OpenEDR/zipball/master; $tmp | Expand-Archive -DestinationPath .\ ; Move-Item jym* openedr ; $tmp | Remove-Item; cd openedr; get-content -raw .\install.ps1 | iex` 

The respective installation script will setup an .env file necessary for OpenEDR backend containers to run.

### Select IP Addresses for SFTP Receiver & Monitoring Frontends

The installation script *will prompt you to select addresses* for the two stated purposes: (1) receiving events & (2) access web interfaces. 

- Windows endpoints host-agents upload events to the SFTP Receiver via that selected SFTP IP address
- FRONTEND IP address to access OrientDB (via port 2480) & Alert monitoring web interface (via port 8080)
- Select the same address for SFTP & FRONTEND for NON-production environment (eg. evaluation & testing)

Kudos to [YJ's contribution for this enhancement](https://www.notion.so/jymcheong/Prompt-IP-address-selection-during-backend-installation-b1d21b69cc3c4e3aad98802f0a71ba1d).

### Testing Connection between Windows Endpoint -> Backend

Simply visit port 8888 for the SFTP IP address (configuration & installation command hosting):

```
http://<YOUR_SFTP_RECEIVER_IP>:8888/
```

**If the page does not load, it means there's some connectivity issues to resolve.** Otherwise you will see Powershell commands for installing host agents, similar to the following (within the bigger red box,  **Copy everything.**):

![connectivityTest](connectivityTest.png)

### Installing host agents on Windows Endpoints

**Paste into an admin powershell session to run those commands**. **You should REBOOT the Windows endpoint before proceeding...**

Go **your backend** (NOT the Windows endpoint), use `docker logs -f orientdb` & you should see something like this:

![Screenshot 2021-09-17 at 9.08.01 AM](orientdbLogging.png)

- This is the log console of OrientDB where all the events are stored
- It is useful for **single** endpoint exploration, for instance as a pen-tester, you can see in real-time what kind of process sequences related to your payload or technique.
- As a student, you can see the repeated patterns whenever Windows reboot or you fired up typical apps like Browser, MS-Office & so on...

## Run a Quick Test!

https://github.com/jymcheong/OpenEDR/wiki/3.-Detection-&-False-Positives

## Other installation scenarios

https://github.com/jymcheong/OpenEDR/wiki/0.-Installation

# Shout-Outs

To Microsoft for Sysmon, Nxlog for Nxlog-CE, OrientDB & Wekan!
