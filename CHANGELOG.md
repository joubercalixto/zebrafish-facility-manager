# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 4.0.0 (2023-02-09)


### ⚠ BREAKING CHANGES

* outbound email uses a more robust mail service with TLS now.

### Features

* add a feature to import new db from excel ([9eacd48](https://github.com/joubercalixto/zebrafish-facility-manager/commit/9eacd4852f829de6fc6ac6d1abf0efa8eb518b6a))
* **audit:** add Facility Audit feature ([1d20e2b](https://github.com/joubercalixto/zebrafish-facility-manager/commit/1d20e2bc46a3a4d24c543005c3439b203d00c133))
* capability to configure required password complexity ([80bd9fa](https://github.com/joubercalixto/zebrafish-facility-manager/commit/80bd9fab966f5f2e586cd0120b9171e8011f6049))
* **config:** Remove client configuration files, all configuration loaded by server ([3fa438d](https://github.com/joubercalixto/zebrafish-facility-manager/commit/3fa438dd53ed01fd096ed3e7846a4c57a12845db))
* **doc:** Add user documentation ([059d5a7](https://github.com/joubercalixto/zebrafish-facility-manager/commit/059d5a713274b30967fe10a52d4abe96532579a7))
* **export:** add feature for exporting whole stockbook ([1ed995d](https://github.com/joubercalixto/zebrafish-facility-manager/commit/1ed995d442af40214600923c84f3fe8ea3e53103))
* **import:** Configure visibility of new Importer feature ([59b6682](https://github.com/joubercalixto/zebrafish-facility-manager/commit/59b66820e63363a5271e205485c7edfcf1b96ae1))
* outbound email uses a more robust mail service with TLS now. ([a3a9e95](https://github.com/joubercalixto/zebrafish-facility-manager/commit/a3a9e950366cd2ea537ce35c14da63c6cc7225f7))


### Bug Fixes

* (server side) show allele summary when creating stock or cross label ([00a889b](https://github.com/joubercalixto/zebrafish-facility-manager/commit/00a889b183092771c3ddd942a4efd6b9bc36d621))
* alignment of QR Code for vertical orientation of labels ([b9ab471](https://github.com/joubercalixto/zebrafish-facility-manager/commit/b9ab47121bc34c5a2368f790227f8f63be36345f))
* bug in lower limit of fish in a tank. ([0e83bd4](https://github.com/joubercalixto/zebrafish-facility-manager/commit/0e83bd4087494fb1de0549141e466afe47c21926))
* bug in search by age (moment import) also add tank importing ([680d3c7](https://github.com/joubercalixto/zebrafish-facility-manager/commit/680d3c743f7671b2cea2e8f7c20ab57c77422f85))
* bug in stock filter if both researcher filter and pi filter were set. ([fe534fb](https://github.com/joubercalixto/zebrafish-facility-manager/commit/fe534fbaeb739ac76af9558708e215994a2d9afa))
* change default zfin-data-api url to https ([31b952a](https://github.com/joubercalixto/zebrafish-facility-manager/commit/31b952aa07571710eaac8eabad5ddf265bad09aa))
* **config:** remove duplicate config option ([b62031b](https://github.com/joubercalixto/zebrafish-facility-manager/commit/b62031b1a02dea5eeb38db90026e44d8fa13250b))
* convert use of substr to slice ([f9a5ebc](https://github.com/joubercalixto/zebrafish-facility-manager/commit/f9a5ebc2e2ffb255c6ac497c0005779de8813b60))
* duplicate call to zfin server from mutation editor ([c69d8cd](https://github.com/joubercalixto/zebrafish-facility-manager/commit/c69d8cd1e5c7f113e9ff2bb284fa00ffa11f5573))
* example configuration files ([5482d4e](https://github.com/joubercalixto/zebrafish-facility-manager/commit/5482d4e026a96b08b30619ae13e3cca7f293ea29))
* **GUI:** reseacher seelection not properly updating researche on cross-label ([e28b4d4](https://github.com/joubercalixto/zebrafish-facility-manager/commit/e28b4d441d6305325a4d2366387e0423b2aa1e19))
* **GUI:** Stock filter for any researcher chaned to ANY not NONE. PI too ([a3d714f](https://github.com/joubercalixto/zebrafish-facility-manager/commit/a3d714ff548846291903e6384bc938d5f2df1fbc))
* **importer:** include ability to import swimmers for stock ([87dc783](https://github.com/joubercalixto/zebrafish-facility-manager/commit/87dc783cff7cc29268557f5bc34eac3a0cbb1fc2))
* **import:** fixes to the new importer tool ([c6e3b1a](https://github.com/joubercalixto/zebrafish-facility-manager/commit/c6e3b1a10ae212aa76b40d4b4309a9b401f3e11e))
* make the description into a text area in the stock viewer. ([aa84711](https://github.com/joubercalixto/zebrafish-facility-manager/commit/aa84711f342c59f842512873937260e5a95c0479))
* make the Facility Audit tool accessible to users, not just admins ([4054e8c](https://github.com/joubercalixto/zebrafish-facility-manager/commit/4054e8c7a8b35bfbad48c31451bd81e0755f6bf7))
* mutation editor for owned mutations not allowing Save operation ([1d7eb5a](https://github.com/joubercalixto/zebrafish-facility-manager/commit/1d7eb5a5629920c6557381948bf6d806d6dcc937))
* set default values for new user so that form fills without error messages. ([82daa73](https://github.com/joubercalixto/zebrafish-facility-manager/commit/82daa737ebaa6c782cdc12ad5a647823b34eec66))
* show allele summary when creating stock or cross label ([272c3f7](https://github.com/joubercalixto/zebrafish-facility-manager/commit/272c3f71b141037bc4cb960a7fdfb249001edf75))
* small bug in label printing tool ([3c44462](https://github.com/joubercalixto/zebrafish-facility-manager/commit/3c444624a327ed706694cdfa231282c010cc6021))
* some queries were throwing exceptions for empty results ([78e7787](https://github.com/joubercalixto/zebrafish-facility-manager/commit/78e7787bf03fede5e1cf1e9755906858d621bdd9))
* **sql:** code for dropping a database deals with new tables. ([2889ddf](https://github.com/joubercalixto/zebrafish-facility-manager/commit/2889ddfdb932c99309d08d25b6a0db525eeaa3b3))
* stock description is no longer mandatory. If not present, use allele summary for stock title ([2076c7c](https://github.com/joubercalixto/zebrafish-facility-manager/commit/2076c7cffeb2529140b35066052dc4ad5cd446c9))
* stock not showing up in stock list if it has no description ([a59ed62](https://github.com/joubercalixto/zebrafish-facility-manager/commit/a59ed623e338e3d3688eead4b55ab4f1b6fa9f30))
* **tank:** allow user to use case insensitive tank names. ([3cce110](https://github.com/joubercalixto/zebrafish-facility-manager/commit/3cce11079665f333cc443e423b946385f037b750))
* **tank:** never commit before testing ([57b1661](https://github.com/joubercalixto/zebrafish-facility-manager/commit/57b16618d624ec9079752b4e472da285bc4dd74b))
* **test:** bring automated tests for server back into working condition. ([a649202](https://github.com/joubercalixto/zebrafish-facility-manager/commit/a6492023fe4ea5a3857979cdef6aa9e251c0dde2))
* **tg:** Reorder allele/descriptor in transgene report. ([abbee5a](https://github.com/joubercalixto/zebrafish-facility-manager/commit/abbee5afa453b6a42e07d3f40108449f2d7feaf3))
* update to package.json ([aced118](https://github.com/joubercalixto/zebrafish-facility-manager/commit/aced118cd3ee6c591992665f8eee8d33e2c7b1fb))
* various persistent presentation issues ([2ed6c09](https://github.com/joubercalixto/zebrafish-facility-manager/commit/2ed6c09bfa9bd4e4b52eb6284611961fd39c435d))

## [3.0.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.6.0...v3.0.0) (2021-09-28)


### ⚠ BREAKING CHANGES

* outbound email uses a more robust mail service with TLS now.

### Features

* outbound email uses a more robust mail service with TLS now. ([a3a9e95](https://github.com/tmoens/zebrafish-facility-manager/commit/a3a9e950366cd2ea537ce35c14da63c6cc7225f7))


### Bug Fixes

* some queries were throwing exceptions for empty results ([78e7787](https://github.com/tmoens/zebrafish-facility-manager/commit/78e7787bf03fede5e1cf1e9755906858d621bdd9))

## [2.6.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.5.0...v2.6.0) (2021-09-26)


### Features

* add a feature to import new db from excel ([9eacd48](https://github.com/tmoens/zebrafish-facility-manager/commit/9eacd4852f829de6fc6ac6d1abf0efa8eb518b6a))
* capability to configure required password complexity ([80bd9fa](https://github.com/tmoens/zebrafish-facility-manager/commit/80bd9fab966f5f2e586cd0120b9171e8011f6049))


### Bug Fixes

* (server side) show allele summary when creating stock or cross label ([00a889b](https://github.com/tmoens/zebrafish-facility-manager/commit/00a889b183092771c3ddd942a4efd6b9bc36d621))
* show allele summary when creating stock or cross label ([272c3f7](https://github.com/tmoens/zebrafish-facility-manager/commit/272c3f71b141037bc4cb960a7fdfb249001edf75))
* stock not showing up in stock list if it has no description ([a59ed62](https://github.com/tmoens/zebrafish-facility-manager/commit/a59ed623e338e3d3688eead4b55ab4f1b6fa9f30))

## [2.5.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.4.1...v2.5.0) (2021-06-06)


### Features

* **export:** add feature for exporting whole stockbook ([1ed995d](https://github.com/tmoens/zebrafish-facility-manager/commit/1ed995d442af40214600923c84f3fe8ea3e53103))


### Bug Fixes

* **config:** remove duplicate config option ([b62031b](https://github.com/tmoens/zebrafish-facility-manager/commit/b62031b1a02dea5eeb38db90026e44d8fa13250b))
* change default zfin-data-api url to https ([31b952a](https://github.com/tmoens/zebrafish-facility-manager/commit/31b952aa07571710eaac8eabad5ddf265bad09aa))

### [2.4.1](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.4.0...v2.4.1) (2021-04-23)

## [2.4.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.3.0...v2.4.0) (2021-04-23)


### Features

* **audit:** add Facility Audit feature ([1d20e2b](https://github.com/tmoens/zebrafish-facility-manager/commit/1d20e2bc46a3a4d24c543005c3439b203d00c133))


### Bug Fixes

* **importer:** include ability to import swimmers for stock ([87dc783](https://github.com/tmoens/zebrafish-facility-manager/commit/87dc783cff7cc29268557f5bc34eac3a0cbb1fc2))
* **tank:** allow user to use case insensitive tank names. ([3cce110](https://github.com/tmoens/zebrafish-facility-manager/commit/3cce11079665f333cc443e423b946385f037b750))
* **tank:** never commit before testing ([57b1661](https://github.com/tmoens/zebrafish-facility-manager/commit/57b16618d624ec9079752b4e472da285bc4dd74b))
* **tg:** Reorder allele/descriptor in transgene report. ([abbee5a](https://github.com/tmoens/zebrafish-facility-manager/commit/abbee5afa453b6a42e07d3f40108449f2d7feaf3))

## [2.3.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.2.2...v2.3.0) (2021-04-10)


### Features

* **import:** Configure visibility of new Importer feature ([59b6682](https://github.com/tmoens/zebrafish-facility-manager/commit/59b66820e63363a5271e205485c7edfcf1b96ae1))

### [2.2.2](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.2.1...v2.2.2) (2021-04-10)


### Bug Fixes

* **import:** fixes to the new importer tool ([c6e3b1a](https://github.com/tmoens/zebrafish-facility-manager/commit/c6e3b1a10ae212aa76b40d4b4309a9b401f3e11e))
* **sql:** code for dropping a database deals with new tables. ([2889ddf](https://github.com/tmoens/zebrafish-facility-manager/commit/2889ddfdb932c99309d08d25b6a0db525eeaa3b3))
* **test:** bring automated tests for server back into working condition. ([a649202](https://github.com/tmoens/zebrafish-facility-manager/commit/a6492023fe4ea5a3857979cdef6aa9e251c0dde2))

### [2.2.1](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.2.0...v2.2.1) (2021-03-16)

## [2.2.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.1.3...v2.2.0) (2021-03-03)


### Features

* **config:** Remove client configuration files, all configuration loaded by server ([3fa438d](https://github.com/tmoens/zebrafish-facility-manager/commit/3fa438dd53ed01fd096ed3e7846a4c57a12845db))

### [2.1.3](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.1.2...v2.1.3) (2021-03-02)

### [2.1.2](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.1.0...v2.1.2) (2021-02-27)


### Bug Fixes

* **GUI:** reseacher selection not properly updating researcher on cross-label ([e28b4d4](https://github.com/tmoens/zebrafish-facility-manager/commit/e28b4d441d6305325a4d2366387e0423b2aa1e19))
* **GUI:** Stock filter for any researcher changed to ANY not NONE. PI too ([a3d714f](https://github.com/tmoens/zebrafish-facility-manager/commit/a3d714ff548846291903e6384bc938d5f2df1fbc))


## [2.1.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.0.2...v2.1.0) (2021-02-26)


### Features

* **doc:** Add user documentation ([059d5a7](https://github.com/tmoens/zebrafish-facility-manager/commit/059d5a713274b30967fe10a52d4abe96532579a7))

### [2.0.2](https://github.com/tmoens/zebrafish-facility-manager/compare/v0.0.4...v2.0.2) (2021-02-26)


### Bug Fixes

* example configuration files ([5482d4e](https://github.com/tmoens/zebrafish-facility-manager/commit/5482d4e026a96b08b30619ae13e3cca7f293ea29))
* set default values for new user so that form fills without error messages. ([82daa73](https://github.com/tmoens/zebrafish-facility-manager/commit/82daa737ebaa6c782cdc12ad5a647823b34eec66))
* update to package.json ([aced118](https://github.com/tmoens/zebrafish-facility-manager/commit/aced118cd3ee6c591992665f8eee8d33e2c7b1fb))

### 2.0.0 (2021-02-25) Database change for stock.researcher and stock.pi, new label features

1. stock.researcher used to be a string is replaced with stock.researcherUser which is
a reference to a User.
1. stock.pi - same
1. new cross-label feature
1. improve tank label feature to allow user editing
1. bunches of other things - see the git log.


### 1.0.0 (Sept 2020) initial release features all in place, several facilities gone live
