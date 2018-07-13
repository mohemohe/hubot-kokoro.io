/*
 * Description:
 *   Adapter for Hubot to communicate on kokoro.io
 *
 * Commands:
 *   None
 *
 * Configuration:
 *   HUBOT_KOKOROIO_ACCESSTOKEN    - access token
 *   HUBOT_KOKOROIO_CALLBACKSECRET - callback secret
 *
 * Notes:
 *
 */

const {Adapter, TextMessage} = require.main.require('hubot');
const kokoro = require('kokoro-io');

class KokoroIo extends Adapter {
  send(envelope, ...strings) {
    strings = strings.reduce((acc, val) => acc.concat(val), []);
    return new Promise(async (resolve) => {
      for (const string of strings) {
        this.robot.logger.info(`onSend ${envelope.room}: '${string}'`);
        await this.kokoroIo.Api.Bot.postChannelMessage(envelope.room, { message: string });
      }
      resolve();
    });
  }

  reply(envelope, ...strings) {
    this.send.apply(this, [envelope].concat(strings.map((string) => {
      let message = "";
      const h = /^(#+)\s.*$/i;
      if(string.match(h)) {
        hs = h.exec(string)[1];
        message = `${hs} @${envelope.message.screen_name} ${string.slice(hs.length+1)}`;
      } else {
        message = `@${envelope.message.screen_name} ${string}`;
      }
      return message;
    })));
  }

  chat(body) {
    const id = body.id;
    const channel = body.channel.id;
    const user = body.display_name;
    const message = body.plaintext_content;
    this.robot.logger.info(`onChat ${channel}: @${user} '${message}'`);
    this.robot.logger.debug(body);

    const textMessage = new TextMessage(user, message, id);
    textMessage.display_name = user;
    textMessage.screen_name = body.profile.screen_name;
    textMessage.raw = body;
    textMessage.room = body.channel.id;
    this.receive(textMessage);
  }

  run() {
    if(!process.env.HUBOT_KOKOROIO_ACCESSTOKEN || !process.env.HUBOT_KOKOROIO_CALLBACKSECRET) {
      this.robot.logger.error("Error: 'HUBOT_KOKOROIO_ACCESSTOKEN' and 'HUBOT_KOKOROIO_CALLBACKSECRET' are required");
      throw new Error();
    }

    String.raw`
___  __    ________  ___  __    ________  ________  ________      ___  ________
|\  \|\  \ |\   __  \|\  \|\  \ |\   __  \|\   __  \|\   __  \    |\  \|\   __  \
\ \  \/  /|\ \  \|\  \ \  \/  /|\ \  \|\  \ \  \|\  \ \  \|\  \   \ \  \ \  \|\  \
 \ \   ___  \ \  \\\  \ \   ___  \ \  \\\  \ \   _  _\ \  \\\  \   \ \  \ \  \\\  \
  \ \  \\ \  \ \  \\\  \ \  \\ \  \ \  \\\  \ \  \\  \\ \  \\\  \ __\ \  \ \  \\\  \
   \ \__\\ \__\ \_______\ \__\\ \__\ \_______\ \__\\ _\\ \_______\\__\ \__\ \_______\
    \|__| \|__|\|_______|\|__| \|__|\|_______|\|__|\|__|\|_______\|__|\|__|\|_______|
`.split('\n').forEach((line) => this.robot.logger.info(line));

    if (!this.robot.name.match(/^@.*$/)) {
      this.robot.name = "@${this.robot.name}"
    }

    this.token = process.env.HUBOT_KOKOROIO_ACCESSTOKEN || ''
    this.secret = process.env.HUBOT_KOKOROIO_CALLBACKSECRET || ''
    this.kokoroIo = new kokoro.io({
      accessToken: this.token
    });

    this.robot.router.get('/', (req, res) => {
      res.send('puri');
    });

    this.robot.router.post('/', (req, res) => {
      if(req.headers.authorization !== this.secret) {
        return res.status(401).send({});
      }

      res.status(202).send({})
      this.chat(req.body);
    });

    this.emit('connected');
  }


}

exports.use = (robot) => new KokoroIo(robot);