# Zebrafish Stock Manager - Initial Deployment

This guide is for the initial deployment of a system. If you are *updating a
running deployment*, please go [here](Update.md)

## Firewall

Set up your firewall to allow 'SSH' and 'WWW Full' traffic.

## Users and Groups

Create an account called dbbackups. It will have minimal privileges.

```bash
adduser dbbackups
# then follow the prompts
```

Create a user and a group called zsm which will be used to run a separate
zf-server for each customer. Also, zsm staff will use this account to log in and
work on this deployment. It will have sudo privileges, so protect it well - ssh
login only.

```bash
adduser zsm
# then follow the prompts
usermod -G www-data -g sudo,dbbackups zsm
```

If you want to create accounts for each developer who needs to work on the
system, go ahead and do that. They should be set up just like the zsm user.

For all these users, set up their ~/.ssh/authorized_keys with the public keys of
anyone who needs to log in as that user with ssh.

## Domain name

You will need a domain name for the deployment as a whole. For the purpose of
illustration, this guide will assume you have purchased _zsm.com_ and that you
set up DNS records to point at your host's IP address.

It is a good idea to set up
_test.zsm.com_, and _demo.zsm.com_ as an initial subdomains. Later when you are
configuring a system for a particular facility, you will be adding one subdomain
per facility. If you happen to know that you are going set up managers for
facilities _eue_ and _acdc_, you could create those subdomains too. But you can
always do that later. The DNS entries for each subdomain should point to the ip
address of your host.

