/**
 * Created by Sven on 02.11.2016.
 */
//Items dont trigger add/remove events
var w_height;
$(document).ready(function() {
  var allGrids=$('.grid-stack');
  var topGrids=$('.grid-stack-1');
  var bottomGrids=$('.grid-stack-5');

  window.addEventListener("resize", function (event) {          //Zeichnet die Endpoints neu wenn sich Fenstergröße verändert
    w_height=$(window).height();
    $('.grid-stack-1').each(function () {
      var grid = $(this).data('gridstack');
      grid.cellHeight(w_height / 6 / 2);
    });
    $('.grid-stack-5').each(function () {
      var grid = $(this).data('gridstack');
      grid.cellHeight(w_height/6);
    });
    jsPlumb.repaintEverything();
  }, false);

  w_height=$(window).height();
  topGrids.gridstack({  //Hier führt Aufruf mit options zu Fehler?! Gleiche Zellhöhe wie letzter Grid
    animate: false,
    height: 1,
    width: 1,        //wie viele passen nebeneinander
    float: false,
    disableResize: true,
    cellHeight: w_height/6/2,
   // cellWidth: 100,
    removable: false,
    removeTimeout: 100,
    minWidth:0,
    verticalMargin: 0 //kein Abstand nach oben
  });
  bottomGrids.gridstack({
    animate: false,
    height: 5,
    width: 5,
    float: true,
    disableResize: true,
    cellHeight: w_height/6,
  //  cellWidth: 200,
    acceptWidgets: '.grid-stack-item',
    removable: false,
    removeTimeout: 100,
    minWidth:0,
    verticalMargin: 0 //kein Abstand nach oben
  });
//  $('#bottom2.grid-stack').gridstack(_.defaults({height: 5}, options)); //Verwende options aber ändere Parameter für heights

  var itemTop = [
    {x: 0, y: 0, width: 1, height:1,  image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 10}
  ];

  topGrids.each(function () {                                                   //Scrollbar wird initialisiert
    var grid = $(this).data('gridstack');
    _.each(itemTop, function (node) {
      grid.addWidget($('<div><div class="grid-stack-item-content">' +
          '<img src=' + node.image +' />' +
          '<span class="value"> value: ' + node.value +'</span></div></div>'),
        node.x, node.y, node.width, node.height);
    }, this);
  });

  var itemBottomOrigin = [
    {x: 0, y: 2, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 0}
  ];
  var itemBottomEnd = [
    {x: 4, y: 2, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 10}
  ];
  var itemBottomBlock = [
    {x: 0, y: 0, width: 1, height: 1},
    {x: 0, y: 1, width: 1, height: 1},
    {x: 0, y: 3, width: 1, height: 1},
    {x: 0, y: 4, width: 1, height: 1},
    {x: 4, y: 0, width: 1, height: 1},
    {x: 4, y: 1, width: 1, height: 1},
    {x: 4, y: 3, width: 1, height: 1},
    {x: 4, y: 4, width: 1, height: 1}
  ];
  var itemBottom = [
    {x: 1, y: 2, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 1},
    {x: 3, y: 0, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 4},
    {x: 2, y: 1, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 2},
    {x: 3, y: 1, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 7}
  ];

  bottomGrids.each(function () {                                              //unterer Gridstack wird initialisiert
    var grid = $(this).data('gridstack');
    _.each(itemBottomOrigin, function (node) {
      grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="origin">' +
          '<div class="grid-stack-item-content">' +
          '<img src=' + node.image +' />' +
          '<span class="value"> value: ' + node.value +'</span></div></div>'),
        node.x, node.y, node.width, node.height);
    }, this);
    _.each(itemBottomEnd, function (node) {
      grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="end">' +
          '<div class="grid-stack-item-content">' +
          '<img src=' + node.image +' />' +
          '<span class="value"> value: ' + node.value +'</span></div></div>'),
        node.x, node.y, node.width, node.height);
    }, this);
    _.each(itemBottomBlock, function (node) {
      grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="block">' +
          '<div class="grid-stack-item-content"/></div>'),
        node.x, node.y, node.width, node.height);
    }, this);
    _.each(itemBottom, function (node) {
      grid.addWidget($('<div>' +
          '<div class="grid-stack-item-content">' +
          '<img src=' + node.image +' />' +
          '<span class="value"> value: ' + node.value +'</span></div></div>'),
        node.x, node.y, node.width, node.height);
    }, this);
  });

  jsPlumb.setContainer("bottomGrid");
  jsPlumb.registerEndpointTypes({
    "source": {
      paintStyle: {fill: "white", outlineStroke:"black", outlineWidth:1},
      hoverPaintStyle: {fill: "green"},
      connectorStyle: {stroke: "black", strokeWidth: 3}
    },
    "target": {
      paintStyle: {fill: "white", outlineStroke:"black", outlineWidth:1},
      hoverPaintStyle: {fill: "blue"}
    }
  });

  jsPlumb.addEndpoint($('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content'), {
    anchor: [1, 0.5, 1, 0],
    maxConnections: -1,
    type: "source",
    isSource: true,
    connector:[ "Flowchart", { stub:10, cornerRadius:5 } ]
  });
  jsPlumb.addEndpoint($('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content'), {
    anchor: [0, 0.5, -1, 0],
    maxConnections: -1,
    type: "target",
    isTarget: true
  });
  jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'),{
    anchor: [1, 0.5, 1, 0],
    maxConnections: -1,
    type: "source",
    isSource: true,
    connector:[ "Flowchart", { stub:10, cornerRadius:5} ]
  });
  jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'),{
    anchor: [0, 0.5, -1, 0],
    maxConnections: -1,
    type: "target",
    isTarget: true
  });
  jsPlumb.repaintEverything();

  var isGrid

  allGrids.on('dragstart', function(event, ui) {
    isGrid=$(event.target).data('gridstack');
  });

  var newEndpoints = allGrids.on('change', function(event, items) {
    if(isGrid==$(event.target).data('gridstack')){
      console.log("nothingChanged")
    }
    else {
      console.log("Changed");
      _.each(items, function (node) {
        var selectedItemContent=node.el.children(":first");
        if (jsPlumb.selectEndpoints({element:selectedItemContent}).length == 0) {     //geht in Schlaufe falls Element aus Scrollbar hinzugefügt wurde
          jsPlumb.addEndpoint((selectedItemContent), {
            anchor: [1, 0.5, 1, 0],
            maxConnections: -1,
            type: "source",
            isSource: true,
            connector:[ "Flowchart", { stub:10, cornerRadius:5} ]
          });
          jsPlumb.addEndpoint((selectedItemContent), {
            anchor: [0, 0.5, -1, 0],
            maxConnections: -1,
            type: "target",
            isTarget: true
          });
        }
      });
    }
    jsPlumb.repaintEverything();
  });

  $('.grid-stack- .grid-stack-item').draggable({
    drag2: function() {
      var offset = $(this).offset();
      var xPos = offset.left;
      var yPos = offset.top;
      console.log($(this));
      console.log('x: ' + xPos);
      console.log('y: ' + yPos);
    }
  })
  allGrids.on('change', function(event, items) {
    console.log("change");
  });
  allGrids.on('dragstart', function(event, ui) {
    console.log("dragstart");
  });
  allGrids.on('removed', function(event, items) {
    console.log("removed");
  });
  allGrids.on('added', function(event, items) {
    console.log("added");
  });
  allGrids.on('disable', function(event) {
    console.log("disabled");
  });
  allGrids.on('enable', function(event) {
    console.log("enabled");
  });
  allGrids.on('dragstop', function(event, ui) {
    jsPlumb.repaintEverything();        //nötig, sonst kein repaint wenn zweimal auf gleiches Feld zurückgedragt
    console.log("dragstop");
   });

  $(self.container).droppable({     //funktioniert nicht
    out: function (event, ui) {
      var el = $(ui.draggable);
      var node = el.data('_gridstack_node'); //eagooqi
      if (node && node._grid != self && node._added) { //eagooqi if not self and is _added by drag accept el
        el.unbind('drag', onDrag);
        node.el = null;
        self.grid.removeNode(node);
        self.placeholder.detach();
        self._updateContainerHeight();
        el.data('_gridstack_node', el.data('_gridstack_node_orig'));
      }
    }
  });
});

//jsPlumb.bind("ready", function () {
//  $('.grid-stack').on('dragstop', function (event, ui) {
//    var element = $(event.target);
//    var node = element.data('_gridstack_node');
//    console.log(node);
//    connection2 = connect(element.children(),$('#final .grid-stack-item-content'));
//    jsPlumb.revalidate(this);
//  });
//});
