// Given a url to a script, use it to construct and bind a window (and display it)

var rocWindow = {};
var rocDataFns = {};

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(), !mm[1] && '0', mm, !dd[1] && '0', dd].join(''); // padding
};

rocWindow.windowTemplate = {
  view: "window",
  left: 100,
  top: 100,
  width: 800,
  height: 500,
  head: {
    view: "toolbar",
    cols: [
      { view: "label", label: "Inventory viewer", align: "center"},
      { view:"button", type: "icon", icon: "minus-square", width:30, click:("$$('mortgageView').close();")}
    ]
  },
  move: true,
  resize: true,
  body: {
    rows: [
      {

      },
      {
        view: "toolbar",
        cols : [
        ]
      }
    ]
  }
};

rocWindow.go = function(params, script) {
    // params is an array containing
    // name, id, type

    var vals = {};
    for(var i=0; i< params.length; i++) {
      if (params[i].type == 'calendar') {
        vals[params[i].name] = $$(params[i].id).getSelectedDate().yyyymmdd();
      } else if (params[i].type == 'list') {
        vals[params[i].name] = $$(params[i].id).getSelectedItem().id;
      }
    }
    rocWindow.show(script, vals);
};

rocWindow.showEntity = function(entityName) {
    var params = {};
    params.entity = entityName;
    webix.ajax().headers({'xrapture' : roc.xRapture}).get('/webscript/entity/entityInfo', params,
      function(text, data) {
          var val = JSON.parse(text);
          var x = JSON.parse(JSON.stringify(rocWindow.windowTemplate));
          var dataTree = {};
          x.id = entityName;
          x.head.cols[1].click = "$$('" + entityName + "').close();";
          x.head.cols[0].label = entityName;
          dataTree.view = "treetable";
          dataTree.columns = val.columns;
          dataTree.select = "cell";
          for(var i=0; i< dataTree.columns.length; i++) {
            if (dataTree.columns[i].id == "id") {
                dataTree.columns[i].template = "{common.treetable()} #id#";
            }
          }
          dataTree.data = val.data;
          dataTree.on = {};
          dataTree.on.onAfterSelect = function(id) {
            var x = id;
          }
          x.body = dataTree;
          webix.ui(x).show();
      });
};

rocWindow.show = function(windowName, params) {
  webix.ajax().headers({'x-rapture' : roc.xRapture}).get('/webscript/window/' + windowName, params,
     function(text, data) {
       var val = JSON.parse(text);
       var webixConfig = val.webix;
       var x = JSON.parse(JSON.stringify(rocWindow.windowTemplate));
       x.head.cols[0].label = val.config.title;
       if (val.config.color) {
         x.head.cols[0].css = val.config.color;
       }
       x.id = val.config.id;
       x.head.cols[1].click = "$$('" + val.config.id + "').close();";

       // Now setup buttons
       if (val.config.footer.buttons || val.config.excel) {
          x.body.rows[0] = webixConfig;
          if (val.config.footer.buttons) {
          for(var i=0; i< val.config.footer.buttons.length; i++) {
            var b = {};
            b.view = "button";
            b.label = val.config.footer.buttons[i].title;
            b.width = 50;
            b.click = "rocWindow.go(" + JSON.stringify(val.config.footer.buttons[i].params) + ", '" + val.config.footer.buttons[i].script + "');";
            x.body.rows[1].cols.push(b);
          }
        }
        if (val.config.excel) {
          var b = {};
          b.view = "button";
          b.label = "Excel";
          b.width = 50;
          b.click = "webix.toExcel($$('" + val.webix.id + "'), { filename : '" + val.webix.id + "'});";
          x.body.rows[1].cols.push(b);
        }
       } else {
         x.body = webixConfig;
       }
       webix.ui(x).show();
     });
};
