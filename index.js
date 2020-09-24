var s = require('./server.js')
var config = s.configure()
var server = s.server(config)
s.listen(server)