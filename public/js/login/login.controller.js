// Login

angular.module('rocApp').controller('loginController', ['$scope',
  'loginService', '$location', '$window', '$routeParams', '$sce',
  '$timeout',

  function($scope, loginService, $location, $window, $routeParams, $sce,
    $timeout) {
    $scope.loggedIn = false;
    $scope.user = "";
    $scope.password = "";
    $scope.feedback = "";
    $scope.passwordStrength = 0;

    $scope.login = function() {
      loginService.login($scope.user, $scope.password).success(function(
        response) {
        if (response.redirect) {
          $scope.feedback = $sce.trustAsHtml("");
          $scope.failure = false;
          $window.location.href = response.redirect;
        } else {
          $scope.feedback = $sce.trustAsHtml(
            "Invalid credentials. Try again.");
          $scope.failure = true;
        }
      });
    };

    $scope.checkPasswordStrength = function(e) {
      // set strength
      if ($scope.newPassword.length < 6)
        $scope.passwordStrength = 1;
      if ($scope.newPassword.length >= 6 && !$scope.newPassword.match(
          /.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/))
        $scope.passwordStrength = 2;
      if ($scope.newPassword.length >= 6 && $scope.newPassword.match(
          /.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/))
        $scope.passwordStrength = 3;

      // animate meter
      var w = $scope.passwordStrength * 50;
      $('#meter').animate({
        width: w + 'px'
      }, 300);
    }

    $scope.checkRepeatedPassword = function(e) {
      if ($scope.newPassword === $scope.repeatPassword)
        $scope.validPassword = true;
      else
        $scope.validPassword = false;
    }

    $scope.reset = function() {
      if ($scope.newPassword === $scope.repeatPassword) {
        if ($scope.newPassword.length < 6) {
          loginService.reset($scope.userid, $scope.newPassword, $scope.token)
            .then(function(response) {
              if (response.data.status == 500) {
                $scope.feedback = $sce.trustAsHtml(response.data.message);
                $scope.failure = true;
              } else {
                $scope.feedback = $sce.trustAsHtml(
                  "Password reset successful.<br/>Redirecting you to the <a href='/'>login page</a>.."
                );
                $scope.failure = false;
                $timeout(function() {
                  $location.path("/");
                }, 3000);
              }
            }, function(error) {
              console.log(error);
            });
        } else {
          $scope.feedback = $sce.trustAsHtml(
            "Please choose a password that is 6 characters or longer.");
          $scope.failure = true;
        }

      } else {
        $scope.feedback = $sce.trustAsHtml(
          "Passwords do not match. Try again.");
        $scope.failure = true;
      }

    }

    // Check for reset password tokens
    $scope.userid = $routeParams['userid'];
    $scope.token = $routeParams['token'];

    $scope.newPasswordRequest = function() {
      var host = location.protocol + '//' + location.hostname + (location
        .port ? ':' + location.port : '');

      loginService.newPasswordRequest($scope.passReq_username, $scope.passReq_email,
          host)
        .then(function(response) {
          if (response.data.status == 500) {
            $scope.feedback = $sce.trustAsHtml(response.data.message);
          } else {
            var msg = response.data.message.split("#");
            $scope.feedback = $sce.trustAsHtml(msg[1]);
            if (msg[0] == "FAILURE") {
              $scope.failure = true;
            } else if (msg[0] == "SUCCESS") {
              $scope.failure = false;
            }
          }
        }, function(error) {
          console.log(error);
        });
    }
  }
]);
