
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mandrill = require('node-mandrill')('t3ZED7xnxF0qDxk6Pifzsg');
_ = require('underscore')
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
app.post('/mail', function(req, res) {
	
	var events = []
	try {
		var events = JSON.parse( req.body.mandrill_events )
	} catch(e){
		console.log( 'bad request: ', req.body );
		res.send(405)
	}
	_(events).each( function(ev) {
		console.log('processing mandrill inbound: ', ev.msg)
		mandrill('/messages/send', {
		    message: {
			to: [{email: 'christopherdebeer@gmail.com', name: 'Christopher de Beer'}],
			from_email: ev.msg.from_email,
			subject: "(via detours@0circle): " + ev.msg.subject,
			text: ev.msg.text,
			html: ev.msg.html
			} }, function(error, response) {
		    //uh oh, there was an error
		    if (error) {
			console.log( JSON.stringify(error) );
			res.send( 500 );
		    //everything's good, lets see what mandrill said
		    } else { 
			console.log(response);
			res.send( 200 );
		    }
		});
	});
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Email forwarding server listening on port ' + app.get('port'));
});
