[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/5YeH1RwzqXU/0.jpg)](https://www.youtube.com/watch?v=5YeH1RwzqXU)

# Getting Started
**Use a sudoer account for Ubuntu or macOS docker host**. For Windows, please refer to https://docs.docker.com/docker-for-windows/wsl/). 

* Tested backend installation ([see screencast](https://asciinema.org/a/AqZUQgakqMAErdWqoDc9b3dyS)) on Ubuntu 16-20 servers, with (at least) 1 vCPU, 3GB RAM & 50GB disk.
* Host agents installation tested on Win10/server 2012R2 to 2019 64bit
* Windows endpoints need to be able to reach the backend at TCP port 2222

## Steps
* With a sudoer account, run: `curl -L https://raw.githubusercontent.com/jymcheong/OpenEDR/master/install.sh |bash`
* Last powershell line (`$SFTPCONFURL=...`) from installcontainers.sh can be pasted to endpoint for host agent installations. **Please use admin powershell session**.

# Change Log
## v1.22
1. Modified upgrade SQL script to handle DnsQuery & FileEvent Sysmon types
2. Changed ODB functions to handle the 2 additional Sysmon types
3. Refactored AddEvent significantly to improve performance
4. Improved Sequence & Parent RID lookup to reduce database reads
5. Improved whitelisting of system upgrades with numbers in Image string
6. Upgraded OrientDB to 3.0.33
7. Filtered all sftp.log entries except messages that contain "refusing"

## v1.21
1. Added upgrade SQL script for schema & function changes
2. Significant load reduction by linking on ProcessCreates that are in watchlist
3. Frontend will link non-ProcessCreate events to a selected ProcessCreate card 
4. Modified export.sh to use `docker exec ...`
5. Created convenience OrientDB logon script `console.sh` under orientdb directory
6. Fixed OrientDB function FindLastForeground to prevent multiple edge linking

## v1.20
*Need to upgrade host agents & ODB schema-functions for this version*

1. Centralized management of DetectOnly configuration for specific host & organisation level
2. Reduced Network listening-port to process mapping event
3. Reduced ImageLoad linking to only Untrusted DLLs to ProcessCreate
4. Fixed missing/errorenous foreground-transitions links due to lack/stale explorer ProcessGuid
5. Fixed FindPreviousProcesses server-side function
6. Fixed Upload.exe for `session is not opened` exception that can occur laptops that sleep for long

## branch v1.19
1. Fixed handling of late ProcessCreate linking with spoofed PPID
2. Enabled detectOnly mode deployment
3. Refactored to use latest `install.ps1` Github copy
4. Added search of cached ProcessGuid for True-Parent process

## branch v1.18
### Enhancements
1. Supports ResponseRequest, which can be osquery or script requests
2. Refactored SFTP docker for both installation approaches. See #38
3. Improved Foreground Tracking
4. Minimized orphan ProcessCreate stalls due to fresh endpoint agent installations
5. 1-liner backend installation of docker containers
6. 1-liner endpoint installation powershell script

### Fixes
1. Fixed #45

## branch v1.17
1. Using pm2 to start OrientDB server
2. Updated writer ACL for OSQuery automatic class creation.
3. Updated AddEvent server function to ingest OSQuery results
4. Fixed Errors.TimeStamp property in ODB
5. Added ResponseRequest class

## branch v1.16 
1. Modified dependency install script to use NodeJS 12.X
2. Fixed hostdeploy.ps1

## branch v1.15 (Multi-Tenant Configuration Board)
1. Added Organisation Board with 2 lists: Profiling & Detection
2. Fixed issue #43 "pending..." ProcessType issue with ProcessCreate cards; 
3. Added Organisation Card movement handler, see #42
4. Fixed DFPM.xml schedule task configuration within Setup.exe

## branch v1.14 (Multi-Tenant Profiling Backend)
1. Timestamp & organisation strings added OrientDB server-console output
2. Backend able to run both startDetection.js & startProfiling.js together & schema ready to configure specific organisations for profiling/detection
3. Fixed UserActionTracking server function, missing edge RID under certain circumstances
4. Fixed frontend.js "undefined length" exception
5. Added DFPM scheduled task to workaround Issue #40

## branch v1.13
1. 20-Jan-2020: Added WhitelistDriverLoad OrientDB server function
2. 21-Jan-2020: Added WhitelistDriverLoad to frontend.js
3. New entry to CustomField of Case Template Wekan board

## 16 Jan 2020 - branch v1.12
1. Fixed ConnectParentProcess server function
2. Fixed UserActionTracking server function
3. Reduced Nxlog log rotation threshold to 19K to cater to WAN transfers
4. Increase Foreground Transition event write to 12 seconds to cater to WAN transfers
5. Added RuleGroup to smconfig.xml to filter ZeroTier events
6. Turned on Powershell Script Block Logging at post agent installation script (postInstall.ps1).
7. Revert Process Sequence tracking to non-organisation specific (ie. global to all organisation in multi-tenancy deployment)

## 3 Jan 2020 - branch v1.11
1. Filtered ProcessAccess events through smconfig.xml
2. Filtered ZeroTier NetworkConnect events through smconfig.xml

## 31 Dec 2019 - branch v1.10
1. Added rotateLog.sh to rotate sftp.log
2. Downloading NXLOG-CE & Sysmon instead of embedding into agent Setup.EXE

## 23 Dec 2019 - branch v1.9
1. Modified SFTP container to use Port 2222 instead of mapping
2. Docker command starts one-way SFTP container with host network instead of mapping ports. See https://github.com/jymcheong/DataFusion/issues/11

## 19 Dec 2019 - branch v1.8
1. Fixed Upload.exe missing file loop
2. Modified insertEvent.js to delay folder delete 

## 12 Dec 2019 - branch v1.7
1. Modified 2_ODB.sh to use relative path
2. Modified 3_Backend.sh to use relative path
3. Added start.sh

## 3 Dec 2019 - branch v1.6
1. Fixed [Issue #8](https://github.com/jymcheong/DataFusion/issues/8)
2. Restarting frontend with pm2 at the end of `install/4_Frontend.sh`

## 2 Dec 2019 - branch v1.5
1. Fixed index duplication exception when same Hostname endpoint from different organisation emits CommandLine
2. Removed `process.stdin.resume()` that blocked script exit with terminal Ctl + C

## 21 Nov 2019 - branch v1.4
1. Removed top-most windows check to simplify foreground check function
2. Lengthen delay to write foreground transition event to file
3. Fixed multiple emission of foreground transition events due to key presses

## 20 Nov 2019 - branch v1.3
1. Worked around "free(): invalid pointer" during docker build of sftp container
2. Fixed missing unmount command in stopSFTP.sh
3. Modified installation step to use latest docker-ce & docker-compose

## 19 Nov 2019 - branch v1.2
1. Modified UAT.exe to write foreground transition event (EventID 2) to logs folder directly to improve the ProcessType assignment speed.

## 14 Nov 2019 - branch v1.1
1. Improved UAT.exe foreground transition checks using Process.MainWindowHandle
2. Improved server side UserActionTracking function to use foreground transition to set ProcessType

## 12 Nov 2019 - branch v1.0
1. Used updateOne mongoAPI calls throughout wekanBoards.js to avoid duplicate _id problems
2. Always addCase to avoid the situation of Case created in ODB but frontend.js not started or dead.

# Features as of 7 Nov 2019

## Windows Agents
### Sysmon
The free system "flight-recorder" for Windows. The other agents complement what Sysmon cannot do.

### DataFusion Windows Service
DataFuse.exe:
* maps & records listening (TCP/UDP IPv4) ports to processes
* tracks & records network address changes

### User Action Tracking
UAT.exe:
* tracks mouse & keyboard (aka input) activities
* associates anonymized input activities to foreground process
* tracks USB & network drive mounting

### Process Monitoring
Dfpm.exe:
* alerts foreign EXE/DLL/SYS
* kills foreign EXE/DLL
* alerts parent process spoofing

"Foreign" means binaries that are not owned by trusted user/group (ie. SYSTEM, TrustedInstaller & Adminstrators).

### SFTP Client
Upload.exe:
* uploads log files to 1-way SFTP service

## SFTP 1-way Container
* Receives event log-files from endpoints' Upload.exe
* Logs lateral attack attempts from endpoint(s) to SFTP service (eg. SSH brute-force logins)

## Backend 
### insertEvent.js
Reads from 1-way SFTP service (~/sftpmount/readwrite) folder & writes into OrientDB.

### startProfiling.js
Builds CommandLine similiar string groups for subsequent detection mode.

### startDetection.js
Detects various 3 types of anomalies:
1. Untrusted EXE/DLL/SYS
2. Unusual Process Sequence
3. Unusual CommandLine String

Upon detection of any of the above anomaly; further checks:
1. Privilege Level for Privilege Escalation
2. Before or After Explorer for Persistence
3. Any outbound NetworkConnect for External C2
4. Any laterial NetworkConnect for Internal C2 or Lateral Movement
5. Any Parent ID spoofing for unusual Code-Execution

## Frontend
Frontend consists collectively of three board-interfaces:

### Dashboard
Presents the dashboard for monitoring ops, usually flashed on the big screen.

### Triage-board
For analyst to prioritize which case to take first.

### Investigation-board
For analyst to drill into the case to investigate what led to the alerts.
