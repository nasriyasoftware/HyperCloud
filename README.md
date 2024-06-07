[![N|Solid](https://static.wixstatic.com/media/72ffe6_da8d2142d49c42b29c96ba80c8a91a6c~mv2.png)](https://nasriya.net)
# HyperCloud.
[![Static Badge](https://img.shields.io/badge/license-personal_use-blue?labelColor=%23585858&color=%234ec920)](https://github.com/nasriyasoftware/HyperCloud?tab=License-1-ov-file) ![Repository Size](https://img.shields.io/github/repo-size/nasriyasoftware/HyperCloud.svg) ![Last Commit](https://img.shields.io/github/last-commit/nasriyasoftware/HyperCloud.svg) [![Status](https://img.shields.io/badge/Status-Beta-blue.svg)](link-to-your-status-page)
##### Visit us at [www.nasriya.net](https://nasriya.net).

Nasriya HyperCloud is a lightwight Node.js HTTP2 framework.

Made with ❤️ in **Palestine** 🇵🇸
___
## Key Features
- [HTTP2](https://en.wikipedia.org/wiki/HTTP/2) Freamework.
- Secure Server with **FREE** [SSL certificates](#generate-ssl-certificates).
- Works well with proxies.
- Supports [Multilingual](#languages) Sites.
- Built-In & Custom [Error Pages](#error-pages).
- Built-In [Job Scheduler](#task-scheduling).
- Built-In [DNS Manager](#dns-management).
- Built-in (In-Memory) [Rate Limiter](#rate-limiter).
- Built-in [Helmet](#helmet-protection) Protection.

## Status [![Status](https://img.shields.io/badge/Status-Beta-blue.svg)](link-to-your-status-page)
We're still running in **Beta**, so issues are expected, if you encounter one, please [open an issue](https://github.com/nasriyasoftware/HyperCloud/issues).
___
## Quick Start Quide
Quickly run a `HyperCloud` server in **5** easy steps.

#### 1. Installation
```shell
npm i @nasriya/hypercloud
```

#### 2. Importing
Importing in **ES6** modules
```js
import hypercloud from '@nasriya/hypercloud';
```

Importing in **CommonJS** modules
```js
const hypercloud = require('@nasriya/hypercloud').default;
```

#### 3. Creating & Initializing a server
```js
// Creates a new server
const server = hypercloud.Server();
```

<details>
<summary>Advanced Server Configurations</summary>

##### HTTP v1 vs HTTP v2
For now, [HTTP2](https://en.wikipedia.org/wiki/HTTP/2) is only available via [TLS](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/), so if you want **HTTP2** support, you must setup a **secure** server.

##### Examples:

##### 1. Creating a simple HTTP server
```js
const server = hypercloud.Server();
```

##### 2. Creating an HTTPS server
A basic HTTPS server with self-signed certificate on port `443`:
```js
const server = hypercloud.Server({ secure: true });
```

A basic HTTPS server running behind a proxy manager
```js
const server = hypercloud.Server({
    secure: true,
    proxy: {
        isDockerContainer: true, // This can be false, depending on your setup
        isLocal: true
    }
});
```

An HTTPS server with a valid SSL certificate (from Let's Encrypt):
```js
const server = hypercloud.Server({
    secure: true,
    ssl: {
        email: 'email@mydomain.com',
        domains: ['mydomain.com', 'auth.mydomain.com']
    }
});
```

An HTTPS server with a local certificate and private keys:
```js
const server = hypercloud.Server({
    secure: true,
    ssl: {
        cert: fs.readFileSync('path to cert', { encoding: 'utf-8' }),
        key: fs.readFileSync('path to key', { encoding: 'utf-8' }), 
    }
});
```
</details>

#### 4. Defining routes
For now, you only have a server that serves a `404` page on any path, so let's define more routes now using the server's `Router`.

```js
const router = server.Router();

// Define a route for the homepage
router.use('/', (request, response, next) => {
    response.status(200).send({ data: '<h1>Hello, WOrld!</h1>' })
})
```
<details>
<summary>Advanced Router Implementations</summary>

##### Favicon
Specify the website's `favicon` by passing the root directory that contains your `favicon`. Your `favicon` extension can be **.png** or **.ico**.

Assuming that the `src` folder contains a your `favicon`:
```js
router.favicon('./src');
```
##### Static Routes
Using the `router.static()` method allows you to mount folders statically on the website and handles everything for you, from caching to mime types.

```js
// Mount the path "./src/css" statically on "/css"
router.static(path.resolve('./src/css'), { path: '/css' });

// Mount a public folder
router.static(path.resolve('./src/public'), { path: '/public', dotfiles: 'ignore' });
```

**Note:** Static routes are only accessible with the [GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET) method.

##### Dynamic Routes
You can create dynamic routes by choosing the [http method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods).

```js
// Define an API route
router.use('/v1', (request, response, next) => {
    // Do something here, then call next
    response.status(200).json({ message: 'API route works well' })
}, {
    subDomain: 'api', // https://api.domain.com/v1
    caseSensitive: true // Makes /home and /Home not the same
})

// Define a dynamic profile page
router.get('/u/<:profileId>', (request, response, next) => {
    const { profileId } = request.params;

    // Make a database call.
    const user = {} // Something from the database

    return response.render('profilePage', {
        locals: {
            proPic: user.picture,
            name: user.name
        }
    })
}, {
    caseSensitive: true // Makes /u/user and /u/User not the same
})
```

**Note:** Routes are automatically mounted on the server.
</details>

#### 5. Start listening
To start listening for requests just call the `listen` method on the server.

```js
server.listen(); // Prints ⇨ HyperCloud Server is listening on port #80
// OR
server.listen({ port: 5000 }); // Prints ⇨ HyperCloud Server is listening on port #5000
```

For secure servers
```js
server.listen(); // Prints ⇨ HyperCloud Server is listening securely on port #443
// OR
server.listen({ port: 8443 }); // Prints ⇨ HyperCloud Server is listening securely on port #8443
```

Congratulations! Your server is now ready to handle requests.

___
## Advanced Configurations
HyperCloud has more featues and advanced configurations.

<details>
<summary>Rate Limiter</summary>

#### Rate Limiter
Protect your websites against abusive usage by setting limits on how much users can access your site or consume your APIs. The rate limiter can help you prevent small [DDoS attacks](https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/), but it's not meant for that purpose. We recommend using [Cloudflare](https://www.cloudflare.com/) to protect your resources from DDos attacks.

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

Alternatively, you can use one of the built-in limiter.
```js
router.use('*', server.rateLimiter.limitBy.ipAddress(100));
```

This will act exactly the same as the previous method. You can also specify the *response type* to give different responses based on your needs by passing `JSON` or `Page` as the second argument. The default type is `JSON`.

```js
router.use('*', server.rateLimiter.limitBy.ipAddress(100, 'Page')); // Renders an error page
```

Creating a rate limiter for each resource you want to protect can be exhausting and tedious, luckily, the rate limiter has main limiter that you can configure yourself, and will run before all the dynamic routes.

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
- Do not use in serverless deployments where we have multiple instances of your server or you'll endup with unexpected results.
- In-memory storage is faster than persistant storage, if you require persitant storage please submit a feature request.
</details>

<details>
<summary>Helmet Protection</summary>

#### Helmet Protection
In today's digital landscape, security is paramount. HyperCloud's built-in Helmet protection is designed to provide robust security measures, safeguarding your applications from a myriad of common web vulnerabilities. By integrating Helmet, HyperCloud ensures that your applications are shielded against threats such as cross-site scripting (XSS), clickjacking, and other malicious attacks. This advanced protection layer helps developers focus on building features and functionality, knowing that their applications are fortified with industry-leading security practices. With Helmet, HyperCloud takes a proactive approach to web security, offering peace of mind and enabling you to deliver secure, reliable applications to your users.

To enable **Helmet** protection:
```js
server.helmet(); // This applies all the default configurations
```

Learn how to customize the **Helmet** [here](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/helmet.md).
</details>

<details>
<summary>Enable Debugging</summary>

#### Enable Debugging
You can enable debugging to get more details about operations and errors.
```js
hypercloud.verbose = true;
```
</details>

<details>
<summary>Proxy Servers</summary>

#### Proxy Servers
If your server is running behind a proxy server, you need to configure the `proxy` option of the server before initializing it.
When running behind a local proxy server, a `self_signed` certificate is enough, however, if your your proxy server is remote you should use a valid **SSL certificate**. Read [generate SSL certificate with Let's Encrypt](#1-generate-with-lets-encrypt).
```js
const server = hypercloud.Server({
    secure: true,
    ssl: {
        self_signed: true               // A self-signed certificate is enough. You can omit this**.
    },
    proxy: { 
        isLocal: true,                  // If your server and your proxy are on the same machine
        isDockerContainer: true,        // If your server is running in a docker container
        trusted_proxies: ['10.0.0.200'] // A list of trusted proxies
    }
});
```
** You if no SSL options were provided, and the `secure` option is enabled, a self-signed certificate will be used.

#### Generate SSL Certificates
With HyperCloud, you can generate SSL certificate to serve your site securely over HTTPS. Here are two ways you can do it:
###### 1. Generate with Let's Encrypt
To generate valid **SSL certificates** with [Let's Encrypt](https://letsencrypt.org/), your server must have port `80` free and allows public traffic from the internet, or if you're running behind a proxy, you specify the challenge port..

**Note:** Wildcard domains are **NOT** supported.
```js
const server = hypercloud.Server({
    secure: true,
    ssl: {
        email: 'admin@domain.com',                  // Must be consistent for future requests
        domains: ['domain.com', 'auth.domain.com'], // All domains must point to this server
        certName: 'my-company',                     // This should remain the same for a given server
        staging: true,                              // Leave it "true" for testing, change to "false" or omit the option in production
        storePath: 'path/to/store',                 // Store the generated certificate and private key in this location
        challengePort: 3000                         // Specify the challenge port if port 80 is taken or if you're behind a proxy
    }
});
```

###### 2. Generate a Self-Signed Certificate
To generate a self-signed **SSL certificate** for your domain, just add the `self_signed` property to the `SSLOptions` and set it to `true`. This is useful if you're developing your site locally or behind a [proxy server](#proxy-servers).

Here's how to set it up:
```js
const server = hypercloud.Server({ secure: true });

// OR:

const server = hypercloud.Server({ 
    secure: true,
    ssl: { self_signed: true }
});
```
</details>


<details>
<summary>Languages</summary>

#### Languages
Some sites are multilingual, which means they somehow keep track of users' selected language, luckely, **HyperCloud** provides a built-in method to achieve exactly that.

###### Supported Languages
You can set a list of languages that your server supports to properly handle *language-related* requests, like checking users' preferred language to serve them content in their language.

Here's how to set a list of supported languages on your server:
```js
server.supportedLanguages = ['en', 'ar', 'de'];
```

###### Default Language
If a user doesn't have a preferred language, the browser's language is selected then checked against the server's [supported languages](#supported-languages), if the browser's language isn't supported, the server's `defaultLanguage` is used to render pages or serve other language-related content.

To set a default language:
```js
server.defaultLanguage = 'ar';
```

**Note:** The `defaultLanguage` must be one of the [supported languages](#supported-languages) or an error will be thrown.
</details>

<details>
<summary>HyperCloud Built-In User</summary>

#### HyperCloud Built-In User
HyperCloud provides a built-in `user` on each `request` and allows you to populate it using a [custom handler](#user-handler), you can then access the `user` object from any route via the `request` object.

The built-in `user` object looks like this:
```js
// request.user
{
    id: string,
    loggedIn: boolean,
    role: 'Admin'|'Member'|'Visitor',
    preferences: {
        language: string,
        locale: string,
        currency: string,
        colorScheme: 'Default'|'Dark'|'Light'
    }
}
```
##### Logged-in User
| Property                  | Value                               | Description                                                                            |
| ------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| `id`                      | `string`                            | The `id` of the user in the database                                                   |
| `loggedIn`                | `true`                              | Whether the user is loggedIn or not                                                    |
| `role`                    | `"Admin"` or `"Member"`             | Specified in the [handler](#user-handler)                                              |
| `preferences`             | `object`                            | An object with user prefereces from the database                                       |
| `preferences.language`    | `string`                            | The user's preferred language from the database  or `null` if no language is preferred |
| `preferences.locale`      | `string`                            | The user's preferred locale from the database or `null` if no locale is preferred      |
| `preferences.currency`    | `string`                            | The user's preferred currency in the database or `null` if no currency is preferred    |
| `preferences.colorScheme` | `"Default"`, `"Dark"`, or `"Light"` | The user's preferred color scheme in the database or `null` if not specified           |

##### Logged-out User
| Property                  | Value       | Description                                      |
| ------------------------- | ----------- | ------------------------------------------------ |
| `id`                      | `null`      | The `id` of the user in the database             |
| `loggedIn`                | `false`     | Whether the user is loggedIn or not              |
| `role`                    | `"Visitor"` | Specified in the [handler](#user-handler)        |
| `preferences`             | `object`    | An object with user prefereces from the database |
| `preferences.language`    | `null`      | No value                                         |
| `preferences.locale`      | `null`      | No value                                         |
| `preferences.currency`    | `null`      | No value                                         |
| `preferences.colorScheme` | `null`      | No value                                         |

##### User Handler
To populate the `user` object, you need to implement a **handler** to check user session, verify it, make a database call, fetch the data, and then populate the `user` object accordingly.

To set the handler, we use the reserved handler name `userSessions` as the handler name on the server's `handlers` object:

```js
server.handlers.userSessions((request, response, next) => {
    const sessionToken = request.cookies.session;

    // Verify the session's validity using our own JWT library
    const veriRes = encryptions.JWT.verify(sessionToken);

    // Check the validity
    if (veriRes.valid) {
        const payload = veriRes.payload;

        /**
         * Get the user ID from the JWT's payload.
         * The user ID extraction depends on YOUR own implementation
         * of session handling when authenticating users.
         * 
         * Our implementation:
         * The token payload has a "user" object, which has an "id" property
        */
        const user_id = payload.user.id;

        /**
         * Get the user data and preferences from the database
         * 
         * The database call can impact your site's performance
         * since it runs on each and every request, you can instead
         * store the preferences in the JSON token (JWT) or in
         * a cookie, whichever you see fit.
        */
        const user = payload.user; // Or a database call

        // Populate the user object
        request.user = {
            id: user.id,
            loggedIn: true,
            role: 'role' in user && user.role === 'Admin' ? 'Admin' : 'Member',
            preferences: {
                // All user preferences are optional
                language: user.preferences.language
            }
        }
    } else {
        // Remove the invalid cookie
        response.cookies.delete('session');

        // Assign an empty object to the user object
        request.user = {}
    }

    // Call next as usual to move to the next handler
    next();
})
```

**Note:** This handler runs before all your defined routes regardless whether they've been defined before or after you defined the `userSessions` handler.

</details>

<details>
<summary>Error Handling & Pages</summary>

#### Error Pages
**HyperCloud** provides three built-in error pages out of the box, `401`, `403`, `404`, and `500`. You can render these pages from your code and customize them with your own text, or you can set custom handlers to run whenever you cann the error pages.

###### Default Error Pages
You can customize what the pages say with your own words, the `401` and `403` uses the same page, thus the same rendering options, so we'll only cover one of them.

- Calling the `500` **server error** page:
```js
router.use('*', (request, response, next) => {
    // This renders the default 500 pages as is, without any changes
    response.pages.serverError();

    // Customize the page text
    response.pages.serverError({
        lang: 'ar', // The page language
        locals: {
            title: 'خطاً في الخادم',                        // The page title in browsers,
            subtitle: 'عذراً! حدث خطأ في الخادم',          // The page title to render for visitors
            message: 'نحن آسفون، ولكن حدث خطأ ما من جانبنا. لقد تم إخطار فريقنا، ونحن نعمل على حل المشكلة في أقرب وقت ممكن.',
        }
    });
})
```

- Calling the `404` **not-fonud** page:
```js
router.use('*', (request, response, next) => {
    // This renders the default 404 pages as is, without any changes
    response.pages.notFound();

    // Customize the page text
    response.pages.notFound({
        lang: 'ar', // The page language
        locals: {
            title: 'غير موجود - 404',                       // The page title in browsers,
            subtitle: 'لم يتم العثور على هذه الصفحة',      // The page title to render for visitors
            home: 'الرئيسية',                               // The home button label
        }
    });
})
```
- Calling the `403` **forbidden** page:
```js
router.use('*', (request, response, next) => {
    // This renders the default 403 pages as is, without any changes
    response.pages.forbidden();

    // Customize the page text
    response.pages.forbidden({
        lang: 'ar',
        locals: {
            title: 'غير مسموح',
            commands: {
                code: 'رمز الخطاً',
                description: 'وصف الخطً',
                cause: 'الخطأ من المحتمل أن يكون سببه',
                allowed: 'بعض الصفحات على الخادم التي لديك تصريح بزيارتها',
                regards: 'إستمتع بيومك :-)'
            },
            content: {
                code: '403 غير مسموح',
                description: 'الوصول مرفوض. ليس لديك إذن للوصول الى هذه الصفحة على هذا الخادم',
                cause: 'تنفيذ الوصول ممنوع، الوصول للقراءة، الوصول ممنوع، SSL مطلوب، SSL 128 مطلوب، عنوان IP مرفوض، شهادة العميل مطلوبة، تم رفض الوصول إلى الموقع،  عدد كبير جدًا من المستخدمين، تكوين غير صالح، تغيير كلمة المرور، تم رفض الوصول إلى مصمم الخرائط، تم إبطال شهادة العميل، الدليل تم رفض القائمة، تجاوز تراخيص وصول العميل، شهادة العميل غير موثوقة أو غير صالحة، انتهت صلاحية شهادة العميل أو ليست صالحة بعد، فشل تسجيل الدخول بجواز السفر، تم رفض الوصول إلى المصدر، تم رفض العمق اللانهائي، طلبات كثيرة جدًا من نفس عنوان IP للعميل',
                allowed: [{ label: 'الرئيسية', link: '/' }, { label: 'عنا', link: '/about' }, { label: 'إتصل بنا', link: '/support/contact' }],
            }
        }
    });
})
```

- Calling the `401` **unauthorized** page:
Calling the `401` page works exactly the same as the `403` page, just the error code is different.

###### Custom Error Pages
The [default error pages](#default-error-pages) are not meant for production, yes, we know, they're not well designed and might not match with your brand theme, so you can define your own handlers for each and every one of those error pages.

To define custom handlers, we use the server's `setHandler` method as usual, however, each error page has its own reserved handler name. Here is a list of the names.

| Resource           | Handler Name   | Description                 |
| ------------------ | -------------- | --------------------------- |
| Not Found `404`    | `notFound`     | Used for custom `404` pages |
| Unauthorized `401` | `unauthorized` | Used for custom `401` pages |
| Forbidden `403`    | `forbidden`    | Used for custom `403` pages |
| Server Error `500` | `serverError`  | Used for custom `500` pages |

```js
// 1) Define a custom 404 handler
server.handlers.notFound((request, response, next) => {
    response.render('notFoundView', { statusCode: 404 });
})

// 2) Render the custom page
router.use('*', (request, response, next) => {
    response.pages.notFound(); // This will now render the custom page
})
```

#### Error Handling
Error handling in HyperCloud are done by defining an `http` error handler, to do that, we set the `onHTTPError` handler. The handler can be defined in another file and passed as a function to the `server.handlers.onHTTPError()` method.

```js
/**A function to handle errors thrown due to an error in any of the HTTP middlewares */
function onHTTPErrorHandler(request: HyperCloudRequest, response: HyperCloudResponse, next: NextFunction, error: HTTPError) {
    response.pages.serverError({
        lang: request.lang,
        locals: {
            message: `Request ID: ${request.id} failed. ${request.method} ${request.path.join('/')}`
        }
    })
}

server.handlers.onHTTPError(onHTTPErrorHandler);
```
</details>

<details>
<summary>Requests Logging</summary>

#### Requests Logging
You can add a logger to log incoming requests by setting a `logger` handler.

```js
server.handlers.logger((request: HyperCloudRequest, response: HyperCloudResponse, next: NextFunction) => {
    // Use the request to gather information and log them.
})
```

You can also use another logging packages like [Logify](https://github.com/nasriyasoftware/Logify) to help you with logging.

```js
import logify from 'nasriya-logify';

server.handlers.logger(logify.middlewares.hypercloud);
```
</details>

___
## Features
HyperCloud is equiped with common features out of the box. Here are some.

<details>
<summary>Generating eTags</summary>

#### Generating eTags
[ETags](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) can signifucantly improve server performance. To generate `eTags` for your resources, use the following syntax:

```js
import path from 'path';

hypercloud.generateETags(path.resolve('./src/images'));
```

The code will generate a unique `eTags.json` file in each sub-directory including the provided `root` directory.

The generated `eTags.json` file will be something like this:
```json
{
    "<filename.png>": "<file_eTag>",
    "logo.svg": "the-hashed-content"
}
```
</details>

<details>
<summary>Task Scheduling</summary>

#### Task Scheduling
You can schedule [cron jobs](https://en.wikipedia.org/wiki/Cron) to run periodically or at specific times.

To use the cron scheduler, you can access it on the main `hypercloud` instance:

```js
import hypercloud from '@nasriya/hypercloud';
const cronManager = hypercloud.cronManager;
```

###### Generate Time Expressions
Use the `time` module on the cron manager to easily generate cron-expressions.

```js
const cronManager = hypercloud.cronManager;

// Runs every 5 minutes
const expression1 = cronManager.time.every(5).minutes();

// Runs every Monday and Tuesday
const expression2 = cronManager.time.onSpecificDays(['Tue', 2]);
```

###### Schedule a Periodic Task
To schedule tasks using a cron-expression, use the `schedule` method:

```js
import hypercloud from '@nasriya/hypercloud';

const task = hypercloud.cronManager.schedule('* * * * *', () => {
    console.log('A cron-job is running...');
}, {
    name: 'test_task',          // (Optional) The name of the task
    timezone: 'Asia/Jerusalem', // (Optional) The timezone the task will run at
    runOnInit: false            // (Optional) Set to "true" to run immediately
})
```

The `schedule` methods returns:
```js
{
    name: string,
    start: () => void,
    stop: () => void
}
```

###### Schedule a One-Time Task
To schedule one-time tasks use the `scheduleTime` method. The method takes two arguments:
1. `time`: A timestamp `number`, an [ISO date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString), or a `Date` instance.
2. `task`: a `Function`.

```js
import hypercloud from '@nasriya/hypercloud';

// Schedule a task to run after 10 minutes from now:
const tenMins = 10 * 60 * 1000;
const task = hypercloud.cronManager.scheduleTime(Date.now() + tenMins, () => {
    console.log('Ten minutes has elapsed since the task was first scheduled')
})
```

The `scheduleTime` methods returns:
```js
{
    name: string,
    cancel: () => boolean,
    invoke: () => void
}
```
</details>

<details>
<summary>DNS Management</summary>

###### DNS Management
If your server is running behind a dynamic IP address you make use of **HyperCloud DNS manager** to update the [DNS records](https://www.cloudflare.com/learning/dns/dns-records/) of your domain.

**Note:** For now, only [Cloudflare](https://cloudflare.com) and [Duckdns](https://duckdns.org) are supported.

Start by preparing the DNS manager and the new IP address:

```js
import hypercloud from '@nasriya/hypercloud';
const dnsManager = hypercloud.dnsManager;

const public_ip = await dnsManager.helpers.getPublicIP();
```

**DuckDNS**
```js
// Initialize a provider:
const duckdns = dnsManager.duckdns(process.env.DUCKDNS_API_TOKEN);

// Update the IP address
await duckdns.records.update('<myDomain>', public_ip);
```

**Cloudflare**
```js
const cloudflare = dnsManager.cloudflare(process.env.CLOUDFLARE_API_TOKEN);

// If you know the Zone ID of your domain;
const zone_id = process.env.CLOUDFLARE_ZONE_ID;

// If you don't know the Zone ID
const zone_id = await cloudflare.zone.list({
    name: '<domain.com>',
    just_ids: true
}).then(list => list[0]);

// Get all A records:
const records = await cloudflare.records.list(zone_id, {
    type: 'A',
    simplified: true
})

// Prepare the promises
const promises = records.map(record => {
    return new Promise((resolve, reject) => {
        cloudflare.records.update({
            zone_id,
            record
            record_id: record.id,
        }).then(res => resolve(res)).catch(err => reject(err));
    })
})

// Invoke promises
await Promise.allSettled(promises).then(res => {
    const fulfilled = res.filter(i => i.status === 'fulfilled').map(i => i.value);
    const rejected = res.filter(i => i.status === 'rejected').map(i => i.reason);

    if (fulfilled.length === res.length) {
        return Promise.resolve({ status: 'success', result: fulfilled });
    } else {
        return Promise.resolve({ status: 'failed', result: rejected });
    }
})
```
</details>

___
## Upcoming Features & Improvements
New features planned for the complete version:
<details>
<summary>Improving Server Side Rendering (SSR)</summary>

Improve the existing [server-side rendering (SSR)](https://ferie.medium.com/what-is-the-server-side-rendering-and-how-it-works-f1d4bf9322c6) with EJS by adding a component concept and a page manager to dynamically set titles, descriptions, meta data, linked stylesheets, and scripts.

- **Pros**:
  - **SEO Optimization**: Dynamic handling of meta data is crucial for multilingual sites and enhances SEO.
  - **Modular Development**: Introducing components can make the development process more efficient by promoting reuse and better organization of code.

- **Cons**:
  - Complexity: Enhancing the rendering capabilities could introduce some complexity. However, since rendering is server-side, performance concerns can be managed effectively.

- **Implementation Strategy**:
  - **Component-Based System**: Develop a simple API for defining and reusing components within EJS.
  - **Page Manager**: Create a utility to manage and dynamically inject meta data and resources (stylesheets, scripts) into pages.
  - **Configuration**: Allow for easy configuration of these features to support various languages and page-specific requirements.
</details>

<details>
<summary>Security Feature (Block connections by IP address or country)</summary>

Add a feature to block connections from specific IP addresses or countries to enhance security.

- **Pros**:
  - **Better Analytics**: Helps in collecting detailed analytics and tailoring responses based on the client’s platform.
  - **Enhanced User Experience**: Enables conditional rendering or serving of resources based on the client’s device or browser capabilities.

- **Cons:**
  - Overhead: Minimal performance impact, but manageable with efficient implementation.

- **Implementation Strategy**:
  - **User-Agent Parsing**: Use a library to parse the User-Agent string and extract platform details.
  - **Integration**: Integrate this parsing logic into the request handling process.
  - **Configuration**: Allow for enabling/disabling this feature based on user preference.
</details>

If you want to request a new feature feel free to reach out:
- Email: developers@nasriya.net
- LinkedIn: 🔗 [Ahmad Nasriya](https://www.linkedin.com/in/ahmadnasriya/)
___
## License
Please read the license from [here](https://github.com/nasriyasoftware/HyperCloud?tab=License-1-ov-file).
