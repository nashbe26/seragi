## [0.11.5] - 2022-03-17
- update dependencies.
- removed mstime.

## [0.11.2] - 2021-04-28
- added new routes: POST /:userId/notes/:noteId/like
- UI Example: added simple components, Modal.

## [0.11.0] - 2021-03-07
- UI Example: added selectedItem, ItemView, read & update Item.
- added new routes: GET, POST /user/:userId/notes/:noteId
- user.validation.ts: updated listUsers validation.
- added "rest-client-example.rest" - used in VSCode Rest Client extension.
- upgraded dependencies.
- added vercel.json config file for deploying to Vercel.
- BREAKING: use "/api/v1/" for all endpoints.

## [0.10.5] - 2021-02-23
- fixed npm run build: added rimraf.
- added TODO.md

## [0.10.2] - 2021-02-03
- removed symlink script (package_symlinks.js) to run on Windows.
- changed to use HTTP (easier for beginners to use) instead of HTTPS.
- added "postman-examples.json" (Postman Collection).

## [0.10.1] - 2020-11-05
- upgraded dependencies.
- added endpoint: create User Note: POST /users/USERID/notes - payload { title, note }
- added endpoint: POST /auth/logout - payload { userId }
- added a CRA v4 webapp as an example to access APIs.
- added "yarn build" using "tsc"

## [0.9.0] - 2019-10-27

### Added
- support MongoDB populate - example: '&populate=author:_id,firstName&populate=book:_id,url'
### Changed
- switched to CodeClimate for better static code analysis.
- codeclimate: refactored ModelUtils.listData; fixed duplicate logic.
- BREAKING: Utils: startTimer, endTimer: changed function arguments.

## [0.8.0] - 2019-05-08

### Changed
- updated self-signed cert generated by mkcert
- upgraded dependencies: slack, mongoose

## [0.7.8] - 2019-03-23

### Added
- new self-signed cert (localhost.key, localhost.crt)
- route & controller to delete user note /:userId/notes/:noteId
### Changed
- /status returns a json now

## [0.7.2] - 2019-03-06

### Added
- initData.ts - initialize dev data (admin user & some data)
- userNote model - a simple example of model
- listUserNotes - a simple example to query & return data
- Utils.getQuery - support partial text search (e.g. &note=*sometext*)
### Fixed
- socket on connect
### Changed
- BREAKING: renamed ALLOW_FIELDS to ALLOWED_FIELDS

## [0.6.6] - 2019-02-28

### Added
- support for "&fields" param in Model.transform(req) to include specific fields in API response
- added Utils.getQuery to get safe query fields from req.query
- added ModelUtils transformData and listData
- added MsgUtils slackWebhook to send message using Slack Incoming Webhook
- added MsgUtils sendEmail (using nodemailer & mailgun)
- added MsgUtils email template function, e.g. sendEmail(welcomeEmail({ name, email }))
- added multer to handle file upload
- added "features.md" to explain features in details
- added /forgot-password route & controller
### Fixed
- fixed yarn lint
- fixed lint errors
- fixed to run on Windows 10 (Powershell)

## [0.4.7] - 2019-02-21

### Changed
- upgraded mocha, joi to latest, removed pinned versions.
- upgraded other dependencies

## [0.4.5] - 2018-10-05

### Added
- use [mstime](https://github.com/ngduc/mstime) to measure API run time.
- measure API response time & show it in response "meta"
### Changed
- BREAKING: refactor apiJson's "listModel" to "model"

## [0.3.0] - 2018-10-02

### Changed
- BREAKING: refactor code to use this syntax: import { User } from 'api/models';
