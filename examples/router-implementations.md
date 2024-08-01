## Advanced Router Implementations

### Ways to create a `Router`

#### 1. From  the server
You can create a `Router` directly from the server using `server.Router()`. Routes created on the returned server are automatically mounted on the server.

```js
import hypercloud from '@nasriya/hypercloud';

const server = hypercloud.Server();

// Create the router from the server
const router = server.Router();
```

#### 2. Standalone `Router`
To create dynamic content, you can import the router directly from the package

```js
// api/auth
import { Router } from '@nasriya/hypercloud';

const router = new Router();

router.use('*', (req, res, next) => {
    next();
})

export default router;
```

```js
// server
import hypercloud from '@nasriya/hypercloud';
import authRouter from './api/auth';

const server = hypercloud.Server();

// Mount the created router on the server
server.extend(authRouter);
```
___

##### Favicon
Specify the website's `favicon` by passing the root directory that contains your `favicon`. Your `favicon` extension can be **.png** or **.ico**.

Assuming that the `src` folder contains your `favicon`:
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
    caseSensitive: true // Makes (/home) and (/Home) not the same
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
    caseSensitive: true // Makes (/u/user) and (/u/User) not the same
})
```

**Note:** Routes are automatically mounted on the server.