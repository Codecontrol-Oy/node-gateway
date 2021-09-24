var log4js = require("log4js")
var validate = require("./tools/schemaValidator").validate
var http = require("http"),
  httpProxy = require("http-proxy"),
  HttpProxyRules = require("http-proxy-rules")
const { exception } = require("console")

this.s = {}
this.logger = {}

const createProxyRules = (config) => { 
  let rules = {
    rules: {}
  }
  config.routeRules.rules.map(x => rules.rules[x.prefix] = x.target)
  rules.rules['.*/error'] = "http://999.999.999.999:999"
  return new HttpProxyRules(rules)
}

const returnWebSocketInternalServerError = (err, socket, config, logger) => {
  logger.error(err)
  socket.write('HTTP/1.1 500 Internal server error\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               `Message: ${config.settings.server.generalErrorMessage}\r\n` +
               '\r\n');
  socket.destroy();
}

const returnWebSocketBadRequest = (socket, config, logger) => {
  logger.warn(config.settings.server.noWebsocketRouteMatchesErrorMessage)
  socket.write('HTTP/1.1 400 Bad request\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               `Message: ${config.settings.server.noWebsocketRouteMatchesErrorMessage}\r\n` +
               '\r\n');
  socket.destroy();
}

const configureWebsockets = (server, config) => {
  var proxyRules = createProxyRules(config)
  var proxy = httpProxy.createProxy()
  
  server.on('upgrade', function (req, socket, head) {
    this.logger = log4js.getLogger("node-gateway")
    proxy.on("error", (err, req, res) => returnWebSocketInternalServerError(err, socket, config, this.logger))

    this.logger = log4js.getLogger("node-gateway")
    var target = proxyRules.match(req);
    if (target) {
      return proxy.ws(req, socket, head,{
        target: target,
      })
    } else
        returnWebSocketBadRequest(socket, config, this.logger)
  })

  this.logger.info("Websockets enabled")
  return server
}
exports.configureWebsockets = configureWebsockets

const configure = (externalSettings, externalRouteRules) => {
  let s = externalSettings ? externalSettings : require("./config/settings.json")
  let r = externalRouteRules ? externalRouteRules : require("./config/routes.json")
  this.s = {
    settings: s.settings,
    routeRules: r
  }
  let validationResult = validate(this.s)
  if (!validationResult.valid) {
    console.error(`Error on schema validation: ${validationResult.errors}`)
    throw "Error while parsing settings and routes"
  }
  log4js.configure(this.s.settings.logger.logconfig)
  this.logger = log4js.getLogger("node-gateway")
  return this.s
}
exports.configure = configure

const server = (config) => http.createServer(function (req, res) {
  this.logger = log4js.getLogger("node-gateway")
  var proxyRules = createProxyRules(config)
  var proxy = httpProxy.createProxy()

  if (config.settings.cors) {
    if (config.settings.cors.allowedHeaders)
      res.setHeader("Access-Control-Allow-Headers", config.settings.cors.allowedHeaders)
    if (config.settings.cors.allowedOrigin)
      res.setHeader("Access-Control-Allow-Origin", config.settings.cors.allowedOrigin)
    if (config.settings.cors.allowCredentials)
      res.setHeader("Access-Control-Allow-Credentials", config.settings.cors.allowCredentials)
    if (config.settings.cors.allowedMethods)
      res.setHeader("Access-Control-Allow-Methods", config.settings.cors.allowedMethods)
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
  }

  proxy.on("error", function (err, req, res) {
    this.logger = log4js.getLogger("node-gateway")
    this.logger.error(err)
    res.writeHead(500, {
      "Content-Type": "text/plain",
    })
    res.end(config.settings.server.generalErrorMessage)
  })

  var target = proxyRules.match(req);
  if (target) {
    return proxy.web(req, res, {
      target: target,
    })
  } else {
    this.logger.warn(config.settings.server.noRouteMatchesErrorMessage)
    res.writeHead(400, { "Content-Type": "text/plain" })
    res.end(config.settings.server.noRouteMatchesErrorMessage)
  }
})
exports.server = server

exports.listen = (server, cb) => {
  this.logger.info(`${this.s.settings.server.serviceName} listening at ${this.s.settings.server.port}`)
  server.listen(this.s.settings.server.port, this.s.settings.server.host, cb)
}

exports.close = (server, callback) => {
  server.close(callback)
}
