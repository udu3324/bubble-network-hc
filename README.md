# bubble network

A website that visualizes who you are connected to in slack.

## how it works

Oauth access gives slack endpoints to reveal what **public** channels you are in. It can then be scanned with the most recent 1000 messages. From there, it checks if the message is a thread and if you are the author or have replied in it.

**How is this a Good Metric**    

It's not. Well, its close enough. Slack does offer scopes to reveal dmed users, group conversations, or private channels, but the bot itself has to be invited to them to see it. I do not know a workaround to this unless if everyone is willing to invite the bot to every channel or it gets admin workspace access.

## development

To setup a dev enviornment, make sure you have nodejs installed with npm. Clone it into your favorite IDE and run the commands below!

```
npm install

npm run dev
```

Slack OAuth **DOES NOT WORK** in the dev enviornment as the callback points back to the real domain. I think there's a way to fix this but im too lazy. As a workaround, you can oauth from production and export your localstorage variables and reimport into localhost. 

## environment variables

```

SLACK_WEBHOOK_STATUS=
SLACK_WEBHOOK_LOGS=

SLACK_ORGANIZATION_ID=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_BOT_OAUTH_TOKEN=
PUBLIC_BASE_URL=
PUBLIC_SLACK_APP_CLIENT_ID=

PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

```