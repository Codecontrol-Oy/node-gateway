var g = require('../index').gateway
var config = g.configure()
var server = g.server(config)
g.listen(server)