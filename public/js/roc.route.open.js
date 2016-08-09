angular.module('rocApp').config(['$routeProvider', routeConfig]);

function routeConfig(
  $routeProvider) {
  $routeProvider.
  when("/app/login", {
    templateUrl: "template/partials/login.html",
    controller: "loginController"
  }).
  when("/password/reset/:userid/:token", {
      templateUrl: "template/partials/reset.html",
      controller: "loginController"
    }).when("/", {
      redirectTo: '/app/login'
    })
    .when("/newPasswordRequest", {
      templateUrl: 'template/partials/newPasswordRequest.html',
      controller: "loginController"
    })
    .otherwise({
      redirectTo: '/app/login'
    });
}
