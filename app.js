
/**
 * Module dependencies.
 */

require("coffee-script")
if (!process.env.MANDRILL_API_KEY) process.exit(1);


var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mail_switch = require('./lib/mail-switch')
var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/mail', routes.mail)
app.post('/mail', mail_switch({
	map: {
		'detours@0circle.co.uk': 'christopherdebeer+detoursapp@gmail.com'
	},
	default: function(address) {return "christopherdebeer+" + address.split('@')[0] + "@gmail.com"},
	redis_prefix: "mail-switch_"
}));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Email forwarding server listening on port ' + app.get('port'));
});
