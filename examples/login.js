
// If it's a post, then this app reads up to about the first 1024 bytes of it
// looking for a user and password.  If it finds one, then it tries to log in
// using the supplied credentials.  If the login succeeds, then the app sets
// a cookie.
// If it's not a post, then the app looks at the cookie to try to find the
// login credentials.
// If the login fails, it clears the cookie and shows a little login form.
// 
// This is a demo, so, for the sake of simplicity, even the vaguest sense of
// security best practices has been thrown out the window.  Don't use this for
// your web app without fixing the obvious problems.  Check login-users.txt
// for more information.

var ejsgi = require("../lib/ejsgi"),
  querystring = require("querystring"),
  Promise = require("events").Promise,
  posix = require("posix"),
  path = require("path"),
  url = require("url"),
  page = [
    '<!doctype html>',
    '<html><head><title>A simple form</title></head>',
    '<body><div>{{MESSAGE}}</div></body></html>'
  ].join(""),
  pleaseLogin = [
    '<form method=post action="">',
      '{{ERROR}}',
      '<fieldset>',
        '<legend>Please login</legend>',
        '<div><label>Username: <input name=user></label></div>',
        '<div><label>Password: <input name=pass type=password></label></div>',
      '</fieldset>',
      '<input type=submit value="Let me in">',
    '</form>'
  ].join(""),
  helloYou = [
    '<h1>Hello, {{YOU}}</h1>',
    "<p>Your password is {{PASSWORD}}, and you should be concerned that I know that!"
  ].join("");

function hello (req) {
  var message = page.replace('{{MESSAGE}}', helloYou
        .replace('{{YOU}}', req.env.demo.login.user)
        .replace('{{PASSWORD}}', req.env.demo.login.pass)),
    res = {
      status : 200,
      headers : { "content-type":"text/html", "content-length":message.length },
      body : new (req.jsgi.stream)
    };
  res.body.write(message);
  res.body.close();
  return res;
}

function login (app) { return function (req) {
  var p = new Promise;
  if (req.method === "POST") loginCheckBody(app, req, p, loginCheckCookie);
  else loginCheckCookie(app, req, p);
  return p;
}};

function loginForm (_, req, p, err) {
  var message = page.replace('{{MESSAGE}}', pleaseLogin).replace('{{ERROR}}', err||""),
    res = {
      status : 200,
      headers : {
        "content-type":"text/html",
        "content-length":message.length,
        "set-cookie":"login="
      },
      body : new (req.jsgi.stream)
    };
  res.body.write(message);
  res.body.close();
  return p.emitSuccess(res);
};

function loginCheckCookie (app, req, p, continuation) {
  if (!continuation) continuation = loginForm;
  var login = /(^|;\s*[^$])login=([^:;]+):([^;]+)/;
  for (var i in req.headers) {
    if (i.toLowerCase() !== "cookie") continue;
    var val = req.headers[i];
    if (!Array.isArray(val)) val = [val];
    for (var i = 0, l = val.length; i < l; i ++) {
      var up = login.exec(val[i]);
      if (!up) continue;
      return loginGood(app, req, {user:up[2],pass:up[3]}, p);
    }
  }
  continuation(app, req, p);
}

function loginCheckBody (app, req, p, continuation) {
  // collect the body in a second stream so that we can re-emit if necessary.
  var collector = new (req.jsgi.stream),
    buffer = "",
    checkingBody = true;
  if (!continuation) continuation = loginForm;
  collector.pause();

  req.input.addListener("data", function (c) {
    collector.write(c);
    if (!checkingBody) return;
    if (buffer.length <= 1024) {
      buffer += c;
      return;
    }
    // been more than a kb now.  So, yeah, this ain't it.  move along.
    checkingBody = false;
    attachCollector(collector, req)
    continuation(app, req, p);
  });

  req.input.addListener("eof", function () {
    if (!checkingBody) return;

    var post = querystring.parse(buffer);
    checkLogin(post, function (login) {
      attachCollector(collector, req)
      if (login) loginGood(app, req, login, p);
      else loginForm(app, req, p, "Login failed.");
    });
  });
};

function loginGood (app, req, login, p) {
  (req.env.demo = req.env.demo || {}).login = login;
  // set the cookie, too.
  var res = app(req);
  addHeader(res.headers, "set-cookie",
    "login="+login.user+":"+login.pass+
    // "; Domain=localhost"+
    "; Max-Age=3600"+
    "; Path="+url.parse(req.url).pathname);
  p.emitSuccess(res);
};

function checkLogin (presented, cb) {
  // flip through the lines in the file.
  posix.cat(path.join(path.dirname(__filename), "login-users.txt"))
    // TODO: should be an errback right here.
    .addCallback(function (data) {
      data = data.split("\n")
      for (var i = 0, l = data.length; i < l; i ++) {
        var line = data[i].split(":"),
          u = line.shift(),
          p = line.join(":");
        if (!u || !p) continue;
        if (u === presented.user && p === presented.pass) return cb({user:u, pass:p});
      };
      return cb();
    });
};

function attachCollector (collector, req) {
  var oldBody = req.input;
  collector.addListener("pause", function () { oldBody.pause() });
  collector.resume();
  req.input = collector;
};

function addHeader (headers, key, val) {
  if (key in headers) {
    if (!Array.isArray(headers[key])) headers[key] = [headers[key]];
    headers[key].push(val);
  } else {
    headers[key] = val;
  }
};

ejsgi.Server(login(hello), "localhost", 8000).start();
