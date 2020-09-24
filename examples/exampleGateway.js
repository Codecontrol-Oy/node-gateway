var g = require('../index')
var config = g.configure()
var server = g.server(config)
g.listen(server)