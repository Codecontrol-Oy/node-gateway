# node-gateway

A Simple NodeJS based Api Gateway

node-gateway is used to map your api calls through a single proxy. 
Instead creating different subdomains for your api's, you can gather them to a single endpoint with cors rules on top.

ex.
```
proxy.mydomain.com/users => https://userapi/users:2500 (internal api on the server)
proxy.mydomain.com/projects => https://projectapi/projects:2501 (internal api on the server)
proxy.mydomain.com/billing => https://commercial.api.com (external api)
```

## Installation
1. clone repository
2. run npm install
3. run the exampleGateway.js under the examples folder (node exampleGateway.js)

or

use the npm package, @codecontrol/node-gateway
```
npm i @codecontrol/node-gateway
````

## Tests
Run npm test

## Settings
**Logger**
node-gateway uses Log4js for logging, see parameters from log4js (https://www.npmjs.com/package/log4js)

**Server**
There are two different settings file. 
One for the actual configs, and another one for proxy routes

example settings.json (under the config directory)
```
{
    "settings" : {
        "cors": {
            "allowedOrigin": "*",
            "allowCredentials": true,
            "allowedMethods": "GET, POST, DELETE, UPDATE, OPTIONS"
        },
        "server": {
            "port": 6010, 
            "noRouteMatchesErrorMessage": "No route matches the given address",
            "generalErrorMessage": "node-gateway general error",
            "host": "127.0.0.1",
            "serviceName": "node-gateway"
        }, 
        "logger": {
            "logconfig" : { 
                    "appenders": {
                        "node-gateway": { 
                            "type": "console"
                        }
                    },
                    "categories": { 
                        "default": { 
                            "appenders": ["node-gateway"], 
                            "level": "info" 
                        } 
                    }
            },
            "loglevel" : "DEBUG"
        }
    }
```

example of the routes.json (under the config directory)
```
{
    "rules": [
        {
            "prefix": ".*/users",
            "target": "https://userApi/users:4992"
        },
        {
            "prefix": ".*/organization",
            "target": "https://organizationApi/organization:4991"
        },
        {
            "prefix": ".*/organization/users",
            "target": "https://organizationApi/organization/users:4000"
        }
    ]
}
```

## Usage

in your app file
```
var g = require('./index') (if you are on the root folder of this project)
//You can overwrite the settings with your own files if you wish, by using settings and routes params to configure method. 
//By default it uses the files under the config directory (see the npm version example under this one)
var config = g.configure() 
var server = g.server(config)
g.listen(server)
```

or if you use the npm package

```
var g = require('@codecontrol/node-gateway')
var settings = require('./yourSettingsFile.json)
var routes = require('./yourRoutesFile.json)
var config = g.configure(settings, routes)
var server = g.server(config)
g.listen(server)
```

To test your routes, just use the localhost:yourport/yourprefix, and see if it directs the call to your target.
the following route on the example server settings will direct on the serverside, to https://userApi/users:4992 with the url localhost:6010/users
```
{
"prefix": ".*/users",
"target": "https://userApi/users:4992"
}
```
