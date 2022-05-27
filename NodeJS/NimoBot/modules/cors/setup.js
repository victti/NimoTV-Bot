const { config } = require('process');

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
let checkRateLimit = require('./cors-anywhere/lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

let cors_proxy = require('./cors-anywhere/lib/cors-anywhere');

function StartProxy(host, port)
{
    console.log('Starting CORS Anywhere...');

    cors_proxy.createServer({
        originBlacklist: [],
        originWhitelist: [],
        requireHeader: ['origin', 'x-requested-with'],
        checkRateLimit: checkRateLimit,
        removeHeaders: [
            'cookie',
            'cookie2',
            // Strip Heroku-specific headers
            'x-request-start',
            'x-request-id',
            'via',
            'connect-time',
            'total-route-time',
            // Other Heroku added debug headers
            // 'x-forwarded-for',
            // 'x-forwarded-proto',
            // 'x-forwarded-port',
        ],
        redirectSameOrigin: true,
        httpProxyOptions: {
            // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
            xfwd: false,
        },
    }).listen(port, host, async function() {
        console.log('Running CORS Anywhere on ' + host + ':' + port);
    });
}

module.exports = StartProxy;