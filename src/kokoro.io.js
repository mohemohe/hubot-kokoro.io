//@ts-check

/*
 * Description:
 *   Adapter for Hubot to communicate on kokoro.io
 *
 * Commands:
 *   None
 *
 * Configuration:
 *   HUBOT_KOKOROIO_AS_USER        - user / bot, default: false
 *   HUBOT_KOKOROIO_ACCESSTOKEN    - access token
 *   HUBOT_KOKOROIO_CALLBACKSECRET - callback secret, only use in bot mode
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
        if (this.asUser) {
          await this.client.Api.Channels.postChannelMessage(envelope.room, { message: string });
        } else {
          await this.client.Api.Bot.postChannelMessage(envelope.room, { message: string });
        }
      }
      resolve();
    });
  }

  reply(envelope, ...strings) {
    this.send.apply(this, [envelope].concat(strings.map((string) => {
      let message = "";
      const h = /^(#+)\s.*$/i;
      if(string.match(h)) {
        const hs = h.exec(string)[1];
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

  get asUser() {
    return process.env.HUBOT_KOKOROIO_AS_USER || false;
  }

  run() {
    String.raw`
    ___  __    ________  ___  __    ________  ________  ________      ___  ________
    |\  \|\  \ |\   __  \|\  \|\  \ |\   __  \|\   __  \|\   __  \    |\  \|\   __  \
    \ \  \/  /|\ \  \|\  \ \  \/  /|\ \  \|\  \ \  \|\  \ \  \|\  \   \ \  \ \  \|\  \
     \ \   ___  \ \  \\\  \ \   ___  \ \  \\\  \ \   _  _\ \  \\\  \   \ \  \ \  \\\  \
      \ \  \\ \  \ \  \\\  \ \  \\ \  \ \  \\\  \ \  \\  \\ \  \\\  \ __\ \  \ \  \\\  \
       \ \__\\ \__\ \_______\ \__\\ \__\ \_______\ \__\\ _\\ \_______\\__\ \__\ \_______\
        \|__| \|__|\|_______|\|__| \|__|\|_______|\|__|\|__|\|_______\|__|\|__|\|_______|
    `.split('\n').forEach((line) => this.robot.logger.info(line));

    if (this.asUser) {
      this.runAsUser();
    } else {
      this.runAsBot();
    }
  }

  runAsBot() {
    if(!process.env.HUBOT_KOKOROIO_ACCESSTOKEN || !process.env.HUBOT_KOKOROIO_CALLBACKSECRET) {
      this.robot.logger.error("Error: 'HUBOT_KOKOROIO_ACCESSTOKEN' and 'HUBOT_KOKOROIO_CALLBACKSECRET' are required");
      throw new Error();
    }

    if (!this.robot.name.match(/^@.*$/)) {
      this.robot.name = "@${this.robot.name}"
    }

    this.token = process.env.HUBOT_KOKOROIO_ACCESSTOKEN || '';
    this.secret = process.env.HUBOT_KOKOROIO_CALLBACKSECRET || '';
    this.client = new kokoro.io({
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

  runAsUser() {
    if(!process.env.HUBOT_KOKOROIO_ACCESSTOKEN) {
      this.robot.logger.error("Error: 'HUBOT_KOKOROIO_ACCESSTOKEN' is required");
      throw new Error();
    }

    if (!this.robot.name.match(/^@.*$/)) {
      this.robot.name = "@${this.robot.name}"
    }

    this.token = process.env.HUBOT_KOKOROIO_ACCESSTOKEN || '';
    this.client = new kokoro.io({
      accessToken: this.token,
      autoReconnect: true,
    });

    this.client.Stream.on(this.client.Stream.Event.Connect, async () => {
      const memberships = await this.client.Api.Memberships.getMemberships();
      const channelIds = this.client.Helper.membershipsToChannelIds(memberships);
      this.client.Helper.subscribeChatChannelByChannelIds(this.client.Stream, channelIds);

      this.emit('connected');
    });

    this.client.Stream.on(this.client.Stream.Event.Chat, (message) => {
      if (message.event === this.client.Stream.PuriparaEvent.MessageCreated) {
        this.chat(message.data);
      }
      console.log(message)
    });

    this.client.Stream.connect(true);
  }
}

exports.use = (robot) => new KokoroIo(robot);
