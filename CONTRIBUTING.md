# Contributing

Thanks for considering to contribute to React Canvas Draw!

Please use the `develop` branch when creating PRs. Below are the necessary steps to get going.

If you want to be added to the contributors list in the README, 
please follow the [all-contributors bot instructions](https://allcontributors.org/docs/en/bot/usage).

## Prerequisites

[Node.js](http://nodejs.org/) >= v4 must be installed.

## Installation

- Running `npm install` in the component's root directory will install everything you need for development.

## Demo Development Server

- `npm start` will run a development server with the component's demo app at [http://localhost:3000](http://localhost:3000) with hot module reloading.

## Running Tests

- `npm test` will run the tests once.

- `npm run test:coverage` will run the tests and produce a coverage report in `coverage/`.

- `npm run test:watch` will run the tests on every change.

## Building

- `npm run build` will build the component for publishing to npm and also bundle the demo app.

- `npm run clean` will delete built resources.
