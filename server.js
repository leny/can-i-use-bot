var restify = require('restify');
var builder = require('botbuilder');
var caniuse = require('caniuse-api')

// ************************************************

// Get secrets from server environment
var botConnectorOptions = {
    appId: process.env.BOTFRAMEWORK_APPID,
    appSecret: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var bot = new builder.BotConnectorBot(botConnectorOptions);


// caniuse-api test
console.log(caniuse.getBrowserScope());

caniuse.setBrowserScope('> 5%, last 2 versions, Firefox ESR, Opera 12.1');


console.log(caniuse);

// ************************************************


var test = {
    "and_chr": {
        "y": 50
    },
    "and_uc": {
        "n": 9.9
    },
    "android": {
        "n": 4.4,
        "y": 50
    },
    "chrome": {
        "n": 9,
        "y": 10,
        "x": 33
    },
    "edge": {
        "y": 12
    },
    "firefox": {
        "n": 24,
        "y": 25
    },
    "ie": {
        "n": 11
    },
    "ie_mob": {
        "n": 11
    },
    "ios_saf": {
        "y": 6,
        "x": 9.3,
        "n": 5
    },
    "op_mini": {
        "n": 5
    },
    "opera": {
        "n": 12.1,
        "y": 15,
        "x": 21
    },
    "safari": {
        "n": 5.1,
        "y": 6,
        "x": 9.1
    }
};

function result_format(obj) {

    var result_text;


    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {

            console.log(key);
            result_text += "##" + key + "\n";

            var value = obj[key];
            result_text += JSON.stringify(obj[key]) + "\n";

            console.log(value);

        }
    }

    console.log(result_text);
    return result_text;

}

result_format(test);

// ************************************************


bot.add('/', [
    function (session) {

        var query = session.message.text;

        // Slackアタッチメントのテスト
        if (query == "test") {

            var msg = new builder.Message().addAttachment({

                "fallback": "Required plain-text summary of the attachment.",
                "color": "#36a64f",
                "pretext": "Optional text that appears above the attachment block",
                "author_name": "Bobby Tables",
                "author_link": "http://flickr.com/bobby/",
                "author_icon": "http://flickr.com/icons/bobby.jpg",
                "title": "Slack API Documentation",
                "title_link": "https://api.slack.com/",
                "text": "Optional text that appears within the attachment",
                "fields": [
                    {
                        "title": "Priority",
                        "value": "High",
                        "short": false
                    }
                ],
                "image_url": "http://my-website.com/path/to/image.jpg",
                "thumb_url": "http://example.com/path/to/thumb.png",
                "footer": "Slack API",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "ts": 123456789

            });
            session.endDialog(msg);

        }


        // 検索して候補を取得
        console.log(session.message.text);
        var search_res = caniuse.find(query); // ヒット数が複数or0の場合、配列が。1つだけヒットの場合、文字型が返される。

        console.log(search_res);
        console.log(Array.isArray(search_res));
        console.log("\nlengh:" + search_res.length);


        // 候補の数を調べる
        if (search_res.length == 1 || Array.isArray(search_res) == false) {

            // ****候補が1つだけの時****

            // Can I useの結果を表示
            var res = caniuse.getSupport(query, true);
            console.log(res);
            session.endDialog(result_format(res));


        } else if (search_res.length >= 2) {

            // ****候補が複数ある時****

            // 候補を表示。選択肢を提示
            console.log(search_res);
            builder.Prompts.choice(session, "pick one.", search_res);

        } else {

            // ****候補が0の時****

            // 見つかりませんでした... XP
            session.endDialog("sorry, not found.");

        }

},
    function (session, results) {

        var res = caniuse.getSupport(results.response.entity, true);

        // Can I useの結果を表示
        console.log(res);
        session.endDialog(result_format(res));

}]);


// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
// Bot用のエンドポイントだよーん
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
// Webブラウザでアクセスされた時には、静的HTMLを表示させる
server.get(/.*/, restify.serveStatic({
    'directory': './static/',
    'default': 'index.html'
}));

// サーバ起動やねん
server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
