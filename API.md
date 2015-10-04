# API

====

HDB only has one human readable page, currently (depending on your definition of human readable, other pages are `JSON`).

At this point the API is highly unstable. I don't recommend building applications on it. You can expect a tagged release once it becomes stable.

## Routes

All examples wlil be given with the domain `localhost`, port 64512.

Going forward, these endpoints are likely to have aliases prefixed by `/api/<version>/`, so as to provide a mechanism for supporting older applications. That won't happen until after an RFC and a stable release, though. Non-prefixed routes will always point to the latest implementation.

### /index

* http://localhost:64512/
* http://localhost:64512/index

These two provide the same result. An HTML listing of the other pages you can view.

### /peerStats

http://localhost:64512/peerStats

An array of objects, each containing the following attributes:

* key => string
* ipv6 => zeropadded cjdns ipv6 (39 char string)
* switchLabel => cjdns switch label (17 char string)
* bytesIn => string encoded integer
* bytesOut => string encoded integer
* state => string ("ESTABLISHED" or "UNRESPONSIVE")
* duplicates => string encoded integer
* receivedOutOfRange => string encoded integer
* user => string ("Local Peers", "", or assigned peer name)

### /dumpTable

http://localhost:64512/dumpTable

An array of objects, each containing the following attributes

* addr => cjdns address format (version, path, publicKey)
* bucket => string encoded integer
* ip => cjdns ipv6
* link => string encoded integer
* path => string
* time => string encoded integer
* version => string encoded integer

### /nodeinfo.json

* http://localhost:64512/nodeinfo.json

HDB attempts to load .nodeinfo.json from your `public/` directory at launch time. It's loaded as JSON, and will fail if there are any errors. If you find this annoying, think of the nodeinfo.json crawlers who would be annoyed by your invalid JSON.

In case of failure, an empty object will be served in its place (`{}`).

For the most up to date specifications of the `nodeinfo.json` format, see [the Hyperboria docs repo](https://github.com/hyperboria/docs/blob/master/cjdns/nodeinfo-json.md).

### /getNode

* http://localhost:64512/getNode
* http://localhost:64512/getNode/<cjdns ipv6>

This a custom format, not one defined by cjdns internals, and as such it should be treated as being especially fragile. Currently, it returns an object with the following attributes (in no particular order):

* key => cjdns public key (string)
* versions => integer array
* firstSeen => string encoded integer
* lastSeen => string encoded integer
* ip => zeropadded cjdns ipv6 (string)

### /knownNodes

* http://localhost:64512/knownNodes

An array of zeropadded cjdns ipv6s. All nodes that the HDB instance has seen to date.

### /nodeCount

* http://localhost:64512/nodeCount

An object, currently with a single attribute (`nodeCount`). In the future, expect more detailed demographics from this endpoint.

### endPoints

* http://localhost:64512/endPoints

An object with a single attribute (`endPoints`), an array of valid URIs provided by the current HDB instance.
