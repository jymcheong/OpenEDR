# Upgrade for initial committed schema
# From server: docker exec -it orientdb console.sh, 
# Login root into DataFusion (password in /openedrserver/backend/exportScripts/.env)
# Run: load script /openedrserver/orientdb/upgrade.sql 

# allows continuation if error (eg. existing index)
SET ignoreErrors TRUE

##### upgrade from v1.21 to v1.22 ######
# Event ID 22
CREATE CLASS DnsQuery IF NOT EXISTS EXTENDS Sysmon

# Event ID 23
CREATE CLASS FileDelete IF NOT EXISTS EXTENDS Sysmon

# Edge class for linking ProcessCreate with new Sysmon Event types
CREATE CLASS ProcessGuid IF NOT EXISTS EXTENDS E

# For Lineage sequence whitelisting
CREATE INDEX ParentOfSequence.BaseLined ON ParentOfSequence (BaseLined) NOTUNIQUE 

##### upgrade from v1.20 to v1.21 ######
# this index will be used to find any unlinked non-ProcessCreate events to link to a given ProcessCreate
CREATE INDEX Sysmon.Hostname_Organisation_ProcessGuid_ToBeProcessed ON Sysmon (Hostname, Organisation, ProcessGuid, ToBeProcessed) NOTUNIQUE 

# this index will be used in AddEvent function to selectively link non-ProcessCreate events
CREATE INDEX Watchlist.Organisation_Hostname_ProcessGuid ON Watchlist (Organisation, Hostname, ProcessGuid) NOTUNIQUE

##### upgrade from v1.19 to v1.20 #####
Create Property Organisation.DetectOnlyMode IF NOT EXISTS BOOLEAN;



# import functions
DELETE FROM OFUNCTION;
import database /openedrserver/backend/exportScripts/functionsONLY.json -merge=true -migrateLinks=false -rebuildIndexes=false;