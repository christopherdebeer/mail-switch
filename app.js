
/**
 * Module dependencies.
 */

require("coffee-script")
if (!process.env.MANDRILL_API_KEY) process.exit(1);


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

app.get('/mail', function(req,res){ res.status(200).send('ok'); });
app.post('/mail', mail_switch({
    map: {
        'detours@0circle.co.uk': 'christopherdebeer+detoursapp@gmail.com'
    },
    default: function(address) {return "christopherdebeer+" + address.split('@')[0] + "@gmail.com"},
    redis_prefix: "mail-switch_",
    redis_host: process.env.REDIS_PORT_6379_TCP_PORT,
    redis_port: process.env.REDIS_PORT_6379_TCP_ADDR
}));

http.createServer(app).listen(app.get('port'), function(){
    console.log('Email forwarding server listening on port ' + app.get('port'));
});
