
redis = require 'redis'
rclient = null
mandrill = null

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

        toName = ''
        for person in event.msg.to
            toName = person[1] if person.name = event.msg.email

        console.log 'Getting forwarding address...'
        getForward event.msg.email, options.map[event.msg.email], (forwardTo) ->
            console.log "Sending to: #{forwardTo}"
            message =
                to: [ email: forwardTo, name: toName ]
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
        default_forward = options.default( address )
        console.log 'Checking redis for forwarding address...'
        rclient.get "#{options.redis_prefix}#{address}", (err, res) ->
            forward = if res and not err
                res
            else
                default_forward
            console.log "Forwarding to #{forward}"
            callback forward
    else
        console.log "Forwarding to overide..."
        callback overide

module.exports = (opts) ->
    options.map = opts.map || {}
    options.default = opts.default || -> "example@example.com"
    options.redis_prefix = opts.redis_prefix || "mail-switch_"
    options.redis_host = opts.redis_host || "127.0.0.1"
    options.redis_port = opts.redis_port || 6379
    mandrill = require( 'node-mandrill' )( opts.mandrill_api_key )
    rclient = redis.createClient( options.redis_port, options.redis_host )
    handleRequest
