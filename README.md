# Circles of Angels - API

Circles of Angels is a platform that brings Social Entrepreneurs and Funders around the world closer while ensuring the transparency of investments and donations through blockchain technology, which allows for traceability of operations, tracking and visualization of the real impact that entrepreneurs are generating in their communities.

## Prerequisites

- See [.nvmrc](./.nvmrc) file

- Configured PostgreSQL database

## Tools and frameworks

- fastify@1.14.3

- solc@0.5.8

- @nomiclabs/buidler@1.1.2

## Creating the database

The schema for the `coadb` database can be found in [schema.sql](./schema.sql).
Execute this script by running `psql -d postgres -a -f schema.sql` to create the database.

## Contributing

Clone the repository by running `git@gitlab.com:atixlabs-oss/circles-of-angels-api.git` and create a new branch from the latest development branch

**Remember not to commit nor push the .env file**

## Development

- ### Setup environment

  - Run `npm install` to install the dependencies.
  - Run `npx ganache-cli` to start a local ganache instance in `http://localhost:8545`.
  - Create the database either manually as stated above or with Docker by running `cd docker && docker-compose up -d` (this is only for the development environment!!).

- ### Deploy smart contracts with buidler

  - Compile the smart contracts by running `npx buidler compile`.
  - Deploy the compiled contracts to the local network by running `npx buidler deploy`.

- ### Start the server

  - Run `npm start` to start the server in `http://localhost:3001`.

- ### Testing

  - Run `npm test` to run all the API tests.
  - Run `npx buidler test` to run all the smart contracts tests.

## Configuration

- ### Network configuration

  - The `buidler` configuration can be found in [buidler.config.js](./buidler.config.js).
  - Modify the `network` object inside this file to include any other blockchain configuration you may need.
  - Use the `--network` option along with `npx builder` commands to use a different network (e.g, `npx builder deploy --network testnet` to deploy in a testnet specified in the buidler configuration file).
