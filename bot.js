/**
 * Newspage Bot.
 **/
var util = require('util');
var xmpp = require('node-xmpp');
//var ps = require('./pubsub');
var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: process.env.TWITTER_CON_KEY,
  consumer_secret: process.env.TWITTER_CON_SECRET,
  access_token_key: process.env.TWITTER_ACC_KEY,
  access_token_secret: process.env.TWITTER_ACC_SECRET
});



var cl = new xmpp.Component({ jid: process.env.XMPP_JID,
			                  password: process.env.XMPP_PASSWORD,
			                  host: process.env.XMPP_HOST,
			                  port: process.env.XMPP_PORT });
//var pubsub =  new ps.PubSub(cl);

//move to redis
var urls = {};
var addUrl = function(url){
    console.log(url);
    if(urls[url] === undefined){
        console.log("never seen before");
        urls[url] ={count:1,sent:false};
    }else{
        console.log("seen before");
        if((urls[url].count > 0) && (!urls[url].sent)){
            cl.send(new xmpp.Element('message', {"to":"admin@talkback.im",
                                                 "from":process.env.XMPP_JID,
                                                 "type":"chat"}).c("body").t("interesting link: "+ url));
            urls[url].sent = true;
        }            
    }
}


twit.stream('user', {track:'dthompson'}, function(stream) {
  stream.on('data', function (data) {
      if(data.entities !== undefined){
          //console.log(data.entities);
          for(u in data.entities.urls){
              var url = data.entities.urls[u];
              addUrl(url.expanded_url);
          }
      }
  });
  stream.on('end', function (response) {
    // Handle a disconnection
  });
  stream.on('destroy', function (response) {
    // Handle a 'silent' disconnection from Twitter, no end/error event fired
  });
  // Disconnect stream after five seconds
  //setTimeout(stream.destroy, 5000);
});

cl.on('online',
      function() {
          //cl.send(new xmpp.Element('presence'));
          console.log("online");
          cl.send(new xmpp.Element('message', {"to":"admin@talkback.im",
                          "from":process.env.XMPP_JID,
                          "type":"chat"}).c("body").t("News Bot online!"));
      });
cl.on('stanza',
      function(stanza) {
          console.log(stanza.toString());
      });
cl.on('error',
      function(e) {
          console.log("Error", e);
      });
