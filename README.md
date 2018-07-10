# activitypub.js

An opinionated, practical and useful implementation of the ActivityPub spec

## Goals

- Fully interoperable with existing ActivityPub implementations (e.g. Mastodon)
- Complete, covering Client to Server and Server to Server
- Well tested
- Vanilla and opinionated
- Includes applied security best practices 
- Straightforward to drop in to another node app or bootstrap from
- Full federated support

## What does this do?

Running this application will give you an application API that supports all of the standard ActivityPub requirements for a full social app including WebFinger, ActivityPub, ActivityStreams, Actors, Authentication and basic app features. You can then extend or modify this to create pretty much any social application you can think of.

See [some examples](##Try It) of what you can do out of the box.

## Stack

- node v8.4.0+
- Typescript
- TypeOrm
- Express.js
- Pino
- Mocha
- Swagger
- ...

# Setup

## Install It

Clone this repo

```
npm install
```

## Configure it

Adjust the .env file with your specific ActivityPub defaults
We use some sensible defaults but you can use whatever you like

## Run It
#### In *development* mode:

```
npm run dev
```

#### In *production* mode:

```
npm run compile
npm start
```

## Test it

```
npm run test
```

## Deploy to the Cloud
e.g. CloudFoundry

```
cf push activitypub.js
```

## Try It
* Point your browser to [http://localhost:3000](http://localhost:3000)
* Invoke the example REST endpoint `curl http://localhost:3000/api/v1/examples`
   
### Example endpoints

- `/.well-known/webfinger?resource=acct:test@domain.com`