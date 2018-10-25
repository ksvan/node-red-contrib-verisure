# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] Future
### Changed
- actual 1.0 release after more test and tweaking
- support for picking which alarm site for a given user to connect to
- support for fetching data from multiple sensors, return array
- separate lock node for specific flows and simplicity
- separate node for site info, full object. Cached and real time mode, specify or force refresh
- work more on code structure and abstractions

### Added
- Support for vacation mode
- Support for lock status
- Support for multiple sites, choose as part of config node setup

## 0.4.0 (Unreleased so far)
### Added
- Node for extracting sensor data

### Changed
- Former Verisurenode is now VerisureAlarm node, only fetching alarm status [BREAKING change]
- Return object on alarm status contains more data, date for changed status and which user authorized it
- Changed node category to Verisure, as number of nodes grows
- Sensor node can rode return the file site datastructure if preferred. Note that this node then does not normalize data

## 0.3.3
### Fixed
- Bug not returning the correct Changed true/false in the json result put in msg.payload

### Changed
- Readme update


