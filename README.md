## Description

Provide Api For Creating Shopify Products From Excel File.

## Installation

```bash
$ npm install
```

## Running the app

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

## Create Product

```bash
curl --location --request POST 'http://localhost:3000/v1/product/create' \
--form 'file=@"/Path/To/File/xxx.xlsx"'
```
