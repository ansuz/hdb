# ircerrwarez

***

the birth of the first hyperboria security company

As it turns out, it's pretty hard to debug a global meshnet running off of an experimental protocol. Luckily, **ircerrwarez** is here to help!

## What does it do?

It's meant to help you administrate your node. It features:

* ircbot integration, so it can spam your favourite channels with its logs!
* an httpd built with expressjs, so you can show your friends how wicked you are, running an httpd like a big kid.

## What will it do?

Eventually, it will be a part of a federated network of bots and httpds which:

* run **BHP™** (periodic pings to help identify which paths frequently experience the **Black Hole Routing** problem)
* can be set to run nmap scans (on your neighbours or something, for security(?)).
* serve up contact information about your node, if you want it to, like a facebook but for your node (or something).
* provide general stats about:
  + bandwidth usage
  + uptime
  + performance
  + ???
  + profit

## Is it any good?

[yes](https://news.ycombinator.com/item?id=3067434)

## I'm convinced, how do I install it

It's written in nodejs, so download that first. If you're on Hyperboria, you probably have it already.

```bash
git clone https://github.com/ansuz/ircerrwarez # download it
npm install # install its libs
node index.js # run it 
```

ircerrwarez will load configuration variables from ~/.cjdnsadmin. You should have already made such a file, but if you haven't, maybe we'll figure out a way to automate that for you.

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

