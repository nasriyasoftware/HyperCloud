# Nasriya HyperCloud!
Nasriya HyperCloud is a lightwight Node.js HTTP2 framework.
___
## Quick Start Quide
Quickly run a `HyperCloud` server.

#### 1. Installation
```shellscript
npm install nasriyasoftware/hypercloud
```

#### 2. Importing
```js
const hypercloud = require('nasriya-hypercloud');
```

#### 3. Creating & Initializing a server
```js
const fs = require('fs');
// Creates a new server
const server = hypercloud.Server();

// Prepare the initialization options
/**@type {hypercloud.HyperCloudInitOptions} */
const options = {
    protocols: hypercloud.Protocols({
        https: { port: 443 },
    }),
    ssl: hypercloud.SSLCredentials({
        cert: fs.readFileSync('path to cert', { encoding: 'utf-8' }),
        key: fs.readFileSync('path to key', { encoding: 'utf-8' }), 
    })
}

// Initialize the server
await server.initialize(options);
```

#### 4. Define routes
For now, you only have an HTTP2 server that serves a `404` page on any path, so let's define more routes now using the server's `Router`.
```js
const router = server.Router();

// Define the site's favicon
router.favicon(path.resolve('./src'));

// Mount the path "./src/css" statically on "/css"
router.static(path.resolve('./src/css'), { path: '/css' });

// Mount a public folder
router.static(path.resolve('./src/public'), { path: '/public', dotfiles: 'ignore' });

// Define a route that works for any path
router.use('*', (request, response, next) => {
    // Do something here, then call next
    next();
})

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
    const profileId = request.params.profileId;

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

**Note:** Routers don't need to be mounted on servers since they have a reference to the server that they were created from. Routes created in routers are automatically mounted.

#### 5. Start listening
To start listening for requests just call the `listen` method on the server.
```js
server.listen();
// HTTP Server Prints: HyperCloud Server is listening on port #<The port you defined for HTTP>
// HTTPS Server Prints: HyperCloud Server is listening securely on port #<The port you defined for HTTPS>
```
Congratulations! Your server is now ready to handle requests.

___
## Advanced Configurations
HyperCloud has more featues and advanced configurations.

#### Enable Debugging
You can enable debugging to get more details about operations and errors.
```js
hypercloud.verbose = true;
```

#### Proxy Servers
If your server is running behind a proxy server, you need to configure the `proxy` option of the server before initializing it.
When running behind a local proxy server, a `self_signed` certificate is enough, however, if your your proxy server is remote you should use a valid **SSL certificate**. Read [generate SSL certificate with Let's Encrypt](#1-generate-with-lets-encrypt).
```js
/**@type {hypercloud.HyperCloudInitOptions} */
const options = {
    protocols: hypercloud.Protocols({
        https: { port: 5000 },
    }),
    ssl: hypercloud.SSLOptions({
        self_signed: true               // A self-signed certificate is enough
    }),
    proxy: { 
        isLocal: true,                  // If your server and your proxy are on the same machine
        isDockerContainer: true,        // If your server is running in a docker container
        trusted_proxies: ['10.0.0.200'] // A list of trusted proxies
    }
}

// Initialize the server
await server.initialize(options);
```

#### Generate SSL Certificates
With HyperCloud, you can generate SSL certificate to serve your site securely over HTTPS. Here are two ways you can do it:
###### 1. Generate with Let's Encrypt
To generate valid **SSL certificates** with [Let's Encrypt](https://letsencrypt.org/), your server must have port `80` free and allows public traffic from the internet.

**Note:** Wildcard domains are **NOT** supported.
```js
/**@type {hypercloud.HyperCloudInitOptions} */
const options = {
    protocols: hypercloud.Protocols({
        https: { port: 5000 },
    }),
    ssl: hypercloud.SSLOptions({
        email: 'admin@domain.com',                  // Must be consistent for future requests
        domains: ['domain.com', 'auth.domain.com'], // All domains must point to this server
        certName: 'my-company',                     // This should remain the same for a given server
        staging: true,                              // Leave it "true" for testing, change to "false" or omit the option in production
        storePath: 'path/to/store'                  // Store the generated certificate and private key in this location
    })
}

// Initialize the server
await server.initialize(options);
```

###### 2. Generate a Self-Signed Certificate
To generate a self-signed **SSL certificate** for your domain, just add the `self_signed` property to the `SSLOptions` and set it to `true`. This is useful if you're developing your site locally or behind a [proxy server](#proxy-servers).

Here's how to set it up:
```js
/**@type {hypercloud.HyperCloudInitOptions} */
const options = {
    protocols: hypercloud.Protocols({
        https: { port: 5000 },
    }),
    ssl: hypercloud.SSLOptions({
        self_signed: true
    })
}

// Initialize the server
await server.initialize(options);
```
___
## Features
HyperCloud is equiped with common featues out of the box. Here are some:

#### Generating eTags
[ETags](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) can signifucantly improve server performance. To generate `eTags` for your resources use the following syntax:

```js
const path = require('path');
const hypercloud = require('nasriya-hypercloud');

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

#### Task Scheduling
You can schedule [cron jobs](https://en.wikipedia.org/wiki/Cron) to run periodically or at specific times.

To use the cron scheduler, you can access it on the main `hypercloud` instance:

```js
const hypercloud = require('nasriya-hypercloud');
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
const hypercloud = require('nasriya-hypercloud');

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
2. `task`: a `function`.
```js
const hypercloud = require('nasriya-hypercloud');

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

###### DNS Management
If your server is running behind a dynamic IP address you make use of **HyperCloud DNS manager** to update the [DNS records](https://www.cloudflare.com/learning/dns/dns-records/) of your domain.

**Note:** For now, only [Cloudflare](https://cloudflare.com) and [Duckdns](https://duckdns.org) are supported.

Start by preparing the DNS manager and the new IP address:
```js
const hypercloud = require('nasriya-hypercloud');
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