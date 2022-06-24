# @antwika/auth-api

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@antwika/auth-api)](https://www.npmjs.com/package/@antwika/auth-api)
[![Node.js version](https://img.shields.io/node/v/@antwika/auth-api)](https://www.npmjs.com/package/@antwika/auth-api)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=antwika_auth-api&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=antwika_auth-api)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=antwika_auth-api&metric=coverage)](https://sonarcloud.io/summary/new_code?id=antwika_auth-api)
[![Actions Status](https://github.com/antwika/auth-api/workflows/CI/badge.svg)](https://github.com/antwika/auth-api/actions/workflows/ci.yml)

## Configuration

| Environment variable | Example | Description |
| - | - | - |
| **PORT** | `4000` | HTTP server port |
| **APP_BASE_URL** | `http://localhost:4000` | Prefixes all route and link generation |
| **APP_DB_PROTOCOL** | `mongodb+srv` | MongoDB database protocol |
| **APP_DB_USER** | `testuser` | MongoDB database username |
| **APP_DB_PASS** | `testpass` | MongoDB database password |
| **APP_DB_CLUSTER** | `my.cluster.mongodb.net` | MongoDB database cluster host |
| **APP_DB_NAME** | `my-app-db` | MongoDB database name |
| **APP_DB_FLAGS** | `retryWrites=true&w=majority` | MongoDB connection options (can be left as an empty `string`) |

## Run locally

```
$ yarn build && PORT=4000 APP_BASE_URL=http://localhost:4000 APP_DB_PROTOCOL=mongodb APP_DB_CLUSTER=localhost:27017 APP_DB_NAME=auth-api APP_DB_USER= APP_DB_PASS= APP_DB_FLAGS= yarn start
```
