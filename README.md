# Zebrafish Facility Manager

## Description

A software package for maintaining information about a zebrafish facility used
in genetics labs.

It has two parts. The zf_client part runs in any web browser and presents a user
interface for managing the stocks in a facility. The zf_client uses Angular.

The zf_server part runs on a computer with a database and is responsible for
storing the data for a particular facility. The zf_server is a Node.js
application written using the NestJS framework.

The two communicate via an API.

## Main Features

The main purpose of the software is to track zebrafish stocks including

- their lineage
- their genetic markers (mutations and transgenes)
- the lineage of their markers
- which tank(s) the stock occupies
- various notes and data associated with the stock (age, researchers, research
  notes...)
- simple and seamless creation of new stocks from crosses
- it provides excellent search, navigation and editing capabilities to allow
  users to focus on their work.

An ancillary aspect of the system is that it tracks the genetic markers used in
a facility so that absolute consistency is maintained throughout the system.

It also provides reports to support things like auditing a zebrafish facility.

## License

Zebrafish Facility Manager is [MIT licensed](LICENSE).

## Thank you

- [Nest](https://github.com/nestjs/nest) provides the zf_server application
  framework.
- [TypeORM](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by defaul
- [MkDocs](https://mkdocs.org)
