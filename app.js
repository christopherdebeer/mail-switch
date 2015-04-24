
/**
 * Module dependencies.
 */

require("coffee-script").register();

config = require( './config.json' );

if (!config.MANDRILL_API_KEY) {
    throw new Error( "MANDRILL_API_KEY was not set." );
    process.exit(1);
}

console.log( "MANDRILL_API_KEY", config.MANDRILL_API_KEY );
console.log( "REDIS_PORT_6379_TCP_ADDR", process.env.REDIS_PORT_6379_TCP_ADDR );
console.log( "REDIS_PORT_6379_TCP_PORT", process.env.REDIS_PORT_6379_TCP_PORT );

var express = require('express');
var http = require('http');
var path = require('path');
var mail_switch = require('./lib/mail-switch')
var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get( '/', function(req,res){ res.status(200).send('hi :)'); });
app.get('/mail', function(req,res){ res.status(200).send('ok'); });
app.post('/mail', mail_switch({
    map: {
        'detours@0circle.co.uk': 'christopherdebeer+detoursapp@gmail.com'
    },
    default: function(address) {return "christopherdebeer+" + address.split('@')[0] + "@gmail.com"},
    redis_prefix: "mail-switch_",
    redis_host: process.env.REDIS_PORT_6379_TCP_ADDR,
    redis_port: process.env.REDIS_PORT_6379_TCP_PORT,
    mandrill_api_key: config.MANDRILL_API_KEY
}));

http.createServer(app).listen(app.get('port'), function(){
    console.log('Email forwarding server listening on port ' + app.get('port'));
});
