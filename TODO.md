# TODO

## Webfinger & Actor return implementation
- ~~implement /.well-known/webfinger?resource=acct:bob@my-example.com~~
- ~~implement database~~
- ~~add some test data into the database automatically so the final webfinger test passes~~
- ~~Finish implementing https://${process.env.DOMAIN}/users/${username}` (basic version only)~~

## ActivityPub Implementation
- inbox - implement storing messages and actions on them
- outbox
- followers, following, liked etc. inc http signatures
- pass test suite etc. https://activitypub.rocks/implementation-report/
- Client to Server Interactions (post to /inbox)/

## Authenticaion implementation

- IndieAuth???

## App level

- register account (add new actor/user)
- login/logout
- remote follow
- send message

## Other
Add a license
Add CI, package checking badges etc.
Add a stupid logo
configurable strucuture / routes of URLs, based on .env or config files or we just hardcode /users/?
Provide support for non-human based Actors (e.g. a printer or iot device)
- Add valid public keys to the test actor objects? or does this depend on the auth version?
- disable sychronise true and setup migrations
- add example.env (current .env is not included in git)
- implement https://github.com/jhass/nodeinfo