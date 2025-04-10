## Advanced Configuration Options
You can configure the server with more options by passing an object to the `listen` method. The available options are:

| Property    | Type                                   | Purpose                                                                                                                      |
| ----------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `host`      | `string`                               | The address to bind the server to. Defaults to `0.0.0.0` (listens on all network interfaces). Can be set to `::` for IPv6.   |
| `port`      | `number`                               | The port number for the server to listen on. Defaults to `80` for non-secure servers, and `443` for secure servers.          |
| `onListen`  | `(host: string, port: number) => void` | A callback function triggered when the server begins listening. It receives the host and port as parameters.                 |
| `backlog`   | `number`                               | The maximum length of the queue of pending connections. If not set, it will use the default value from the operating system. |
| `exclusive` | `boolean`                              | If `true`, the server will only bind to the specified port if no other processes are using it. Defaults to `false`           |
| `ipv6Only`  | `boolean`                              | If `true`, the server will bind to IPv6 addresses only. Defaults to `false`.                                                 |

```js
server.listen({
    host: 'localhost',           // Host to listen on (default is '0.0.0.0')
    port: 8080,                  // Port to listen on (default is 80 for non-secure, 443 for secure)
    backlog: 100,                // The maximum length of the queue of pending connections
    exclusive: false,            // Whether the server should exclusively bind to the port (default is false)
    ipv6Only: false,             // Whether to bind to IPv6 addresses only (default is false)
    onListen: (host, port) => {  // Callback function triggered when the server starts listening
        console.log(`Server is listening on ${host}:${port}`);
    }
});
```