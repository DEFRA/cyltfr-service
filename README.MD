[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=security_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=ncloc)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=bugs)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=code_smells)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=sqale_index)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-service&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-service)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![GitHub issues](https://img.shields.io/github/issues/DEFRA/cyltfr-service.svg)](https://github.com/DEFRA/cyltfr-service/issues/)
[![Code size](https://img.shields.io/github/languages/code-size/DEFRA/cyltfr-service.svg)]()
[![Repo size](https://img.shields.io/github/repo-size/DEFRA/cyltfr-service.svg)]()
[![Licence](https://img.shields.io/badge/licence-OGLv3-blue.svg)](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3)

# Check Your Long Term Flood Risk Services (cyltfr-service)
Repo for the Check Your Long Term Flood services back end service.

## Prerequisites
Node v20.x
Docker v20.10.0+

### Start service

`npm start`

### Test service

`npm test`

### Use service

do http `GET` on `http://{host}:{port}/floodrisk/{x}/{y}/radius`

# Environment variables
| name                | description                    | required  |   default   |            valid            | notes |
|---------------------|--------------------------------|:---------:|-------------|:---------------------------:|-------|
| NODE_ENV            | Node environment               |    no     | development | development,test,production |       |
| HOST                | Hostname                       |    no     | 0.0.0.0     |                             |       |
| PORT                | Port number                    |    no     | 3000        |                             |       |
| DATA_VERSION        | Version number of data         |    no     | 01          |                             |       |
| PERFORMANCE_LOGGING | Log detailed query times       |    no     | false       |                             |       |
| RISK_DATA_URL       | Url of the cyltfr-data service |    yes    |             |                             |       |
| ESRI_CLIENT_ID      | Client ID number for ESRI      |    yes    |             |                             |       |
| ESRI_CLIENT_SECRET  | ESRI Client secret             |    yes    |             |                             |       |

# Prerequisites

Node v20+

# Running the application locally

`$ node index.js`

# Debugging the application in docker using vscode

First build the debug image using

`$ npm run container:builddebug`

Configure vscode using a debug configuration launch.json like

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "address": "0.0.0.0",
      "name": "Attach",
      "port": 9229,
      "request": "attach",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/home/node/app",
      "type": "node"
    }
  ]
}
```

Then you can run the container in debug mode using

`$ npm run container:debug`

or 

`$ npm run cd`

This maps your source directory into the container, so that you can make changes locally and they'll be reflected in the container.

If you have auto-attach configured in vscode you might need to disable it for this to work.

When you have finished end the debug container using

`$ npm run container:stopdebug`

or 

`$ npm run cx`

## Contributing to this project
Please read our [contribution guidelines](https://github.com/DEFRA/cyltfr-service/blob/develop/CONTRIBUTING.md)

## License
THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

Contains public sector information licensed under the Open Government license v3

### About the license
The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.