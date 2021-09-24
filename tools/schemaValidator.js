var validator = require('jsonschema').Validator;
var settingsSchema = require('../schemas/settings.json')
var corsSchema = require('../schemas/cors.json')
var serverSchema = require('../schemas/server.json')
var loggerSchema = require('../schemas/logger.json')
var configSchema = require('../schemas/config.json')
var routeRules = require('../schemas/routeRules.json');

const validate = (obj) => {
    var v = new validator()
    v.addSchema(serverSchema, 'node-gateway-server')
    v.addSchema(corsSchema, 'node-gateway-cors')
    v.addSchema(settingsSchema, 'node-gateway-settings')
    v.addSchema(loggerSchema, 'node-gateway-logger')
    v.addSchema(configSchema, 'node-gateway-config')
    v.addSchema(routeRules, 'node-gateway-routerules')
    return v.validate(obj, configSchema)
}

exports.validate = validate