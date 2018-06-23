# hubot-kokoro.io
kokoro.io hubot adapter

## install

```bash
yarn add mohemohe/hubot-kokoro.io
```

## usage

```bash
export HUBOT_KOKOROIO_ACCESSTOKEN='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
export HUBOT_KOKOROIO_CALLBACKSECRET='YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY'
hubot -a kokoro.io -n mohemohe-testbot
```

`-n`でアカウント名を指定しないと`res.respond`できません