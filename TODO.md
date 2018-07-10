# TODO

Think through the strucuture / routes of URLs, based on a .env
- The .env will be used in Api.yaml to build the API appropriately

## Actor implentation

- Add public keys to the actors
- Replace url with one from .env somehow?
- Store in a db instead and serve properly?

## Webfinger implementation
- implement /.well-known/webfinger
https://tools.ietf.org/html/rfc7033


## ActivityPub Implementation
inbox, outbox, followers, following, liked etc.
pass test suite etc. https://activitypub.rocks/implementation-report/
Client to Server Interactions (post to /inbox)/

## Authenticaion implementation

- IndieAuth?

## App level

- register account (add new actor)
- login/logout
- remote follow
- send message

## Other
Add a license
Add CI, package checking badges etc.
Add a stupid logo