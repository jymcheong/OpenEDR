$addresses = (Get-NetIPAddress -AddressFamily IPv4).IPAddress
$i = 1
Write-Host 'Available IPv4 addresses:'
$addresses |  ForEach-Object {
    '{0}: {1}' -f $i++, $_
}

$choice = Read-Host -Prompt "Select address for SFTP event receiver (press 1 to $($addresses.Length))"
$choice = $choice - 1
$SFTP_IP = $addresses[$choice]
$choice = Read-Host -Prompt "Select address for frontend web access (press 1 to $($addresses.Length))"
$choice = $choice - 1
$FRONTEND_IP = $addresses[$choice]

# Caddy container that host sftpconf.zip will use this port
$SFTPCONF_PORT=8888

Add-Content -Path .\.env -Value "USERID=1000"
Add-Content -Path .\.env -Value "FRONTEND_IP=$FRONTEND_IP"
Add-Content -Path .\.env -Value "FRONTEND_PORT=8080"
Add-Content -Path .\.env -Value "SFTP_HOST=$SFTP_IP"
Add-Content -Path .\.env -Value "SFTP_PORT=2222"
Add-Content -Path .\.env -Value "SFTPCONF_PORT=$SFTPCONF_PORT"
Add-Content -Path .\.env -Value "C2_PATH=./backend/sftp/response/"
Add-Content -Path .\.env -Value "TOBEINSERTED_PATH=./backend/sftp/tobeinserted"
Add-Content -Path .\.env -Value "UPLOAD_PATH=./backend/sftp/uploads"
Add-Content -Path .\.env -Value "SAMPLES_ARCHIVE_PATH=./backend/sftp/samplearchive"

Add-Content -Path ".\backend\sftp\IPaddresses" -Value $SFTP_IP

docker-compose up -d

# $MSG="`$SFTPCONFURL='http://$($SFTP_IP):$($SFTPCONF_PORT)/sftpconf.zip'; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'))"
$MSG="start-process -verb runas -Filepath powershell -ArgumentList `"-ExecutionPolicy Bypass`", '-Command `"`$SFTPCONFURL=''http://$SFTP_IP`:$SFTPCONF_PORT/sftpconf.zip'';[scriptblock]::Create((New-Object System.Net.WebClient).DownloadString(''https://raw.githubusercontent.com/jymcheong/openedrClient/master/install.ps1'')).Invoke();pause;`"'"
Add-Content -Path ".\clientconf\index.html" -Value '# Copy the following & run from a powershell session to install host agents:<br>'
Add-Content -Path ".\clientconf\index.html" -Value $MSG

Write-Host "Please visit http://$($SFTP_IP):$($SFTPCONF_PORT)/ for Windows agents installation instructions."