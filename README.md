# hubot-kokoro.io
kokoro.io hubot adapter

## install

```bash
yarn add hubot-kokoro.io
```

## usage

```bash
export HUBOT_KOKOROIO_ACCESSTOKEN='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
export HUBOT_KOKOROIO_CALLBACKSECRET='YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY'
hubot -a kokoro.io -n your-bot-name
```

kokoro.ioのAPI制限により、`-n`でアカウント名を指定しないと`res.respond`できません