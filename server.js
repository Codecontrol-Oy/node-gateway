var log4js = require("log4js")
var settings = require("./config/settings.json")
var routeRules = require("./config/routes.json")
var validate = require("./tools/schemaValidator").validate
var http = require("http"),
  httpProxy = require("http-proxy"),
  HttpProxyRules = require("http-proxy-rules")
const { exception } = require("console")

this.s = {}
this.logger = {}

const configure = (externalSettings, externalRouteRules) => {
    let s = externalSettings ? externalSettings : settings
    let r = externalRouteRules ? externalRouteRules : routeRules
    this.s = {
      settings: s.settings,
      routeRules: r
    }
    let validationResult = validate(this.s)
    if(!validationResult.valid) {
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
  let rules = {
    rules: {}
  }
  config.routeRules.rules.map(x => rules.rules[x.prefix] = x.target)
  var proxyRules = new HttpProxyRules(rules)
  var proxy = httpProxy.createProxy();

  if(config.settings.cors) {
    if(config.settings.cors.allowedHeaders)
      res.setHeader("Access-Control-Allow-Headers", config.settings.cors.allowedHeaders)
    if(config.settings.cors.allowedOrigin)
      res.setHeader("Access-Control-Allow-Origin", config.settings.cors.allowedOrigin)
    if(config.settings.cors.allowCredentials) 
      res.setHeader("Access-Control-Allow-Credentials", config.settings.cors.allowCredentials)
    if(config.settings.cors.allowedMethods) 
        res.setHeader( "Access-Control-Allow-Methods",config.settings.cors.allowedMethods)
    if ( req.method === 'OPTIONS' ) {
        res.writeHead(200)
        res.end()
        return
    }
  }

  proxy.on("proxyReq", function (proxyReq, req, res, options) {
    if(config.settings.server.userHeader) 
      proxyReq.setHeader(config.settings.server.userHeader, config.settings.server.userHeaderValue); 
  })

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
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(config.settings.server.noRouteMatchesErrorMessage);
  }
})

exports.server = server

exports.listen = (server) => {
  this.logger.info(`${this.s.settings.server.serviceName} listening at ${this.s.settings.server.port}`)
  server.listen(this.s.settings.server.port, this.s.settings.server.host);
}

exports.close = (callback) => {
  this.server.close(callback);
}
