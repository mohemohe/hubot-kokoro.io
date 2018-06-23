# Description:
#   Adapter for Hubot to communicate on kokoro.io
#
# Commands:
#   None
#
# Configuration:
#   HUBOT_KOKOROIO_ACCESSTOKEN    - access token
#   HUBOT_KOKOROIO_CALLBACKSECRET - callback secret
#
# Notes:
#
{Adapter, TextMessage, EnterMessage, LeaveMessage, TopicMessage, CatchAllMessage} = require.main.require 'hubot'

kokoro = require 'kokoro-io'

class KokoroIo extends Adapter
  send: (envelope, strings...) ->
    for str in strings
      @kokoroIo.Api.Bot.postChannelMessage envelope.room, "#{str}"

  reply: (envelope, strings...) ->
    for str in strings
      @kokoroIo.Api.Bot.postChannelMessage envelope.room, "@#{envelope.user} #{str}"

  chat: (body) ->
    id = body.id
    user = body.display_name
    message = body.plaintext_content
    @robot.logger.info "onChat #{id}: @#{user} '#{message}'"
    @robot.logger.debug body

    textMessage = new TextMessage user, message, id
    textMessage.raw = body
    textMessage.room = body.channel.id
    @receive textMessage

  run: ->
    if not process.env.HUBOT_KOKOROIO_ACCESSTOKEN? or not process.env.HUBOT_KOKOROIO_CALLBACKSECRET?
      @robot.logger.error "Error: 'HUBOT_KOKOROIO_ACCESSTOKEN' and 'HUBOT_KOKOROIO_CALLBACKSECRET' are required"
      throw new Error()

    @robot.logger.info ''
    console.log """
.  ___  __    ________  ___  __    ________  ________  ________      ___  ________
. |\\  \\|\\  \\ |\\   __  \\|\\  \\|\\  \\ |\\   __  \\|\\   __  \\|\\   __  \\    |\\  \\|\\   __  \\
. \\ \\  \\/  /|\\ \\  \\|\\  \\ \\  \\/  /|\\ \\  \\|\\  \\ \\  \\|\\  \\ \\  \\|\\  \\   \\ \\  \\ \\  \\|\\  \\
.  \\ \\   ___  \\ \\  \\\\\\  \\ \\   ___  \\ \\  \\\\\\  \\ \\   _  _\\ \\  \\\\\\  \\   \\ \\  \\ \\  \\\\\\  \\
.   \\ \\  \\\\ \\  \\ \\  \\\\\\  \\ \\  \\\\ \\  \\ \\  \\\\\\  \\ \\  \\\\  \\\\ \\  \\\\\\  \\ __\\ \\  \\ \\  \\\\\\  \\
.    \\ \\__\\\\ \\__\\ \\_______\\ \\__\\\\ \\__\\ \\_______\\ \\__\\\\ _\\\\ \\_______\\\\__\\ \\__\\ \\_______\\
.     \\|__| \\|__|\\|_______|\\|__| \\|__|\\|_______|\\|__|\\|__|\\|_______\\|__|\\|__|\\|_______|

"""

    if not @robot.name.match /^@.*$/
      @robot.name = "@#{@robot.name}"

    @token = process.env.HUBOT_KOKOROIO_ACCESSTOKEN || ''
    @secret = process.env.HUBOT_KOKOROIO_CALLBACKSECRET || ''
    @kokoroIo = new kokoro.io {
      accessToken: @token
    }

    @robot.router.get '/', (req, res) ->
      res.send('puri')

    @robot.router.post '/', (req, res) =>
      if req.headers.authorization isnt @secret
        return res.status(401).send {}

      res.status(202).send {}
      @chat(req.body)

    @emit 'connected'

exports.use = (robot) ->
  new KokoroIo robot
