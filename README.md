# HDB

***

What does HDB stand for? Hypertext database? Hyperboria Debugger? Housing and Development Board? 

**shrug**. What it does and how it does it is more important.

cjdns is meant to operate with a minimum amount of state. It doesn't remember anything about the network that it builds on a long term basis. When it finds a better path to a node, it forgets the old one. The problem is that it's still alpha software, and _alpha software has bugs_.

In order to fix these bugs, we need to be able to identify, and reliably reproduce them. This is where HDB comes in.

## How?

Since cjdns protects our privacy so well, we can export a lot of its runtime metadata without compromising our own security. HDB makes this data available via a RESTful HTTP api.

HDB stores and shares the relevant data that cjdns typically forgets. Any one node only stores so much, though, so each HDB instance is capable of asking other instances to help fill in that missing information. 

This gives us a better idea of what our network looks like, where the bad paths are occurring, and how we can mitigate such paths from propogating through the DHT.

## Neato!

YEA! Unfortunately, I find the current nodejs cjdns admin api rather clunky. I don't want to build on top of something I don't like, so I'm starting off by rewriting that.

This means you'll have to wait a little longer to get a working HDB instance, but you'll get a better product, in the end. This adminport api will be well documented, and will come with a bunch of example functions that can be called as standalone scripts.

## What features have been implemented so far?

* ircbot integration, so it can spam your favourite channels with its logs!
* an httpd built with expressjs, so you can show your friends how wicked you are, running an httpd like a big kid.

## What will it measure?

* ping time to various peers
* latency introduced by cryptographic functions (per hop)
* port scan info, so as to identify which nodes are operating primarily as servers, and which are operating as clients.
* Uptime
* Throughput
* Memory usage
* 

## What will it serve?

HDB will serve up any information that is agreed not to be a security risk. You will be able to configure it to disable any features you don't want on your personal node.

Since it will be running an HTTP anyway, it will also serve up a NodeInfo.json™ record, which is like a robots.txt file, but for Hyperboria (Proposed by derp™).

## Is it any good?

[yes](https://news.ycombinator.com/item?id=3067434)

## I'm convinced, how do I install it

It's written in nodejs, so download that first. If you're on Hyperboria, you probably have it already.

```bash
git clone https://github.com/ansuz/hdb # download it
npm install # install its libs
node index.js # run it 
```

HDB will load configuration variables from ~/.cjdnsadmin. You should have already made such a file, but if you haven't, maybe we'll figure out a way to automate that for you.

It should include:

* admin address
* admin port
* admin password

..as well as some variables introduced by this software

* "cjdroutepath":/path/to/cjdroute.conf
* "joinIRC":true
* "spamIRC":false
* "ircServers":["irc.hypeirc.net"]
* etc

but that's all still under development, don't worry about it for now.
