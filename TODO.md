# TODO

## Webfinger & Actor (Complete)
- ~~implement /.well-known/webfinger?resource=acct:bob@my-example.com~~
- ~~implement database~~
- ~~add some test data into the database automatically so the final webfinger test passes~~
- ~~Finish implementing https://${process.env.DOMAIN}/users/${username}` (basic version only)~~

## ActivityPub Implementation

### Client to server

- Create client to post activities to outbox
Abstract this out completely?


### Server to server (in progress)

- inbox - implement storing messages and actions on them & GET requests
- followers, following, liked etc. inc http signatures
- pass test suite etc. https://activitypub.rocks/implementation-report/

## Authentication

- Create a new Auth provider built on oAuth 2.0 (e.g. via https://github.com/ory/hydra)
- Additionally we'll also support any IndieAuth or oAuth provider that the user wants to login with via a separate input box


## Other
Add a license
Add CI, package checking badges etc.
Add a stupid logo
configurable strucuture / routes of URLs, based on .env or config files or we just hardcode /users/?
Provide support for non-human based Actors (e.g. a printer or iot device)
- disable sychronise true and setup migrations
- add example.env (current .env is not included in git)
- implement https://github.com/jhass/nodeinfo