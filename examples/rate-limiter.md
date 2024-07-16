## Rate Limiter

Protect your websites against abusive usage by setting limits on how much users can access your site or consume your APIs. The rate limiter can help you prevent small [DDoS attacks](https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/), but it's not meant for that purpose. We recommend using [Cloudflare](https://www.cloudflare.com/) to protect your resources from DDoS attacks.

To access the rate limiter:
```js
server.rateLimiter; // The rate limiter module
```

1) Define limiting rules.
```js
const rule = server.rateLimiter.defineRule({
    name: 'ipAddress',
    scope: 'global',
    cooldown: 5 * 1000 * 60, // 5min: The amount of time the user will be denied the service,
    /**Specify the maxRequests / windowMs, for example: 100 requests per minute */
    rate: {
        windowMs: 1 * 1000 * 60,
        maxRequests: 100
    }
})
```

2) Create a handler
```js
const rateLimitHandler = (request, response, next) => {
    const authRes = server.rateLimiter.authorize({
        value: request.ip,
        rules: [{ name: rule.name, priority: 1 }]
    })

    if (authRes.authorized) {
        next();
    } else {
        response.setHeader('Retry-After', authRes.retryAfter).status(429);
        response.json({ code: 429, message: 'Too Many Requests', retryAfter: authRes.retryAfter })
    }
}
```

3) Use the handler on a router
```js
router.use('*', rateLimitHandler);
```

Alternatively, you can use one of the built-in limiters.
```js
router.use('*', server.rateLimiter.limitBy.ipAddress(100));
```

This will act exactly the same as the previous method. You can also specify the *response type* to give different responses based on your needs by passing `JSON` or `Page` as the second argument. The default type is `JSON`.

```js
router.use('*', server.rateLimiter.limitBy.ipAddress(100, 'Page')); // Renders an error page
```

Creating a rate limiter for each resource you want to protect can be exhausting and tedious, luckily, the rate limiter has a main limiter that you can configure yourself, and will run before all the dynamic routes.

```js
server.rateLimiter.mainLimiter(server.rateLimiter.limitBy.ipAddress(100, 'Page'));
```

To create an advanced rate limiter for different user roles:
```js
// Set different rate limits based on user role
rateLimiter.defineRule({ name: 'visitor_ipAddress', cooldown: 5000, rate: { windowMs: 1 * 60 * 1000, maxRequests: 5 } })
rateLimiter.defineRule({ name: 'member_ipAddress', cooldown: 5000, rate: { windowMs: 1 * 60 * 1000, maxRequests: 10 } })

rateLimiter.mainLimiter((request, response, next) => {
    if (request.user.role === 'Visitor' || request.user.role === 'Member') {
        const authRes = rateLimiter.authorize({
            value: request.ip,
            rules: [{ name: `${request.user.role.toLowerCase()}_ipAddress`, priority: 1 }]
        })

        if (authRes.authorized) {
            next();
        } else {
            response.status(429).setHeader('Retry-After', authRes.retryAfter);
            response.json({ code: 429, ...authRes });
        }
    } else {
        // If admin, do not limit at all
        next();
    }
})
```

**Important**
- This is an *in-memory* rate limiter and does **NOT** store the data anywhere else
- Do not use it in serverless deployments where you may have multiple instances of your server or you'll endup with unexpected results.
- In-memory storage is faster than persistant storage. If you require persitant storage please submit a feature request.