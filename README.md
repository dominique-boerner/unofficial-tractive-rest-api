# (Unofficial) Tractive REST API

[Tractive](https://tractive.com/) is a company that specializes in GPS tracking devices for pets, primarily dogs and cats. These devices allow
owners to keep tabs on the location of their pets in real-time via a mobile app. The Tractive GPS tracker can be easily
attached to the pet's collar and uses a combination of GPS, Wi-Fi, and cellular technology to provide accurate location
data. The service usually requires a subscription fee for access to the GPS tracking features.

In addition to tracking, some Tractive devices offer additional features such as activity monitoring, which gives you
insights into your pet's daily activities and behaviors. This can be useful for pet owners looking to monitor their
pet's health and well-being closely.

Since tractive has no official, documented public API, this will be a wrapper around their REST API.

> **Important:** The project is in no way affiliated with Tractive. If Tractive wants the project to be removed, please
> contact me by email.

## Installation

```bash
$ npm install
```

## Running the app

To run the app, rename the ```.env.example``` file to ```.env``` and fill in your login credentials (email & password).

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Usage

You can use the api itself like this:

```javascript

(async () => {
  // authenticate with the username/password from the .env file
  await fetch("http://localhost:3002/auth")

  /**
   * get a single location.
   *
   * returns:
   * {
   *   status: 200,
   *   data: { location from tractive }
   * }
   */
  const location = await fetch("http://localhost:3002/location?trackerId=mytrackerid")

  /**
   * get a multiple locations.
   *
   * returns:
   * {
   *   status: 200,
   *   data: [{ location from tractive }, { location from tractive }]
   * }
   */
  const locations = await fetch("http://localhost:3002/location?trackerId=mytrackerid,mysecondtrackerid")
})
```

## Features

This API has an Endpoint for Swagger, which you can open in your browser via:

```
http://localhost:3002/api
```

To test the capabilities, you need to authenticate yourself at first, before you make other requests. The authentication
is currently stored in the backend, so there is no need to pass the accessToken in every request.
