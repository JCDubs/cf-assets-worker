# CloudFlare Assets Worker

The CloudFlare Assets Worker processes all requests for the /assets/\* route.

## Installation

The project can be installed on a local dev machine using the yarn command:

`yarn`

The serverless and wrangler global libraries are also required for development and testing.

`npm install -g serverless`
`npm i @cloudflare/wrangler -g`

## Local Development

The worker can be run locally in preview mode using the `wrangler preview` command.
To run the worker in preview mode, you need to create a `wrangler.toml` file in the root of the project with the following content.

```
name = "cloudflare-assets"
type = "webpack"
zone_id = "bac91639fea37465267b5c27cc53d116"
private = false
account_id = "<YOUR ACCOUNT ID>"
route = "<YOUR DOMAIN NAME>/assets/*"
```

Once the `wrangler preview` command has executed the cloudflare worker playgound will open up in your default web browser with the worker script displayed.

## Tests

Unit tests are located in the `test/unit` directory and can be run with the `yarn test` command. Doing so will run the tests with the mocha and chai framework. On completeion of running the tests, a code coverage report will be displayed in the terminal.

## Webpack

Webpack has been used in the project as a means to minify and dedupe code. On deployment, a webpack build is performed and the processed code is pushed to CloudFlare as a single script. The `webpack.config.js` file contains the webpack configuration used by the `wrangler preview` command. The webpack config pulls in the config from the `./config/apis.json` file. This allows us to place the config in one place and use it in many config files.

## Serverless

The Serverless framework has been used for deployment purposes only due to the wrangler cli not being able to provide staging environments. The serverless configuration is located in the `serverless.yaml` file. It is a stript down version of the config that would be required to configure and deploy an AWS Lambda. Because a webpack configuration is required for the `wrangler preview` step, the `serverless.yaml` file pulls in the configuration from the `./config/apis.json` file. This allows us to place the config in one place and use it in many config files.
