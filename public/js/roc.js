// Rapture Operator Console no angular but webix

var roc = {};
var loginApi = {};
var rocApi = {};

roc.mortgageView = {
    id: "mortgageView",
    rows: [
      { cols: [
        {
          view: "calendar",
          date: new Date(2016,7,29),
          events: webix.Date.isHoliday,
          weekHeader: true
        },
        {},
        {
          view: "list",
          width: 250,
          template: "#title#",
          select: true,
          data: [
            { id: "BNP", title: "BNP"}
          ]
        }
      ]
     },
      {
        view:"datatable",
        height: 200,
        id: "datatable"
      }
    ]
};

roc.sideMenu = {
  view : "sidemenu",
  id : "menu",
  width: 200,
  position: "left",
  body: {
    view: "list",
    template: "<span class='webix_icon fa-#icon#'></span> #value#",
    select: 1,
    data: [
      { id: 1, value: "Mortgage", icon: "cube"},
      { id: 2, value: "TBA", icon: "book"}
    ],
    on: {
      onAfterSelect: function(id) {
        if (id == 1) {
          roc.showMortgage();
        }
      }
    }
  },
  state:function(state){
       // get the toolbar's height
       var toolbarHeight = $$("toolbar").$height;
       // increase the 'top' property
       state.top = toolbarHeight;
       // decrease the 'height' property
       state.height -= toolbarHeight;
   }

};

roc.showMortgage = function() {
  console.log("Hello");
  // Now add the calendar, Source and data view
  $$("mainView").addView(roc.mortgageView, -1);

  $$("menu").hide();

  rocApi.getData(function(text, data) {
    webix.ui(JSON.parse(text), $$('mortgageView'), $$('datatable') );
  });
}

roc.switchToLoggedOnDisplay = function() {
    // Once we're logged in, display a logged in view
    $$("toolbar").addView({
      view: "label",
      align: "right",
      label: "Logged In"
    }, -1);

    $$("toolbar").addView({
      view: "icon",
      icon: "bars",
      click: function() {
        if( $$("menu").config.hidden){
                    $$("menu").show();
                }
                else
                    $$("menu").hide();
      }
    }, 0);

    $$("mainView").removeView("body");
    //$$("toolbar").resize(true);
    // Now add in sidebar
    webix.ui(roc.sideMenu);
};

roc.noLoginDisplay = function() {
  webix.ui( {
    id: "mainView",
    type: {
      width: "auto"
    },
    rows: [
      { view: "toolbar", id: "toolbar", elements: [
          { view: "label", label: "South Street Securities Mortgage Inventory", adjust:true}
      ]},
      { id: "body", cols: [
        {},
        { view: "form", id: "loginForm", elements: [
          { view: "text", name: "user", label: "User", placeholder: "Username"},
          { view: "text", name: "password", label: "Password", type: "password", placeholder: "Password"},
          { margin:5, cols: [
           { view: "button", value: "Login", type: "form", click:"roc.loginButton"},
           { view: "button", value: "Cancel"}
         ]}
        ]
      },
      {}
      ]}
    ]
  });
};

roc.loginButton = function() {
  console.log("Hello login");
  var user = $$("loginForm").getValues().user;
  var password = $$("loginForm").getValues().password;

  console.log("User is " + user + ", password is " + password);

  loginApi.login(user, password, function(text, data) {
    console.log("text is " + text);
    // This will be something like: {"message":"266c8098-f780-44d9-8cd2-b5684c281dbe"}
    // The uuid is basically what we should be passing in the x-rapture field of ANY
    // subsequent request
    roc.xRapture = JSON.parse(text).message;
    console.log("xRapture is " + roc.xRapture);
    rocApi.whoAmI(function(text, data) {
        console.log(text);
        roc.switchToLoggedOnDisplay();
    });
  });
};

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

roc.noLoginDisplay();
