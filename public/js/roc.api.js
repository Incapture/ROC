var loginApi = {};
var rocApi = {};

rocApi.whoAmI = function(callback) {
  var vals = {};
    webix.ajax().headers({'x-rapture' : roc.xRapture}).get('/webscript/whoami', vals, callback);
};

rocApi.getData = function(callback) {
  var vals = {};
  webix.ajax().headers({'x-rapture' : roc.xRapture}).get('/webscript/datatable', vals, callback);
}

loginApi.login = function(user, password, callback) {
  var md5pass = MD5(password);
  var vals = {};

  vals['user'] = user;
  vals['password'] = md5pass;
  vals['redirect'] = "/app/index.html";

  webix.ajax().get('/login/login', vals, callback);
// Now need to make a $http style call like this:
//return $http({
//  method: 'GET',
//  url: endPoint + '/login/login',
//  params: vals
// });
};
