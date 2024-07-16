## Proxy Servers

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