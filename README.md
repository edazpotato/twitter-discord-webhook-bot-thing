A little app using the Twitter api V2, that cross-posts tweets from a twitter user to a Discord channel via a webhook.

## Setup

```shell
git clone https://github.com/edazpotato/twitter-discord-crosspost.git
cd twitter-discord-crosspost
pnpm i
# Do step outlined in 'Configuring' below
pnpm start
```

## Configuring

Make a copy of `config.example.json` called `config.json`, and fill out the fields.

The `twitterUserToTrack` field is the handle for the twitter user who's tweets you want to crosspost to Discord (Minus the "@"). E.g. to crosspost user "@edazpotato"'s tweets to Discord, you would put "edazpotato" in the `twitterUserToTrack`.

The fields in the `twitter` object are just the credentials you get when you make a project in the Twitter developer console.

To get the `webhook_url` for the `discord` object:

-   Right click on a Discord channel
-   Select "Edit Channel"
-   Select "Intergrations"
-   Select "Webhooks"
-   Press the button labeled "New webhook"
-   Press the button labeled "Copy webhook URL"
-   Paste that into the `webhook_url` field of the `discord` object in your `config.json` file
