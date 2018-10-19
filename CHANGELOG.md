# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] Future
### Changed
- actual 1.0 release after more test and tweaking
- support for picking which alarm site for a given user to connect to

### Added
- Support for vacation mode
- Support for lock status

## 0.4.0 (Unreleased so far)
### Added
- Node for extracting sensor data

### Changed
- Former Verisurenode is now VerisureAlarm node, only fetching alarm status [BREAKING change]
- Return object on alarm status contains more data, date for changed status and which user authorized it

## 0.3.3
### Fixed
- Bug not returning the correct Changed true/false in the json result put in msg.payload

### Changed
- Readme update


