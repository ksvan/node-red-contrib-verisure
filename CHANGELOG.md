# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] Future
### Changed
- Actual 1.0 release after more test and tweaking
- Support for picking which alarm site for a given user to connect to
- Support for fetching data from multiple sensors, return array
- Separate lock node for specific flows and simplicity
- Separate node for site info, full object. Cached and real time mode, specify or force refresh
- Work more on code structure and abstractions
- Simple caching for calls/integrated throttling policy, to reduce calls to verisure, due to their throttling policies


### Added
- Support for vacation mode
- Support for lock status
- Support for multiple sites, choose as part of config node setup

### Fixed
- Abstraction and methods on picking data from right object based and deciding what criteria to use. To much duplicate code

### Not be addedd
- Most probably not setting values or changing Verisure site in any manner, due to security. Keep your Verisure site for security reasons, not smarthome features. Separations of concern.

## 0.4.2 (05.2019)

### Changed
- Dependencies for node-red, test-helper, eslint*
- Testing on Node-red 0.2.0

### Removed
- support for older versions of nodejs. Updated to reflect node-red 0.2.0 requirements

## 0.4.1 (21.12.2018)
### Added
- Test automization. folder tests contains all scripts for testing.
- CI Integration to test and support Greenkeeper

### Changed
- dependencies updates
- package.json script section

### Fixed
- failure to return error in msg.payload when failing to get alarm status
- failed return values in "changed" status when disarmed



## 0.4.0 (26.10.2018)
NB! Breaking changes in version 0.4, separation of alarm node and newly added sensor node. Only applicable if moving from < 0.4. No more breaks in 0.4.1

### Added
- Node for supporting Verisure devices as well, extracting data, climate values etc

### Changed
- Former Verisurenode is now VerisureAlarm node, only fetching alarm status [BREAKING change]
- Return object on alarm status contains more data, date for changed status and which user authorized it
- Changed node category to Verisure, as number of nodes grows
- Sensor node can rode return the file site datastructure if preferred. Note that this node then does not normalize data
- Added a lot in Readme

## 0.3.3
### Fixed
- Bug not returning the correct Changed true/false in the json result put in msg.payload

### Changed
- Readme update


