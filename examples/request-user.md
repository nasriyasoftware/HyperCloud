## HyperCloud Built-In User

HyperCloud provides a built-in `HyperCloudUser` on each `request` and allows you to populate it using a [custom handler](#user-handler), you can then access the `user` object from any route via the `request` object.

The built-in `user` instance looks like this:
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
        colorScheme: 'Dark'|'Light'
    }
}
```
##### Logged-in User
| Property      | Value                   | Description                                      |
| ------------- | ----------------------- | ------------------------------------------------ |
| `id`          | `string`                | The `id` of the user in the database             |
| `loggedIn`    | `true`                  | Whether the user is loggedIn or not              |
| `role`        | `"Admin"` or `"Member"` | Specified in the [handler](#user-handler)        |
| `preferences` | `UserPreferences`       | An object with user prefereces from the database |



| Property      | Value                   | Description                                                                            |
| ------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `language`    | `string`                | The user's preferred language from the database  or `null` if no language is preferred |
| `locale`      | `string`                | The user's preferred locale from the database or `null` if no locale is preferred      |
| `currency`    | `string`                | The user's preferred currency in the database or `null` if no currency is preferred    |
| `colorScheme` | ``"Dark"`, or `"Light"` | The user's preferred color scheme in the database or `null` if not specified           |


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