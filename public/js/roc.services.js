// Services for dataManagerApp

angular.module('rocApp.services', []);

angular.module('rocApp.services').factory('loginService', function(
  $http) {
  var loginApi = {};
  var endPoint = "";
  loginApi.login = function(user, password) {
    var md5pass = MD5(password);
    var vals = {};

    vals['user'] = user;
    vals['password'] = md5pass;
    vals['redirect'] = "/app/index.html";
    return $http({
      method: 'GET',
      url: endPoint + '/login/login',
      params: vals
    });
  }

  loginApi.logout = function() {
    var vals = {};
    vals['redirect'] = "/index.html";
    return $http({
      url: endPoint + "/login/logout",
      type: 'GET',
      params: vals,
    });
  }

  loginApi.reset = function(user, password, token) {
    var md5pass = MD5(password);
    var vals = {};
    vals['user'] = user;
    vals['password'] = md5pass;
    vals['token'] = token;
    vals['redirect'] = "/index.html";
    return $http({
      method: 'GET',
      url: endPoint + '/login/reset',
      params: vals
    });
  }

  loginApi.newPasswordRequest = function(username, email, host) {
    var vals = {};
    vals['username'] = username;
    vals['email'] = email;
    vals['host'] = host;
    return $http({
      url: endPoint + "/login/newPasswordRequest",
      type: 'GET',
      params: vals,
      dataType: 'json'
    });
  }

  return loginApi;
});

