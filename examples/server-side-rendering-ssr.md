## Server Side Rendering (SSR)
To utilize **HyperCloud**'s [server side rendering](https://ferie.medium.com/what-is-the-server-side-rendering-and-how-it-works-f1d4bf9322c6), you need to define pages and components, and in a route, you can simply render the page by its name `response.render('pageName')`. Let's dive in.
___

### Files Syntax
When defining pages or components, there's a syntax that you must follow in order for the renderer to detect and register your defined pages and components.

- **Pages:** `*.page.js`. For example: `home.pae.js`.
- **Components:** `*.comp.js` or `*.component.js`. Example: `header.comp.js` or `header.component.js`.
___

### Project Structure
To follow common practices, our project will look like this:
```
my-ssr-project/
├── src/
│   ├── assets/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   │   ├── header.ejs              // Header component template
│   │   │   │   ├── header.comp.js          // Header component definition
│   │   │   │   ├── style.css               // Header component styles (optional)
│   │   │   │   └── script.js               // Header component scripts (optional)
│   │   │   ├── footer/
│   │   │   │   ├── footer.ejs              // Footer component template
│   │   │   │   ├── footer.component.js     // Footer component definition
│   │   │   │   ├── style.css               // Footer component styles (optional)
│   │   │   │   └── script.js               // Footer component scripts (optional)
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   │   ├── home.ejs                // Home page template
│   │   │   │   ├── home.page.js            // Home page definition
│   │   │   │   ├── styles1.css             // Home page styles 1
│   │   │   │   ├── styles2.css             // Home page styles 2
│   │   │   │   ├── script1.js              // Home page script 1
│   │   │   │   └── script2.js              // Home page script 2
│   │   ├── global/
│   │   │   │   ├── global.css              // A global CSS file
│   │   │   │   └── site.js                 // A global JavaScript file
│   |
│   └── server.js
```

In this example, we need to create three files: `header.comp.js` and `footer.component.js` for the header and footer components, and `home.page.js` for the home page.

___
## How it works

### 1- Defining Components & Pages
The first step is to define the components and pages.

##### Defining Components
To define a component, follow these steps:

1. Import the `Component` class from the package:
```js
import { Component } from '@nasriya/hypercloud';
```

2. Create an instance of the component:
```js
const comp = new Component('header');   // Where `header` is the component name
```

3. Specify the path of the component template
```js
comp.template.path.set(path.join(import.meta.dirname, 'header.ejs'));
```

4. Specify the paths of the assets (optional)
```js
comp.stylesheet.set(path.join(import.meta.dirname, 'style.css'));
comp.script.set(path.join(import.meta.dirname, 'script.js'));
```

5. Export the component
```js
export default comp;
```

##### Defining Pages
To define a page, follow these steps:

1. Import the `Page` class from the package:
```js
import { Page } from '@nasriya/hypercloud';
```

2. Create an instance of the component:
```js
const page = new Page('home');   // Where `home` is the page name
```

3. Specify the path of the component template
```js
page.template.path.set(path.join(import.meta.dirname, 'home.ejs'));
```

4. Specify the paths of the assets (optional)
```js
page.stylesheets.link.internal(path.join(import.meta.dirname, 'style1.css'));
page.stylesheets.link.internal(path.join(import.meta.dirname, 'style2.css'));

page.scripts.link.internal(path.join(import.meta.dirname, 'script1.js'));
page.scripts.link.internal(path.join(import.meta.dirname, 'script2.js'));
```

5. Export the page
```js
export default page;
```

### 2- Register Assets
After creating and assets (pages and components), we need to register them on the server.

##### Registering Pages & Components
To register our pages and components, we tell the server where it can find them by providing the containing folder.

```js
// Register the pages folder
server.rendering.pages.register(path.join(import.meta.dirname, './assets/pages'));

// Register the components folder
server.rendering.components.register(path.join(import.meta.dirname, './assets/components'));
```

##### Register Global Assets
Global assets are files that must be included in each and every page. This can save you lots of time and headache during development.

```js
// Add global CSS
server.rendering.assets.stylesheets.link.internal(path.resolve(import.meta.dirname, 'global/global.css'));
server.rendering.assets.stylesheets.link.external('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

// Add global JavaScript
server.rendering.assets.scripts.link.internal(path.resolve(import.meta.dirname, 'global/site.js'));
```

##### Enable Caching
Enable caching allows **HyperCloud** to store your assets in memory (RAM), resulting in faster rendering since it doesn't need to read from storage each and every time a page or a component is needed.

To enable all assets:

```js
server.rendering.cache.enableFor.everything();
```