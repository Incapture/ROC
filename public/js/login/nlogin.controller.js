angular.module('rocApp').controller('nologinController', ['$scope',

function($scope) {
  var header = { type: "header", template: "South Street Securities" };
  var menu = {
    view: "menu",
    align: "right",
    autowidth: true,
    data: [
      { value: "Login", submenu:["Login...","Forgot Password..."]}
    ],
    type: {
      subsign: true
    }
  };
  var toolbar = { type : "toolbar",
  cols: [
    { view: "label", label: "South Street Securities"},
    {},
    menu
  ]
};

var loginForm = {
  view: "form",
  width: 300,
  elements: [
    { view: "text", label: "Username"},
    { view: "text", type: "password", label: "Password"},
    { margin:5, cols: [
       { view: "button", value: "Login", type: "form"},
       { view: "button", value: "Cancel"}
    ]}
  ]
};

  $scope.config = {
    rows: [
    toolbar,
    { cols: [ {}, loginForm, {}]}
    ]
  };
}
]);
