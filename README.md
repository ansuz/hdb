# HDB

**WIP**

HDB is a webserver that exposes some information about your cjdns node and performs some background tasks.

## Exposes what?

It will serve a [nodeinfo.json record](https://github.com/hyperboria/docs/blob/master/cjdns/nodeinfo-json.md) if you have one. Try using [nij](https://github.com/clehner/nij) if you don't.

It also exposes statistics from a few cjdns admin api calls:

* peerStats
* dumpTable
* ???

More admin calls will be added in the future.

## What background tasks

HDB has a submodule (`lib/processes/census.js`), which will periodically recurse over your node's `pathFinderTree`. It bundles up the results, and passes them into a callback. The code needs some cleaning, and the API is quite likely to change.

HDB has another submodule (`lib/memory.js`), which takes a level database as an argument, and returns some functions for getting and putting information to and from the db. This code is messy, and surely has bugs, but it seems to work well enough to deploy. Going forward, I'll clean this up and make it more efficient. In the meantime, I want to be able to deploy an instance of hdb to a node, and start collecting data.

Future versions will add the capacity to cryptographically sign your node's findings, and push them into a [DHT](https://github.com/ansuz/kad-ipv6), probably supplemented with a more efficient gossip system.

## How do I install it?

```BASH
# fetch from github
git clone https://github.com/ansuz/hdb

# change into your new repository
cd hdb

# install dependencies
npm install

# then run it
node server.js
```

Finally, you can visit your new server on your node's ipv6, port 64512.

## How do I _un_install it

`rm -rf hdb/`. Everything is stored in this folder.

## FAQ

#### What api endpoints can I use?

See [API.md](API.md) for a complete listing of all currently supported API endpoints.

#### Why 64512? 

```
$ node
> 0xfc00
64512
```

#### Why not 80?

Because I have other things running on port 80. People _can_ read this server's output, but it's meant as an API for machines.

#### What will the Kademlia DHT be used for?

Each instance of HDB will learn about its local network. It can check what nodes are nearby through its admin interface. Then it can do things like search for recognizable services. If it finds such services, it can notify the rest of the HDB swarm.

This distributed datastore might be usable for a distributed database of crawler results, but I'm going to have to test that before making any promises.

#### Why would I want to run this? What does it do for me?

Once search is in place, you get your own search portal, and equal access to all the information the dht has to offer.

You also get a more visible network. Your node, and others throughout the net, will report information as they find it, and expose it in a useful way, hopefully.

#### I don't care about search. What then?

I'm not sure. Maybe you just want to help other people who are interested in improving cjdns get some stats from your api endpoint? It shouldn't take much bandwidth or CPU. Do you mind if people know who you're peered with?

Eventually I might implement a front end with a logical map like that on [fc00.org](http://fc00.org).
