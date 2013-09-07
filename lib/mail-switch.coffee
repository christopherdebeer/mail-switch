
mandrill = require( 'node-mandrill' )( process.env.MANDRILL_API_KEY )
redis = require 'redis'
rclient = redis.createClient()

options = {}
handleRequest = (req, res) ->
	events = []
	try
		events = JSON.parse req.body.mandrill_events
	catch e
		console.log 'bad request', req.body
		res.send 405
	for event in events
		break unless event.event is 'inbound'
		console.log 'Getting forwarding address...'
		getForward event.msg.email, options[event.msg.email], (forwardTo) ->
			console.log "Sending to: #{forwardTo}"
			message =
				to: [ email: forwardTo, name: 'Christopher de Beer' ]
				from_email: event.msg.from_email
				subject: event.msg.subject
				text: event.msg.text
				html: event.msg.html
			mandrill '/messages/send', message: message, (err, send_res) ->
				if err
					res.send 500
					console.log JSON.stringify err
				else
					res.send 200
					console.log JSON.stringify send_res

getForward = ( address, overide, callback ) ->
	unless overide
		default_forward = "christopherdebeer+#{ address.split('@')[0] }@gmail.com"
		console.log 'Checking redis for forwarding address...'
		rclient.get "mail-switch_#{address}", (err, res) ->
			forward = if res and not err
				res
			else
				default_forward
			console.log "Forwarding to #{forward}"
			callback forward
	else
		console.log "Forwarding to overide..."
		callback overide

 
module.exports = (opts = {}) ->
	options = opts
	handleRequest
	
