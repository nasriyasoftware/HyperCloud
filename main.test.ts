import hypercloud from "./src/hypercloud";
hypercloud.verbose = true;

const server = hypercloud.Server();

server.listen()