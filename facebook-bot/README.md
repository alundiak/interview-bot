Facebook Apps & Pages API notes
===

# Resources

- Facebook Apps - https://developers.facebook.com
- Facebook Pages - https://www.facebook.com/pages/creation/
- Messenger Platform - https://developers.facebook.com/docs/messenger-platform/introduction
- Graph API Explorer - https://developers.facebook.com/tools/explorer/

# Setup

## Local setup

```
npm install
npm start
```

Note: Make sure local NodeJS/ExpressJS running same port as for ngrok.

```
cd ~
# if NodeJS/ExpressJS running port 80
./ngrok htp 80
# if NodeJS/ExpressJS running port 8989
./ngrok htp 8989
# and so on
```

## Remote setup

### Token
Go to app settings and choose page from the drop-down in Token Generation settings.
It will ask your permissions and generate a page access token for you.
Bot will use this token to make calls to Facebook messenger API to respond to users.

### Messenger Product Settings and Setup WebHook

Copy HTTPS !!! url from `ngrok`, like this `https://a2095cce.ngrok.io` and go to Messenger product settings and setup WebHook.

### Setup subscription

https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup

> Under 'Subscription Fields', select the webhook events you want delivered to you webhook. At a minimum, we recommend you choose messages and messaging_postbacks to get started.

https://developers.facebook.com/apps/

1) Select your App (bot)
2) Messenger \ Settings \ Webhooks \ Edit Events

### (option1) Set custom Greeting and Postback for the Page via curl

**Greeting**

```
curl -X POST -H "Content-Type: application/json" -d '{
  "greeting": [
    {
      "locale":"default",
      "text":"Hello {{user_first_name}}! This is TestBot"
    }
  ]
}' "https://graph.facebook.com/v3.3/me/messenger_profile?access_token=YOUR_PAGE_ACCESS_TOKEN"
```

**Postback**

```
curl -X POST -H "Content-Type: application/json" -d '{
  "get_started": {"payload": "GET_STARTED"}
}' "https://graph.facebook.com/v3.3/me/messenger_profile?access_token=YOUR_PAGE_ACCESS_TOKEN"
```

**To verify:**

```
curl -X GET "https://graph.facebook.com/v3.3/me/messenger_profile?fields=get_started,persistent_menu,whitelisted_domains,greeting&access_token=YOUR_PAGE_ACCESS_TOKEN
```


### (option2) Set custom Greeting and Postback for the Page via Graph Explorer

To avoid errors, need to copy access token, generated from App Settings, it should be the same value, which used in `server.js`.
And then insert in Graph Explorer input field of access token (not generate new).
If generated new access token in Graph Explorer, then need to sync/paste with `.env`.

**Greeting**

POST `/me/messenger_profile` plus field:

`greeting` => `[{"locale":"default","text":"Hello {{user_first_name}}! This is TestBot"}]`

```
{
  "result": "success"
}
```

**Postback**

POST `/me/messenger_profile` plus field:

`get_started` => `{"payload": "GET_STARTED"}` - yes, field value, should be valid JSON!!!

```
{
  "result": "success"
}
```


**To verify:**

GET

`/me/messenger_profile?fields=get_started,persistent_menu,target_audience,whitelisted_domains,greeting,account_linking_url,payment_settings,home_url`


```
{
  "data": [
    {
      "get_started": {
        "payload": "GET_STARTED"
      },
      "persistent_menu": [
        {
          "locale": "default",
          "composer_input_disabled": false,
          "call_to_actions": [
            {
              "type": "web_url",
              "title": "Powered by SendPulse",
              "url": "https://sendpulse.com/?utm_source=facebook&utm_medium=embed&utm_content=menu"
            }
          ]
        }
      ],
      "whitelisted_domains": [
        "https://sendpulse.com/",
        "https://click.sendpulse.com/"
      ],
      "greeting": [
        {
          "locale": "default",
          "text": "Hello {{user_first_name}}! This is InterviewBot"
        }
      ]
    }
  ]
}
```

And now, can continue implement Chat Bot logic.


# Troubleshooting

POST `me/messages`

Fields:

`recipient`: `{"id":"2011200215559139"}`

`message`: `{"attachment":{"type":"template","payload":{"template_type":"button","text":"dunno","buttons":[{"type":"postback","title":"JavaScript","payload":"JS"},{"type":"postback","title":"TypeScript","payload":"TS"},{"type":"postback","title":"ReactJS","payload":"REACT"}]}}}`

Response:

```
{
  "recipient_id": "2011200215559139",
  "message_id": "m_5z3kgHrMIb-cz5LojafoewVn5G1xeRAibp_h1hUJScfdlDXyxFcldGzm7w2pF6tlGAgRtC9_KjkN2MvJNBt16w"
}
```


# Facebook Bot troubleshooting.

```
{
  message: '(#100) No matching user found',
  type: 'OAuthException',
  code: 100,
  error_subcode: 2018001,
  fbtrace_id: 'A-GBya9lupb0oSXvW5gevFP'
}
```

https://stackoverflow.com/questions/45523746/facebook-api-100-no-matching-user-found

So looks like sender.ID is is PSID ???


If too much webhook events, then disable `message_echos` event subscription.
- https://stackoverflow.com/questions/36714200/facebook-messenger-webhook-continuously-sending-messages




# NLP

- Dialogflow - https://dialogflow.com/

> Dialogflow (once known as Api.ai) is a service owned by Google that allows developers to build speech to text, natural language processing and artificially intelligent systems that you can train with your own custom functionality.

- Wit.ai - https://github.com/wit-ai/node-wit

> Wit.ai (owned by Facebook) works similarly to Dialogflow: it also processes human speech patterns and filters useful data like intent and context from it.


# Other APIs, tools, SDKs

- https://github.com/amuramoto/messenger-node - looks like OK. Need to try.
- http://botmasterai.com/documentation/latest/ - BotMaster - seems to be all bots connectors.

# Examples
- [2015] http://ukimiawz.github.io/facebook/2015/08/12/webhook-facebook-subscriptions/
- [2017] https://github.com/perusworld/node-facebook-messenger-api
- [2017] https://medium.com/crowdbotics/how-to-create-your-very-own-facebook-messenger-bot-with-dialogflow-and-node-js-in-just-one-day-f5f2f5792be5
- [2018] https://blog.pusher.com/facebook-chatbot-dialogflow/
- [2018] https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start
  + https://github.com/fbsamples/messenger-platform-samples
  + https://quantizd.com/building-facebook-messenger-bot-with-nodejs/
- [2019] https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps - Official examples.
