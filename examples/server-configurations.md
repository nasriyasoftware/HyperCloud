## Advanced Server Configurations

##### HTTP v1 vs HTTP v2
For now, [HTTP2](https://en.wikipedia.org/wiki/HTTP/2) is only available via [TLS](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/), so if you want **HTTP2** support, you must setup a **secure** server.

##### Examples:

##### 1. Creating a simple HTTP server
HyperCloud servers can be used in two different methods.

###### The main method
The main method is about creating a server on the main `hypercloud` instance, this way, to access the server, you can simply import the instance and access the server.

```js
// server.js
hypercloud.server = hypercloud.Server();
```

```js
// api.js
// Import the instance
import hypercloud from '@nasriya/hypercloud';

// Access the server
const server = hypercloud.server;
```

###### The simple method
This method allows you to create a server that's only accessible in the scope it was created from - unless if it was exported.
```js
const server = hypercloud.Server();
```

##### 2. Creating an HTTPS server
A basic HTTPS server with self-signed certificate:
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
        cert: fs.readFileSync('path/to/cert', { encoding: 'utf-8' }),
        key: fs.readFileSync('path/to/key', { encoding: 'utf-8' }), 
    }
});
```