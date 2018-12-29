# IV-bot
Interview Bot, which maintains a simple quiz-like dialog for initial Candidate Interview.


## Name
- IV?
- IV-bot?
- InterviewBot?
- InterviewMaster?
- Interviewer?
- InterviewHelper?
- InterviewQuiz?


## Idea

Bot will provide a quiz with questions. Interview Person should select `type` of quiz: `JavaScript`, `React`, `Java`, `TBD`. Then start answering questions. Bot will analyze answers and give feedback right away. Logic for making decision is very easy - only one question is correct, and Bot is programmed to know it, and if user reply is the same as. expected by Bot - then question is passed (OK).


## Tech Stack
- This bot has been created using [Microsoft Bot Framework](https://dev.botframework.com), it's a simple echo bot with state.
- Bot logic hosted in NodeJS-like server, using [`restify`](https://www.npmjs.com/package/restify).
- Main code written in [TypeScript](https://www.typescriptlang.org) >= `v3.1.x`.


## How to use Bot?

- Add in Skype
- Add in Facebook Messenger
- Add in Telegram
- todo

## Bot Flow
- Selecting quiz type is first, dedicated (1st) dialog. Person should be able to `select` (click from suggested actions (`ChoicePrompt`) or `cancel` that bot flow.
- Taking any quiz is dedicated (2nd) dialog. Person should be able to answer questions, by clicking suggested actions, and if `cancel`-ed, then quiz interupped, and any intermediate results deleted from Bot state.
- After success/fail selected quiz, Bot should suggest to take new (anotehr) kind of quiz or (optional) re-take previous quiz. Future feature.
- 

## How to develop Bot?

- See `DEVELOPMENT_NOTES.md`
- Read more about MS Bot Framework.
- Bot uses Microsoft Application (id and password)


## Deployment
- Easy: Bot logic can be hosted in either local network as available host, or dedicated computer or any public free host. Not much of efforts needed, it's just quiz-like behavior.
- Complex: Bot can be hosted on Heroku, but some delays can be in responses, then we need to use Cafeinne app, which will cause Heroku later on to suspend Heroku account.
- Complicated: Bot can be hosted od MS dedicated Azure service. But it can be paid with time.

## Other
- https://telegram.org/blog/bot-revolution