const config = require("./config.json");
const { WebhookClient } = require("discord.js");
const Twitter = require("twitter-v2");

const twitterClient = new Twitter({
	// consumer_key: config.twitter.api_key,
	// consumer_secret: config.twitter.api_secret,
	bearer_token: config.twitter.bearer_token,
});

const discordWebhookClient = new WebhookClient({
	url: config.discord.webhook_url,
});

async function handleTweet(tweet) {
	const twitterUser = tweet.includes.users.filter(
		(user) => user.id === tweet.data.author_id
	)[0];
	console.log(`Tweet from @${twitterUser.username}`);
	try {
		await discordWebhookClient.send({
			content: `https://twitter.com/${twitterUser.id}/status/${tweet.data.id}`,
			username: `@${twitterUser.username} on Twitter`,
			avatarURL: twitterUser.profile_image_url,
		});
	} catch (e) {
		console.warn(`Error sending webhook message to Discord: ${e}`);
	}
}

async function listenForever(streamFactory, dataConsumer) {
	console.info(
		`Started listening to tweets from @${config.twitterUserToTrack}...`
	);
	try {
		for await (const tweet of streamFactory()) {
			dataConsumer(tweet);
		}
		// The stream has been closed by Twitter. It is usually safe to reconnect.
		console.log(
			"Stream disconnected healthily. Reconnecting in 5 seconds..."
		);
		setTimeout(() => listenForever(streamFactory, dataConsumer), 5 * 1000);
	} catch (error) {
		// An error occurred so we reconnect to the stream. Note that we should
		// probably have retry logic here to prevent reconnection after a number of
		// closely timed failures (may indicate a problem that is not downstream).
		console.warn(
			"Stream disconnected with error. Retrying in 30 seconds...",
			error
		);
		setTimeout(() => listenForever(streamFactory, dataConsumer), 30 * 1000);
	}
}

twitterClient
	.post("tweets/search/stream/rules", {
		add: [
			{
				value: `-is:retweet -is:reply from:${config.twitterUserToTrack}`,
				tag: "Tweets from user that aren't retweets or replies",
			},
		],
	})
	.then(() => {
		console.info(
			"Successfully applied tweet rules, starting stream in 60 seconds..."
		);
		setTimeout(
			() =>
				listenForever(
					() =>
						twitterClient.stream(
							"tweets/search/stream?tweet.fields=created_at&expansions=author_id&user.fields=profile_image_url"
						),
					handleTweet
				),
			// 10
			60 * 1000
		);
	});
