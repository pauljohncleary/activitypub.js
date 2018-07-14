# TODO

## Webfinger implementation
- ~~implement /.well-known/webfinger?resource=acct:bob@my-example.com~~
- ~~implement database~~
- ~~add some test data into the database automatically so the final webfinger test passes~~

- implement https://${process.env.DOMAIN}/users/${username}` (return actor object at this endpoint)
- Add public keys to the test actor objects
- implement schema (postgres, ORM, test data, user schema) <-- think through schema a bit (inbox/outbox etc.?)
- disable sychronise true and setup migrations?

## ActivityPub Implementation
inbox, outbox, followers, following, liked etc. inc http signatures
pass test suite etc. https://activitypub.rocks/implementation-report/
Client to Server Interactions (post to /inbox)/

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