You can get a domain name and set up your DNS at any number of providers like
[namesilo.com](https://namesilo.com).

## Mail service

The system sends mail to users. It uses [nodemailer](https://nodemailer.com)
under the covers to do that. You are still responsible for ensuring that you
have a mail host you can use to send mail.

You could run your own mail server. Amazon SES is another option that I have
used successfully. I found that using a gmail account is quick to set up, but it
is not effective in the long run because Google tries to block automated
sending.

You want to make sure that your mail host supports STARTTLS when receiving
messages from the system. You also want to make sure that the mail host sends
messages securely and properly self-identifies (using DKIM, for example), so
that receiving mail services will not discard messages from the system. The
details are left to you.

You will need to have the following configuration information for your mail
host:

- mail host name
- mail host userid
- mail host password (make your password extremely secure, please)
- "from" email address

## Setting up the server computer environment

### Host setup

Experienced administrators can zip through this guide quickly, but it is a mini
site-admin guide for the benefit of less experienced people. In truth, it's just
a memory aide for me.

**For this guide, we will deploy on a Debian 11(+) computer**.

The system can be deployed in other environments in which case, you will need to
understand how to perform equivalent operations in that environment.

On Debian, make sure everything is up-to-date:

```bash
sudo apt-get update
sudo apt-get upgrade
```

### Node and NPM

We need to use node and the node package manager.

```bash
sudo apt install nodejs npm
```

I noticed that the default node and npm on a fresh Debian 10 machine were a bit
behind the times, so I had to upgrade them.

### MariaDB

Please refer to MariaDB resources to determine how to install MariaDB in your
server environment.

Here is a friendly article
for [how to install MariaDB securely on Debian](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-debian-10)
. Later, when you go to create individual databases for each zebrafish facility,
the guide will assume you have followed the good, secure procedure described
there. You will have created an administrative user called admin, which you will
use to create databases for each facility. You must remember the password for
that administrative user.

### Database Backup

You need to back up your databases regularly and copy those backups to a host
that is remote from the host that is hosting your database. There are a zillion
ways to do this. This is what I did.

#### Linux user

You already created Linux user "dbbackups" to perform your backups.  
Create a ssh key for this user (to allow rsync of backups to another server
using ssh).

#### Remote Host

On some "backup" host that is geographically separate from your database host,
create a user and include the public key for "dbbackups" in that user's
.ssh/authorized_keys file. This enables rsync from the database host to the
backup host.

#### Database user

Create a database user with sufficient capabilities to dump all your databases
but not to write to them.

```sql
create user 'dbbackups'@'localhost' identified by 'good-password-here';
GRANT SELECT, RELOAD, SHOW DATABASES, LOCK TABLES, EVENT ON *.* TO `dbbackups`@`localhost`;
```

#### Automysqlbackup

I chose to use automysqlbackup. By default, it gives me exactly what I need.
Daily backups rotated every week, weekly backups rotated every 5 weeks and
monthly backups that are never rotated.

```bash
sudo apt-get install automysqlbackup
```

Edit the automysqlbackup config file in /etc/default/automysqlbackup to

1. tell it about the database user credentials
2. change the backup directory (default = /var/lib/automysql) to
   /home/dbbackups/backup
3. edit the configurable command that runs after the backup is complete. The
   command will simply rsync the backup files to the remote host. The command
   will look something like this with the obvious substitutions:

```bash
'rsync -a /your/chosen/local/backup/dir/ remotebackupuser@remote.backup.host:/your/chosen/remote/backup/dir'
```

ToDo the --delete option to rsync does not seem to work from within the cron
job. It can be run manually once in a while which will clean up the chaff on the
backup server.

#### Schedule Backup

I believe this should be done with a timer and a service in systemd, but I
failed, so I used a good old cron job.

1. edit /etc/cron.allow to include the dbbackups user
2. (Debian specific) create a cron file /etc/cron.d/automysqlbackup which will
   run as user dbbackups. Mine looks like this:
   ```
   SHELL=/bin/sh
   PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
   17 22 * * * dbbackups /usr/sbin/automysqlbackup
   ```

An alternate solution to all of this is to have automysqlbackup run remotely,
but that has other attendant problems.

### Web Server

The system uses a web server to:

1. serve the zf-client to the end user
1. serve zebrafish facility-specific configuration to the zf-client
1. handle HTTPS traffic between each zf-client and the correct facility-specific
   zf-server

Apache2 is usually pre-installed on Linux servers, but just in case, here is
friendly article
on [how to install Apache on Debian](https://www.digitalocean.com/community/tutorials/how-to-install-the-apache-web-server-on-debian-10)

Set up a virtual host for your domain (in this case zsm.com). You can put
anything you want in the root directory, it is a base website you can use to
welcome folks. You might want to put the user documentation there or a demo
system or whatever you like.

You will need to set up a separate virtual host for each zebrafish facility the
system manages. It is a good idea to set up an example one now. The process of
setting up a virtual host for a facility is covered [here](Apache.md).

Make sure that the rewrite, proxy and proxy_http modules are enabled for Apache.

## zf-server and zf-client deployment

There a many ways to do the following this is just how I do it. It is done with
an eye to making updates easier later on.

```shell
# For the initial deployment, create a working directory like /var/www/zsm
# where you plan to clone and build the code.
# You probably wont have write privilege so sudo
cd /var/www
sudo mkdir zsm

#change the permissions to you work here
sudo chown -your-username- zsm
sudo chgrp -your-usergroup- zsm
cd zsm
```

### Clone the GitHub repository

This is where you download all zf-client and zf-server code.

```bash
# For example:
cd /var/www/zsm/
git clone https://github.com/tmoens/zebrafish-facility-manager
```

### zf-server build

```bash
# The server uses the NestJS framework. The NestJS cli is required to build the server.
npm install -g @nestjs/cli

# navigate to the zf-server sub-directory
cd /var/www/zsm/live/zebrafish-facility-manager/zf-server

# Download npm packages
npm install

# Build the zf-server
npm run build
```

This generates a "dist" directory containing the main server executable main.js.

### zf-client build

```bash
# The client uses the Angular Framework, install the Angular cli
npm install -g @angular/cli

# navigate to the the zf-client sub-directory
cd /var/www/zsm/live/zebrafish-facility-manager/zf-client

# Download npm packages
npm install

# Build the zf-client
ng build --configuration=production
```

The result of this operation will be a directory called /dist/zf-client. We
suggest you make a copy of this directory for deployment. That way you are able
to tweak and rebuild the zf-client without affecting the users.

```shell
# go to the "distribution" client directory
cd /var/www/zsm/zebrafish-facility-manager/zf-client/dist

# copy it to a well known place
sudo cp -R zf-client /var/www/
```

### User Documentation Build

You probably don't want to do this for every deployment it generates a static
site that can be deployed in just one place. This section is just a memory aid
for me.

The user documentation describes best practices for using the zebrafish facility
management application. It is written in MarkDown and built into a static HTML
website using [MkDocs](https://mkdocs.org). MkDocs is written in Python, so you
will need to install Python3 (and pip) inorder to build the documentation. The
installation process is documented [here](https://mkdocs.org/#installation);

I also use the mkdocs-material theme, so you will have to install that too.
See [here](https://squidfunk.github.io/mkdocs-material/getting-started/#with-pip)

Once that's done, you build the documentation website:

```shell
# navigate to the root of the repository
cd /var/www/zsm/live/zebrafish-facility-manager/zf-usage-docs
mkdocs build
```

This generates (or overwrites) the /site subdirectory in zf-usage-docs. The
/site directory is straight HTML, so I won't go into detail on how to deploy it.
In short, you create a site in apache and point the root of that site at
/var/www/zsm/live/zebrafish-facility-manager/zf-usage-docs.

Alternately you copy the "site" directory to some other place and point you
apache vhost at that directory. If you take that approach, remember to do the
copy every time you build the docs.

There is nothing facility specific in the documentation so all servers can use
the same doc site.

## Facility Configuration

You are finally ready to configure the system to manage a zebrafish facility.
Here is the [Facility Configuration Guide](PerFacility.md).

## License

## Thank you

- [Nest](https://github.com/nestjs/nest) provides the zf-server application
  framework.
- [typeorm](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by default
