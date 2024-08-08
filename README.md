<a href="https://package.nasriya.net/hypercloud"><img src="https://static.wixstatic.com/shapes/72ffe6_f9d8d6b66e7c495598327e3ab4712c81.svg" width="350px" alt="Nasriya HyperCloud"></a>

[![Static Badge](https://img.shields.io/badge/license-personal_use-blue?labelColor=%23585858&color=%234ec920)](https://github.com/nasriyasoftware/HyperCloud?tab=License-1-ov-file) ![Repository Size](https://img.shields.io/github/repo-size/nasriyasoftware/HyperCloud.svg) ![Last Commit](https://img.shields.io/github/last-commit/nasriyasoftware/HyperCloud.svg) [![Status](https://img.shields.io/badge/Status-Stable-green.svg)](link-to-your-status-page)

##### Visit us at [www.nasriya.net](https://nasriya.net).

Nasriya HyperCloud is a lightweight Node.js HTTP2 framework.

Made with ❤️ in **Palestine** 🇵🇸
___
## Overview
HyperCloud is a robust server-side rendering (SSR) framework designed to build and define components and pages efficiently. The framework supports multilingual pages, handles component rendering, and manages assets seamlessly, ensuring a smooth development experience.
___

## Key Features
- **[HTTP2](https://en.wikipedia.org/wiki/HTTP/2)** Framework.
- **Component-Based Architecture:** Define and build reusable components and pages with ease.
- **[Multilingual Support](#languages):** Define localized content for your pages using locals for each language. The framework ensures the correct content is rendered based on the user's language preference.
- **Automatic Asset Management:** Automatically include stylesheets, scripts, and meta tags from components and global settings in the rendered pages.
- **Preserved Asset Order:** Maintain the order of assets as defined, ensuring predictable rendering.
- **Secure Server** with **FREE** [SSL certificates](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/proxies.md#generate-ssl-certificates).
- Works well with proxies.
- Built-In & Custom [Error Pages](#error-handling--pages).
- Built-in (In-Memory) [Rate Limiter](#rate-limiter).
- Built-in [Helmet](#helmet-protection) Protection.

___
## Status [![Status](https://img.shields.io/badge/Status-Stable-green.svg)](link-to-your-status-page)
If you encounter an issue or a bug, please [open an issue](https://github.com/nasriyasoftware/HyperCloud/issues).
___
## Quick Start Guide
Quickly run a `HyperCloud` server in **5** easy steps.

#### 1. Installation
```shell
npm i @nasriya/hypercloud
```

#### 2. Importing
Importing in **ESM** modules
```js
import hypercloud from '@nasriya/hypercloud';
```

Importing in **CommonJS** modules
```js
const hypercloud = require('@nasriya/hypercloud').default;
```

#### 3. Creating & Initializing a server
```js
// Create a new server
const server = hypercloud.Server();

// (Optional) Set the main server so you can use it anywhere
hypercloud.server = server;
```
**::** [Advanced Server Configurations](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/server-configurations.md) **::**

#### 4. Defining routes
For now, you only have a server that serves a `404` page on any path, so let's define more routes now using the server's `Router`.

```js
const router = server.Router();

// Define a route for the homepage
router.use('/', (request, response, next) => {
    response.status(200).send({ data: '<h1>Hello, WOrld!</h1>' })
})
```

**::** [Advanced Router Implementations](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/router-implementations.md) **::**


#### 5. Start listening
To start listening for requests just call the `listen` method on the server.

```js
server.listen();        // Prints ⇨ HyperCloud Server is listening on port #80
// OR
server.listen(5000);    // Prints ⇨ HyperCloud Server is listening on port #5000
```

For secure servers
```js
server.listen();        // Prints ⇨ HyperCloud Server is listening securely on port #443
// OR
server.listen(8443);    // Prints ⇨ HyperCloud Server is listening securely on port #8443
```

Congratulations! Your server is now ready to handle requests.

___
## Features
HyperCloud has more features and advanced configurations.

#### Enable Debugging
You can enable debugging to get more details about operations and errors.
```js
hypercloud.verbose = true;
```

#### Rate Limiter
Protect your websites against abusive usage by setting limits on how much users can access your site or consume your APIs. The rate limiter can help you prevent small [DDoS attacks](https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/), but it's not meant for that purpose. We recommend using [Cloudflare](https://www.cloudflare.com/) to protect your resources from DDoS attacks.

Learn how to setup a **Rate Limiter** [here](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/rate-limiter.md).

#### Helmet Protection
In today's digital landscape, security is paramount. HyperCloud's built-in Helmet protection is designed to provide robust security measures, safeguarding your applications from a myriad of common web vulnerabilities. By integrating Helmet, HyperCloud ensures that your applications are shielded against threats such as cross-site scripting (XSS), clickjacking, and other malicious attacks. This advanced protection layer helps developers focus on building features and functionality, knowing that their applications are fortified with industry-leading security practices. With Helmet, HyperCloud takes a proactive approach to web security, offering peace of mind and enabling you to deliver secure, reliable applications to your users.

To enable **Helmet** protection:
```js
server.helmet(); // This applies all the default configurations
```

Learn how to customize the **Helmet** [here](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/helmet.md).

#### Proxy Servers
If your server is running behind a proxy server, you need to configure the `proxy` option of the server before initializing it.

Learn how to setup your server behind a **Proxy Server** [here](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/proxies.md).

#### Languages
We understand that some sites are multilingual. With **HyperCloud**, you can easily build multilingual sites.

###### Supported Languages
You can set a list of languages that your server supports to properly handle *language-related* requests, like checking users' preferred language to serve them content in their language.

Here's how to set a list of supported languages on your server:
```js
server.languages.supported = ['en', 'ar', 'de'];
```

###### Default Language
If a user doesn't have a preferred language, the browser's language is selected then checked against the server's [supported languages](#supported-languages), if the browser's language isn't supported, the server's `default` language is used to render pages or serve other language-related content.

To set a default language:
```js
server.languages.default = 'ar';
```

**Note:** The `default` language must be one of the [supported languages](#supported-languages) or an error will be thrown.

#### HyperCloud Built-In User
HyperCloud provides a built-in `HyperCloudUser` on each `request` and allows you to populate it using a [custom handler](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/request-user.md#user-handler), you can then access the `user` object from any route via the `request` object.

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
Learn how to populate the `request.user` object and work with it [here](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/request-user.md).

#### Error Handling & Pages

**HyperCloud** provides four built-in error pages out of the box, `401`, `403`, `404`, and `500`. You can render these pages from your code and customize them with your own text, or you can set custom handlers to run whenever you needed.

To render error pages, just call them from the `pages` module in the `response` object.

```js
router.use('*', (request, response, next) => {
    // Render the 401 page.
    response.pages.unauthorized();

    // Render the 403 page.
    response.pages.forbidden();

    // Render the 404 page.
    response.pages.notFound();

    // Render the 500 page.
    response.pages.serverError();
})
```

Learn more about **Error Handling & Pages** [here](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/error-handling-and-pages.md).


#### Requests Logging
You can add a logger to log incoming requests by setting a `logger` handler.

```js
server.handlers.logger((request, response, next) => {
    // Use the request to gather information and log them.
    
    next(); // make sure to call next
})
```

You can also use another logging packages like [Logify](https://www.npmjs.com/package/@nasriya/logify) to help you with logging.

```js
import logify from '@nasriya/logify';

server.handlers.logger(logify.middlewares.hypercloud);
```

#### Generating eTags
[ETags](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) can significantly improve server performance. To generate `eTags` for your resources, use the following syntax:

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

#### Server Side Rendering (SSR)
You can define multilingual-ready pages by specifying locals for each language. The content of the page changes based on the language.

##### How it works

1. Define your pages and components.
2. Register the pages and components.
   
   ```js
    // Register pages
    server.rendering.pages.register('/path/to/your/pages/folder');

    // Register components
    server.rendering.components.register('/path/to/your/components/folder');
   ```
3. Render the pages
   
   ```js
    router.get('/', (request, response, next) => {
        response.render('home');
    })
   ```

Learn how to **define components and pages** [here](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/server-side-rendering-ssr.md).
___
## Upcoming Features & Improvements
New features planned for the complete version:

<details>
<summary>Security Feature (Block connections by IP address or country)</summary>

Add a feature to block connections from specific IP addresses or countries to enhance security.

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
