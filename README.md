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

kokoro.ioのAPI制限により、`-n`でアカウント名を指定しないと`respond`できません

## messageオブジェクト

```js
{
  user: '🍌ばなな🍌',
  text: 'ho',
  id: 194944,
  done: false,
  room: 'LQD2XCZEQ',
  display_name: '🍌ばなな🍌',
  screen_name: 'mohemohe',
  raw: {},
}
```

| key |   |
| --- | - |
| user | display_nameのエイリアス |
| text | チャット本文 |
| id   | kokoro.ioのメッセージID |
| room | チャットが送信されたルームのID |
| display_name | ユーザーの表示名 |
| screen_name | ユーザーのスクリーンネーム（メンションとかにつかうやつ） |
| raw | kokoro.ioの素のメッセージオブジェクト |