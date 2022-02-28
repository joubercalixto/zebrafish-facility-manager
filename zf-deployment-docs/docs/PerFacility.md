# Per Facility Configuration

Setting up a facility really means two things:

1. configuring and starting a facility specific server
1. adding an apache virtual host for the facility

When you go through this process for the first time, you might want to set up
a "demo" facility as well.

Assumptions:

1. you have already created a full deployment as described in the
   [Initial Deployment Guide](InitialDeployment.md).
2. you have set up a domain called _zsm.com_
3. you are setting up a facility for _Example University of Examples_ called
   "eue" for short

## Sub-domain setup

You need to create a sub-domain for your facilities. In our case it would be
_eue.zsm.com_. The main thing you need to do is create DNS records that points
from your sub-domain to your host's IP address. After you add the sub-domain it
usually takes an hour or so for it to propagate around the world.

If you do not know how to do this, it is probably a capability available at the
service you used to buy your domain. Alternately your web hosting service
probably has a DNS you can use to set up your DNS records.

#### Am I ready to move on?

If you can successfully ping your new subdomain _eue.zsm.com_, you are ready. If
the ping fails, it may simply be that the new DNS record you configured has not
yet propagated.

In the meantime, you can go ahead with much of the configuration that follows
but you cannot do your Apache configuration until your DNS configuration is
working.

## Host Setup

### Set up a database for the facility data

We need to set up a database and a database user for the Example University of
Examples. We need to choose three things. Please do not skimp on the password -
generate a good one. For example:

1. database: _zf_eue_
2. db user: _zf_eue_
3. db password: _OmduqvHzVjbw45Ts8x3wfW_

It does not matter what tool you choose to create the database, but if you want
help, there is a script located in the repo for creating a database user and a
database using the three parameters given above.  
It is located at path_to_your_repo/zf-server/mysql scripts/create zsm db.sql.

You can edit the script to place the values for three variable in it, log in to
mariadb as admin and run the script.

You now have a database. There are no tables in it, but they will be created
automatically when the zf_server runs for the first time.

#### Am I ready to move on?

On the command line,

```bash
mariadb -u zf_eue -p
password:
```

Enter your very good password at the prompt. If login succeeds, you are good to
go.

### zf_server configuration file

You need to create a configuration file for each facility. In keeping with the
example, we will create a configuration file called "eue.env".

```bash 
# copy the sample configuration file
cp environments/sample.env environments/eue.env
```

Edit your configuration files. In addition to following the instructions in the
file, you will need to have at hand

1. the database, database user's name, and database user's password you set when
   creating the database for this facility
2. the mail configuration the system will use to send notifications to users.
3. the site that hosts the user documentation

#### Am I ready to move on?

You can (temporarily) run a facility specific server now from the command
line.  
The server rejects bad or missing configuration with useful error messages.

```bash
# on the command line, navigate to the *live* zf-server directory
cd /var/www/zsm/zebrafish-facility-manager/zf-server

# tell the server where to find the eue config file (eue.env)
export FACILITY=eue

# run the server
npm run start:dev
```

If the configuration is good, you will get a bunch of Info level logs about
routes that have been set up. The first time this program runs it will also
create an admin user for you. You will see a log for that too.

If not, you need to address the errors.

You now have to stop the server (^C) as we need to set it up as a service.

### Run the zf-server as a service

You want the zf-server to be persistent. Should it fail, it should be restarted
automatically. Should the computer restart, the service should be restarted
automatically. So, running the server from the command line is inappropriate.

Instead, we suggest running it as a service using systemd. Here is a suggested
procedure:

The following is an example of a systemd service configuration file.

Note that only the lines marked with *** differ between the servers for each
facility. The other lines repeat in every service config file.

```shell
[Unit]
# *** The next line should be different for each facility
Description=EUE Zebrafish Server

# tell systemd to wait for mysql/mariadb before our service is started
After=network.target mysql.service

[Service]

# assuming the deployment is in /var/www/zsm, then this is where the executable lies
ExecStart=/usr/bin/node /var/www/zsm/zebrafish-facility-manager/zf-server/dist/main.js

Restart=always

# choose an appropriate user and group to run the services.
User=zsm
Group=zsm

Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production

# tell the service where to find it's configuration file.
# *** The next line will be different for each facility.
Environment=FACILITY=eue
# eue's config file will be in /var/www/zsm/zebrafish-facility-manager/zf-server/environments/eue.env

# Note the absence of /dist at the end of this path.
WorkingDirectory=/var/www/zsm/zebrafish-facility-manager/zf-server

[Install]
WantedBy=multi-user.target
```

On the command line:

```shell
# create service configuration file in the directory /etc/systemd/system
# name the file something like zsm-eue.service (If all your services start with
# a shared prefix like zsm, they will be easier to find, edit and extend.)
# Use whatever editor you want - the example uses vi because I am old.
sudo vi /etc/systemd/system/zsm-eue.service

# copy the file content from above (or from an existing zsm-xxx.service file),
# paste it in the editor and edit as appropriate. Save the file

# enable the service
sudo systemctl enable zsm-eue

# start the service
sudo systemctl start zsm-eue

# check that it is running properly
sudo journalctl -u zsm-eue
```

#### Am I ready to move on?

If, when you did your journalctl, the log messages ended with "Nest application
successfully started"
your server is up and will stay that way indefinitely.

### Virtual Host setup

For each facility supported by your deployment you need to set up a Virtual
Host. This is how we suggest you do
the [Apache Virtual Host Configuration](Apache.md).
