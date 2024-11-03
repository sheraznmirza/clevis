## Description

Nest framework TypeScript repository for Clevis Backend API (Koderlabs)

## Installation

Run below command to install all the dependencies of the project

yarn install

Install Docker in your Current System then run `yarn db:dev:up` to start Docker Container

After that run command `npx prisma migrate dev` to develop a Postgres Database in Docker

Then run these two command for deploying database

$ npx prisma generate

$ npx prisma deploy

Then run these commands in sequence for setting up database seeding data:

$ yarn db:seed

$ yarn db:seed2

Now, install Redis in your machine and run `redis-server` in another terminal to serve backend queue service.

## Running the app

For running the server in development mode
bash
$ yarn start:dev

## Build and Deployment

For bundle the backend project run:

$ yarn build

## Test

bash

# unit tests

$ yarn run test

# e2e tests

$ yarn run test:e2e

# test coverage

$ yarn run test:cov

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please read more here.

## Stay in touch

- Author - Koderlabs
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - @nestframework

## License

Nest is [MIT licensed](LICENSE).
