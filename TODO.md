# TODO

## Webfinger implementation
- ~~implement /.well-known/webfinger?resource=acct:bob@my-example.com~~
- implement db (postgres, ORM, test data, user schema) <-- think through schema a bit (inbox/outbox etc.?)
- implement https://${process.env.DOMAIN}/users/${username}` (return actor object at this endpoint)
- Add public keys to the test actor objects

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