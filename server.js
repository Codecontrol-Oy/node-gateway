var log4js = require("log4js")
var settings = require("./config/settings.json")
var routeRules = require("./config/routes.json")
var validator = require('jsonschema').Validator;
var settingsSchema = require('./schemas/settings.json')
var http = require("http"),
  httpProxy = require("http-proxy"),
  HttpProxyRules = require("http-proxy-rules")

this.s = {}

const configure = (externalSettings, externalRoutes) => {
    var v = new validator()
    v.addSchema(settingsSchema, 'node-gateway-settings')

    let s = externalSettings ? externalSettings : settings
    this.s = {
      settings: s,
      routeRules: routeRules
    }
    let r = v.validate(s.settings,settingsSchema)
    console.log(r)
}
exports.configure = configure
//og4js.configure(this.s.settings.logger.logconfig)
//log4js.setGlobalLogLevel(this.s.settings.logger.loglevel)
//log4js.replaceConsole()



this.server = http.createServer(function (req, res) {
configure()
console.log(this.s)
var proxyRules = new HttpProxyRules(this.s.routes)
var proxy = httpProxy.createProxy();
proxy.on("proxyRes", function (proxyRes, req, res) {
  if(this.s.settings.cors) {
    if(this.s.this.s.settings.cors.allowedHeaders)
        res.setHeader("Access-Control-Allow-Headers", this.s.settings.cors.allowedHeaders)
    if(this.s.this.s.settings.cors.allowedOrigin)
        res.setHeader("Access-Control-Allow-Origin", this.s.settings.cors.allowedOrigin)
    if(this.s.this.s.settings.cors.allowCredentials) 
        res.setHeader("Access-Control-Allow-Credentials", this.s.settings.cors.allowCredentials)
    if(this.s.this.s.settings.cors.allowedMethods) 
        res.setHeader( "Access-Control-Allow-Methods",this.s.settings.cors.allowedMethods)
  }
})

proxy.on("proxyReq", function (proxyReq, req, res, options) {
    if(this.s.settings.server.userHeader) 
        proxyReq.setHeader(this.s.settings.server.userHeader, this.s.settings.server.userHeaderValue); 
})

proxy.on("error", function (err, req, res) {
  console.error(err)
  res.writeHead(500, {
    "Content-Type": "text/plain",
  })
  res.end(this.s.settings.server.generalErrorMessage);
})
  var target = proxyRules.match(req);
  if (target) {
    return proxy.web(req, res, {
      target: target,
    });
  } else {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(this.s.settings.server.noRouteMatchesErrorMessage);
  }
})

//this.server.listen(this.s.settings.server.port);

exports.listen = function (callback) {
  this.server.listen(this.s.settings.server.port);
}

exports.close = function (callback) {
  this.server.close(callback);
}
