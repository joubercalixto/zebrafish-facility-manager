# Updating the System

## Introduction

Assuming there is a new version of the system available on GitHub and you want
to update your deployment, what has to happen?

## Assumptions

1. You followed the guidelines in the "Initial Deployment Guide" when setting up
   the system
1. You followed the guidelines in the "Per Facility Guide" when setting up
   facilities

These deployment will be in a place like:
/var/www/zsm/zebrafish-facility-manager

Every existing facility will have:

1. A sub-domain named in your SSL certificate
1. An enabled Apache vhost
1. A database
1. A service config file like /etc/systemd/system/zsm-eue.service so systemd can
   run it
1. A server configuration in .../zf-server/environments named something like
   eue.env

If these things are not the case, then I'll assume you know what you are doing,
and you have just made different deployment choices. You will still have to do
the same logical steps, but you will have to figure out how to do those in your
chosen environment.

## Deploy on top of the existing build (Less Sane Way)

You can do this for minor upgrades or major upgrades if you are confident. It is
a lot less work than migrating to a brand-new deployment.

Nevertheless, it is probably a good idea to have a guinea-pig facility like
test.zsm.com before you start. Also let you customers know that there will be an
outage.

### Pull the lastest version from Github

```bash
# check what version you are currently running with and make a note in case you
# need to unwind these changes (god forbid).
git log
## copy and save the commit from the first line of the log just in case.

# now pull the latest changes
git pull origin master
```

Rebuild the zf-server and zf-client system as per the Initial Deployment.

At this point you have overwritten the executable that all the current
zf-servers used to run. Yikes. Better stop all those services:

```bash
sudo systemctl stop zsm-eue
sudo systemctl stop zsm-otherfacility
sudo systemctl stop zsm-andanother
sudo systemctl stop zsm-etc
```

### Backup Databases

You should be able to run automysqlbackup and get all of them.

## for each facility...

### Update Facility Config files

If there are new configuration knobs available, go to zf-server/environments and
edit accordingly. Unfortunately there is no process for automatically doing
this. Even worse, there is no process for even knowing what knobs have been
added since any given point in time. Best I can offer is to look at the git
history of .../zf-server/environments/sample.env to see what's changes and when.

On the bright side, new config knobs are always added so that the default value
is the same as the way the system used to behave, so even if you don't update
the config files, everything should work.

### Migrate Database

If there have been changes to the database structure you need to update all the
existing databases accordingly. Once again there is no process to see for sure
what needs migrating.

I plan to implement a proper db migration script at some point but until then I
can only offer ad-hoc ideas.

I use a tool that compares the schema of a running db (like the one for zsm-eue)
with one from my development environment. The tool gives me a migration script
for free. But to be fair, this is bogus.

### Restart guinea pig server

Assuming you have a zsm-test or zsm-demo or zsm-guinea-pig server, start it up
and look at the logs.

redeploy the zf-client

http://ginea-pig.zsm.com

test stuff out

start the other servers

pray

## Create a new deployment (More Sane Way)

shut down servers with systemctl stop zsm-whatever

backup databases - just run automysqlbackup as it is run in the cron job

move current /var/www/zsm to something like /var/www/zsm.save

create a new directory under /var/www/zsm

clone the repo there

build like the initial system

for each existing facility (starting with your guinea pig facility)

copy the config file from the old to the new and tweak any new config knobs

do any required db migration

start the system

