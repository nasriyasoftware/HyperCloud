## Error Handling & Pages
___

### Error Pages
**HyperCloud** provides four built-in error pages out of the box, `401`, `403`, `404`, and `500`. You can render these pages from your code and customize them with your own text, or you can set custom handlers to run whenever you needed.

#### Default Error Pages
You can customize what the pages say with your own words, the `401` and `403` uses the same page, thus the same rendering options, so we'll only cover one of them.

- Calling the `500` **server error** page:
```js
router.use('*', (request, response, next) => {
    // This renders the default 500 pages as is, without any changes
    response.pages.serverError();
})
```
**:: OR ::**
```js
router.use('*', (request, response, next) => {
    // Customize the page text
    response.pages.serverError({
        locals: {
            title: 'خطاً في الخادم',                        // The page title in browsers,
            subtitle: 'عذراً! حدث خطأ في الخادم',          // The page title to render for visitors
            message: 'نحن آسفون، ولكن حدث خطأ ما من جانبنا. لقد تم إخطار فريقنا، ونحن نعمل على حل المشكلة في أقرب وقت ممكن.',
        },
        error: new Error('Something went wrong')
    });
})
```

- Calling the `404` **not-fonud** page:
```js
router.use('*', (request, response, next) => {
    // This renders the default 404 pages as is, without any changes
    response.pages.notFound();
})
```
**:: OR ::**
```js
router.use('*', (request, response, next) => {
    // Customize the page text
    response.pages.notFound({
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
})
```
**:: OR ::**
```js
router.use('*', (request, response, next) => {
    // Customize the page text
    response.pages.forbidden({
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

**NOTE:** The built-in error pages are multilingual. If they're not available in your language and you'd like to help translate them, feel free to reach out at developers@nasriya.net.
___

#### Custom Error Pages
The [default error pages](#default-error-pages) are not meant for production, yes, we know, they're not well designed and might not match with your brand theme, so you can define your own handlers for each and every one of those error pages.

To define custom handlers, we use the server's `handlers` module as usual, however, each error page has its own reserved handler name. Here is a list of the names.

| Resource           | Handler Name   | Description                 |
| ------------------ | -------------- | --------------------------- |
| Not Found `404`    | `notFound`     | Used for custom `404` pages |
| Unauthorized `401` | `unauthorized` | Used for custom `401` pages |
| Forbidden `403`    | `forbidden`    | Used for custom `403` pages |
| Server Error `500` | `serverError`  | Used for custom `500` pages |

Let's take an example, we want to define a custom-built `404` page, to do that, just follow these simple steps:

1. Define a custom 404 handler
```js
server.handlers.notFound((request, response, next) => {
    // Render a defined page
    response.render('notFoundPage', {
        httpOptions: { statusCode: 404 }
    });

    // OR

    // Send an html file
    response.status(404).sendFile('/path/to/html/file.html');
})
```
2. Render the custom page
```js
router.use('*', (request, response, next) => {
    response.pages.notFound(); // This will now render the custom page
})
```
___
### Error Handling
Error handling in HyperCloud are done by defining an `http` error handler, to do that, we set the `onHTTPError` handler. The handler can be defined in another file and passed as a function to the `server.handlers.onHTTPError()` method.

The handler type is `HyperCloudRequestErrorHandler`, it's similar to the regular `HyperCloudRequestHandler` but it has an additional `error: HTTPError` parameter.

```js
/**
 * A function to handle errors thrown due to an error in any of the HTTP middlewares
 * @type {HyperCloudRequestErrorHandler}
*/
function HTTPErrorHandler(request, response, next, error) {
    // Start by logging the error here
    console.error(error);

    // Or use a logging library or package to log the error
    // ...

    // Return a server error response
    response.pages.serverError({
        error: error,
        locals: {
            message: `Request ID: ${request.id} failed. ${request.method} ${request.path.join('/')}`
        }
    })
}

// Pass our handler to set it up
server.handlers.onHTTPError(HTTPErrorHandler);
```