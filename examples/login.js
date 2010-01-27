var ejsgi = require("../lib/ejsgi"),
  Stream = require("../lib/ejsgi/stream"),
  Promise = require("events").Promise,
  page = [
    '<!doctype html>',
    '<html><head><title>A simple form</title></head>',
    '<body>{{MESSAGE}}</body></html>'
  ].join(""),
  pleaseLogin = [
    '<form method=post action="">',
      '<fieldset>',
        '<legend>Please login</legend>',
        '<div><label>Username: <input name=user></label></div>',
        '<div><label>Password: <input name=pass type=password></label></div>',
      '</fieldset>',
      '<input type=submit value="Let me in">',
    '</form>'
  ].join(""),
  helloYou = '<h1>Hello, {{USERNAME}}</h1>';

function hello (req, you) {
  var message = page.replace('{{MESSAGE}}', helloYou.replace('{{YOU}}', you)),
    res = {
      status : 200,
      headers : { "content-type":"text/html", "content-length":message.length },
      body : new Stream
    };
  res.body.write(message);
  res.body.close();
  return res;
}

function login (app) { return function (req) {
  
}};