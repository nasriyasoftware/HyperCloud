# Creating a HyperCloud Server
HyperCloud allows you to customize your server with lots of advanced options. Let's dive in.

## Importing HyperCloud
Before getting started, you first need to import the package into your project.
```ts
import hypercloud from 'nasriya-hypercloud';
```

### Examples:

##### 1) Creating a simple HTTP server
A server that listens on port `80`:
```ts
const server = hypercloud.Server();
```

A server that listens on port `5000`:
```ts
const server = hypercloud.Server({ port: 5000 });
```

A server that listens on port `3000` and has a callback:
```ts
const server = hypercloud.Server({
    port: 3000,
    callback: () => console.log('My first HyperCloud server is now listening...'),
});
```

##### 2) Creating an HTTPS server
A basic HTTPS server with self-signed certificate on port `443`:
```ts
const server = hypercloud.Server({ secure: true });
```

A basic HTTPS server running behind a proxy manager
```ts
const server = hypercloud.Server({
    port: 8443,
    secure: true,
    proxy: {
        isDockerContainer: true, // This can be false, depending on your setup
        isLocal: true
    }
});
```

An HTTPS server with a valid SSL certificate (from Let's Encrypt):
```ts
const server = hypercloud.Server({
    port: 443,
    secure: true,
    ssl: {
        email: 'email@mydomain.com',
        domains: ['mydomain.com', 'auth.mydomain.com']
    }
});
```

An HTTPS server with a local certificate and private keys:
```ts
const server = hypercloud.Server({
    port: 443,
    secure: true,
    ssl: {
        cert: fs.readFileSync('path to cert', { encoding: 'utf-8' }),
        key: fs.readFileSync('path to key', { encoding: 'utf-8' }), 
    }
});
```

Enjoy!