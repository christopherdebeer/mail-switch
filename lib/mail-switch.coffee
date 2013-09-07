
mandrill = require( 'node-mandrill' )( process.env.MANDRILL_API_KEY )

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
		forwardTo = options[event.msg.email] or getForward( event.msg.email )
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

getForward = ( address ) ->
	"christopherdebeer+#{ address.split('@')[0] }@gmail.com"
 
module.exports = (opts = {}) ->
	options = opts
	handleRequest
	
