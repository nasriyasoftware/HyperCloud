#### Helmet Protection
In today's digital landscape, security is paramount. HyperCloud's built-in Helmet protection is designed to provide robust security measures, safeguarding your applications from a myriad of common web vulnerabilities. By integrating Helmet, HyperCloud ensures that your applications are shielded against threats such as cross-site scripting (XSS), clickjacking, and other malicious attacks. This advanced protection layer helps developers focus on building features and functionality, knowing that their applications are fortified with industry-leading security practices. With Helmet, HyperCloud takes a proactive approach to web security, offering peace of mind and enabling you to deliver secure, reliable applications to your users.

To enable **Helmet** protection:
```js
server.helmet(); // This applies all the default configurations
```
___
Here's a list of all the headers covers by the **Helmet**.

<details>
<summary>Content-Security-Policy</summary>

### [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
Use a custom policy:
```js
server.helmet({
    contentSecurityPolicy: {
        useDefault: false,
        directives: {
            // Your directives here
        }
    }
})
```

Disable the policy
```js
server.helmet({
    contentSecurityPolicy: false
})
```

Default policy:
```js
"default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests"
```
</details>

<details>
<summary>Cross-Origin-Embedder-Policy</summary>

### [Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)
Specify the policy:
```js
server.helmet({
    crossOriginEmbedderPolicy: { policy: '<your policy>' }
})
```

Disable the policy
```js
server.helmet({
    crossOriginEmbedderPolicy: false
})
```

Default policy:
```js
'require-corp'
```
</details>

<details>
<summary>Cross-Origin-Opener-Policy</summary>

### [Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
Specify the policy:
```js
server.helmet({
    crossOriginOpenerPolicy: { policy: '<your policy>' }
})
```

Disable the policy
```js
server.helmet({
    crossOriginOpenerPolicy: false
})
```

Default policy:
```js
'same-origin'
```
</details>

<details>
<summary>Cross-Origin-Resource-Policy</summary>

### [Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy)
Specify the policy:
```js
server.helmet({
    crossOriginResourcePolicy: { policy: '<your policy>' }
})
```

Disable the policy
```js
server.helmet({
    crossOriginResourcePolicy: false
})
```

Default policy:
```js
'same-origin'
```
</details>

<details>
<summary>Origin-Agent-Cluster</summary>

### [Origin-Agent-Cluster](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin-Agent-Cluster)

Specify the policy:
```js
server.helmet({
    originAgentCluster: '<your policy>'
})
```

Disable the policy
```js
server.helmet({
    originAgentCluster: false
})
```

Default policy:
```js
'?1'
```
</details>

<details>
<summary>Referrer-Policy</summary>

### [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
Specify the policy:
```js
server.helmet({
    referrerPolicy: { policy: '<your policy>' }
})
```

Disable the policy
```js
server.helmet({
    referrerPolicy: false
})
```

Default policy:
```js
'no-referrer'
```
</details>

<details>
<summary>Strict-Transport-Security</summary>

### [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
Specify the policy:
```js
server.helmet({
    strictTransportSecurity: {
        /** Max age value in seconds */
        maxAge: 31536000,
        /** Whether to include subdomains */
        includeSubDomains: true,
        /** Whether to preload HSTS */
        preload: true
    }
})
```

Disable the policy
```js
server.helmet({
    strictTransportSecurity: false
})
```

Default policy:
```js
'max-age=31536000; includeSubDomains; preload'
```
</details>

<details>
<summary>X-Content-Type-Options</summary>

### [X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)
Specify the policy:
```js
server.helmet({
    xContentTypeOptions: 'nosniff'
})
```

Disable the policy
```js
server.helmet({
    xContentTypeOptions: false
})
```

Default policy:
```js
'nosniff'
```
</details>

<details>
<summary>X-DNS-Prefetch-Control</summary>

### [X-DNS-Prefetch-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control)
Specify the policy:
```js
server.helmet({
    xDnsPrefetchControl: { enabled: true }
})
```

Disable the policy
```js
server.helmet({
    xDnsPrefetchControl: false
})
```

Default policy:
```js
'off'
```
</details>

<details>
<summary>X-Download-Options</summary>

### [X-Download-Options](https://nuxt-security.vercel.app/documentation/headers/xdownloadoptions)
Specify the policy:
```js
server.helmet({
    xDownloadOptions: true
})
```

Disable the policy
```js
server.helmet({
    xDownloadOptions: false
})
```

Default policy:
```js
'noopen'
```
</details>

<details>
<summary>X-Frame-Options</summary>

### [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
Specify the policy:
```js
server.helmet({
    xFrameOptions: { action: 'DENY' }
})
```

Disable the policy
```js
server.helmet({
    xFrameOptions: false
})
```

Default policy:
```js
'DENY'
```
</details>

<details>
<summary>X-Permitted-Cross-Domain-Policies</summary>

### [X-Permitted-Cross-Domain-Policies](https://nuxt-security.vercel.app/documentation/headers/xpermittedcrossdomainpolicies)
Specify the policy:
```js
server.helmet({
    xPermittedCrossDomainPolicies: {
        permittedPolicies: 'none'
    }
})
```

Disable the policy
```js
server.helmet({
    xPermittedCrossDomainPolicies: false
})
```

Default policy:
```js
'none'
```
</details>

<details>
<summary>X-Powered-By</summary>

### [X-Powered-By](https://http.dev/x-powered-by)
Specify the policy:
```js
server.helmet({
    xPoweredBy: true // To remove the header 
})
```

Default policy:
```js
'true'
```
</details>

<details>
<summary>X-XSS-Protection</summary>

### [X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)
Specify the policy:
```js
server.helmet({
    xXssProtection: true
})
```

Default policy:
```js
'0'
```
</details>

___
### Enjoy