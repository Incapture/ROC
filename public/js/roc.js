// Rapture Operator Console no angular but webix

var roc = {};

roc.sideMenu = {
  view : "sidebar",
  id : "menu",
  data: [
    ],
    on: {
      onAfterSelect: function(id) {
          var item = this.getItem(id);
          if (item.concept == "entity") {
            var entity = item.entity;
            rocWindow.showEntity(entity);
          } else {
            var script = this.getItem(id).script;
            rocWindow.show(script, {});
          }
      }
  }
};

roc.switchToLoggedOnDisplay = function() {
    // Once we're logged in, display a logged in view
    //$$("toolbar").addView({
    //  view: "label",
    //  align: "right",
    //  label: "Logged In"
    //}, -1);

    $$("body").removeView("loginForm");
    //$$("toolbar").resize(true);
    // Now add in sidebar
    webix.ajax().headers({'x-rapture' : roc.xRapture}).get('/webscript/menu/rocmenu', {},
       function(text, data) {
          var x = $$('menu');

          $$('menu').define('data', JSON.parse(text));
          //webix.ui(roc.sideMenu);
    });
};

roc.noLoginDisplay = function() {
  webix.ui( {
    id: "mainView",
    type: {
      width: "auto"
    },
    rows: [
      { view: "toolbar", padding:3, id: "toolbar", elements: [
        {view: "button", type: "icon", icon: "bars",
						width: 37, align: "left", css: "app_button", click: function(){
							$$("menu").toggle()
						}
					},
          { view: "label", label: "Rapture Operator Console" },
          {},
					{ view: "button", type: "icon", width: 45, css: "app_button", icon: "envelope-o",  badge:4},
					{ view: "button", type: "icon", width: 45, css: "app_button", icon: "bell-o",  badge:10}
      ]},
      { id: "body", cols: [
        roc.sideMenu,
        {}
      ]}
    ]
  });

  webix.ui( {
    view: "window",
    id: "loginWindow",
    position: "center",
    modal : true,
    head: {
      view: "toolbar",
      cols: [
        { view: "label", label: "Login", align: "center"}
      ]
    },
    move: true,
    body: {
      rows: [
          { view: "form", id: "loginForm", elements: [
            { view: "text", name: "user", label: "User", placeholder: "Username"},
            { view: "text", name: "password", label: "Password", type: "password", placeholder: "Password"},
            { margin:5, cols: [
             { view: "button", value: "Login", type: "form", click:"roc.loginButton"},
             { view: "button", value: "Cancel"}
           ]}
         ]
        }
      ]
    }
  }).show();
};

roc.loginButton = function() {
  console.log("Hello login");
  var user = $$("loginForm").getValues().user;
  var password = $$("loginForm").getValues().password;

  console.log("User is " + user + ", password is " + password);

  loginApi.login(user, password, function(text, data) {
    console.log("text is " + text);
    $$("loginWindow").close();
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



roc.noLoginDisplay();
