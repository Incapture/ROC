angular.module('rocApp', [
  'rocApp.services',
  'ngRoute',
  'angularModalService',
  'webix'
]).run(['$route', '$rootScope', '$location', function($route,
  $rootScope, $location) {
  var original = $location.path;
  $location.path = function(path, reload) {
    if (reload === false) {
      var lastRoute = $route.current;
      var un = $rootScope.$on('$locationChangeSuccess', function() {
        $route.current = lastRoute;
        un();
      });
    }
    return original.apply($location, [path]);
  };
}]);

angular.module('rocApp').config(['$httpProvider', function(
  $httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}]);