angular.module('rocApp.services').factory('dataService', function(
  $http) {
  var dataServiceApi = {};
  var endPoint = "";
  dataServiceApi.getChildren = function(path, qtype) {
    var vals = {};
    vals['key'] = path;
    vals['qtype'] = qtype;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/browserlist',
      params: vals
    });
  }

  dataServiceApi.getWorkflowChildren = function(path) {
    var vals = {};
    vals['key'] = path;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/workflowList',
      params: vals
    });
  }

  dataServiceApi.getWorkorderChildren = function(path) {
    var vals = {};
    vals['key'] = path;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/workorderList',
      params: vals
    });
  }

  dataServiceApi.getWorkorder = function(path) {
    var vals = {};
    vals['key'] = path;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getWorkorder',
      params: vals
    });
  }

  dataServiceApi.getScript = function(path) {
    var vals = {};
    vals['key'] = path;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getScript',
      params: vals
    });
  }


  dataServiceApi.getScriptChildren = function(path) {
    var vals = {};
    vals['key'] = path;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/scriptList',
      params: vals
    });
  }

  dataServiceApi.getBlobMetaData = function(id) {
    var vals = {};
    vals['id'] = id;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getMetaData',
      params: vals
    });
  }

  dataServiceApi.getContent = function(path) {
    var vals = {};
    vals['id'] = path;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getData',
      params: vals
    });
  }

  dataServiceApi.saveContent = function(path, content) {
    var vals = {};
    vals['id'] = path;
    vals['contents'] = content;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/putContent',
      params: vals
    });
  }

  dataServiceApi.getHistory = function(path) {
    var vals = {};
    vals['id'] = path;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/dataHistory',
      params: vals
    });
  }

  dataServiceApi.getDiff = function(path, versionA, versionB) {
    var vals = {};
    vals['id'] = path;
    vals['a'] = versionA;
    vals['b'] = versionB;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getDiff',
      params: vals
    });
  }

  dataServiceApi.deleteContent = function(type, path) {
    var vals = {};
    vals['id'] = path;
    vals['type'] = type;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/deleteDoc',
      params: vals
    });
  }

  dataServiceApi.deleteRepo = function(path, qtype) {
    var vals = {};
    vals['id'] = path;
    vals['qtype'] = qtype;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/deleteRepo',
      params: vals
    });
  }

  dataServiceApi.createRepo = function(vals) {
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/createRepo',
      params: vals
    });
  }

  dataServiceApi.addLink = function(path, purpose, linkUri) {
    var vals = {};
    vals['id'] = path;
    vals['purpose'] = purpose;
    vals['linkUri'] = linkUri;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/addLink',
      params: vals
    });
  }

  dataServiceApi.deleteLink = function(path, linkUri) {
    var vals = {};
    vals['id'] = path;
    vals['linkUri'] = linkUri;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/deleteLink',
      params: vals
    });
  }

  dataServiceApi.getPointsInSeries = function(path, start, max) {
    var vals = {};
    vals['id'] = path;
    vals['column'] = start;
    vals['max'] = max;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getPointsInSeries',
      params: vals
    });
  }

  dataServiceApi.addPointToSeries = function(path, key, value, dataType) {
    var vals = {};
    vals['id'] = path;
    vals['key'] = key;
    vals['value'] = value;
    vals['dataType'] = dataType;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/addPointToSeries',
      params: vals
    });
  }

  dataServiceApi.deleteColumnFromSeries = function(path, key) {
    var vals = {};
    vals['id'] = path;
    vals['key'] = key;
    return $http({
      method: 'GET',
      url: endPoint +
        '/webscript/datamanager/deletePointFromSeries',
      params: vals
    });
  }

  dataServiceApi.getDataForSeriesChart = function(path, after, csize) {
    var vals = {};
    vals['id'] = path;
    vals['after'] = after;
    vals['size'] = csize;
    return $http({
      method: 'GET',
      url: endPoint +
        '/webscript/datamanager/getDataForSeriesChart',
      params: vals
    });
  }

  dataServiceApi.getREPLSession = function() {
    var vals = {};
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getREPLSession',
      params: vals
    });
  }

  dataServiceApi.evalREPLSession = function(id, line) {
    var vals = {};
    vals['id'] = id;
    vals['line'] = line;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/evalREPLSession',
      params: vals
    });
  }

  dataServiceApi.getLinksAsDot = function(id, depth) {
    var vals = {};
    vals['id'] = id;
    vals['depth'] = depth;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getLinksAsDot',
      params: vals
    });
  }

  dataServiceApi.getWorkflowAsDot = function(id) {
    var vals = {};
    vals['id'] = id;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getWorkflowAsDot',
      params: vals
    });
  }

  dataServiceApi.getCMAttr = function(id) {
    var vals = {};
    vals['id'] = id;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getCMAttr',
      params: vals
    });
  }

  dataServiceApi.addAttribute = function(id, name, value) {
    var vals = {};
    vals['id'] = id;
    vals['name'] = name;
    vals['value'] = value;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/addAttribute',
      params: vals
    });
  }

  dataServiceApi.getRawBlobData = function(blobUri) {
    var path = endPoint + "/blob/" + blobUri.substring(2);
    return $http({
      method: 'GET',
      url: path
    });
  }

  dataServiceApi.putFileBlobData = function(uri, file) {
    var submitUri = endPoint + '/blobupload?description=' + uri;
    var fd = new FormData();
    fd.append('file', file);
    var params = {};
    params.description = uri;
    return $http.post(submitUri, fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      },
      params: params
    });
  }

  dataServiceApi.putRawBlobData = function(uri, content) {
    var submitUri = endPoint + '/blobupload?description=' + uri;
    var fd = new FormData();
    var blob = new Blob([content]);
    fd.append('file', blob, uri);
    var params = {};
    params.description = uri;
    return $http.post(submitUri, fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      },
      params: params
    });
  }

  dataServiceApi.checkRepoName = function(name) {
    var vals = {};
    vals['id'] = name;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/checkRepoName',
      params: vals
    });
  }

  dataServiceApi.getWhoAmi = function() {
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getWhoAmi'
    });
  }

  dataServiceApi.getSearchableRepos = function() {
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getSearchableRepos'
    });
  }

  dataServiceApi.getIndexFields = function(id) {
    var vals = {};
    vals['id'] = id;
    return $http({
      method: 'GET',
      url: endPoint + '/webscript/datamanager/getIndexFields',
      params: vals
    });
  }

  return dataServiceApi;
});
