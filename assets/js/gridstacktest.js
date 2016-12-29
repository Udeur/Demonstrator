/**
 * Created by Sven on 02.11.2016.
 */
//Items dont trigger add/remove events
$(document).ready(function() {
  var w_height=$(window).height();
  var allGrids=$('.grid-stack');
  var topGrids=$('.grid-stack-1');
  var bottomGrids=$('.grid-stack-5');

  var options = {
    animate: true,
    disableResize: true,
    removable: false,
    removeTimeout: 100,
    minWidth:0,
    verticalMargin: 0 //kein Abstand nach oben
  };

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

  topGrids.gridstack(_.defaults({height: 1, width: 1, float: false, cellHeight: w_height/6/2},  options));
  bottomGrids.gridstack(_.defaults({height: 5, width: 5, float: true,  cellHeight: w_height/6, acceptWidgets: '.grid-stack-item'}, options));

  var itemTop = [
    {x: 0, y: 0, width: 1, height:1,  image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 10}
  ];

  topGrids.each(function () {                                                   //Scrollbar wird initialisiert
    var grid = $(this).data('gridstack');
    _.each(itemTop, function (node) {
      grid.addWidget($('<div><div class="grid-stack-item-content">' +
          '<img src=' + "https://appharbor.com/assets/images/stackoverflow-logo.png" +' />' +
          '<span class="value">' + Math.floor(Math.random() * 10) +'</span></div></div>'),
        0, 0, 1, 1);
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

  bottomGrids.each(function () {                                              //unterer Gridstack wird initialisiert
    var grid = $(this).data('gridstack');
    _.each(itemBottomOrigin, function (node) {
      grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="origin">' +
          '<div class="grid-stack-item-content">' +
          '<img src=' + node.image +' />' +
          '<span class="value">' + node.value +'</span></div></div>'),
        node.x, node.y, node.width, node.height);
    }, this);
    _.each(itemBottomEnd, function (node) {
      grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="end">' +
          '<div class="grid-stack-item-content">' +
          '<img src=' + node.image +' />' +
          '<span class="value">' + node.value +'</span></div></div>'),
        node.x, node.y, node.width, node.height);
    }, this);
    _.each(itemBottomBlock, function (node) {
      grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="block">' +
          '<div class="grid-stack-item-content"/></div>'),
        node.x, node.y, node.width, node.height);
    }, this);
    for(var i=0;i<7;i++){
      grid.addWidget($('<div>' +
          '<div class="grid-stack-item-content">' +
          '<img src=' + "https://appharbor.com/assets/images/stackoverflow-logo.png" +' />' +
          '<span class="value">' + Math.floor(Math.random() * 10) +'</span></div></div>'),
        Math.floor(Math.random() * 3) + 1  , Math.floor(Math.random() * 4), 1, 1);
    }
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
  jsPlumb.bind("ready", function() {
    jsPlumb.setContainer("bottomGrid");
    jsPlumb.registerEndpointTypes({
      "source": {
        paintStyle: {fill: "white", outlineStroke:"black", outlineWidth:1},
        hoverPaintStyle: {fill: "green"},
        connectorStyle: {stroke: "black", strokeWidth: 2}
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

    $('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content').each(function () {                                              //unterer Gridstack wird initialisiert
      var $items = $('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block)');
      function checkFirst(item) {
        var node = $(item).data('_gridstack_node');
        return node.x==1;
      }
      function checkSecond(item) {
        var node = $(item).data('_gridstack_node');
        return node.x==2;
      }
      function checkThird(item) {
        var node = $(item).data('_gridstack_node');
        return node.x==3;
      }
      var firstItems=jQuery.grep($items,checkFirst);
      var secondItems=jQuery.grep($items,checkSecond);
      var thirdItems=jQuery.grep($items,checkThird);

      function connectEndpoints(sourceEndpoint, targetLevel){
        if(targetLevel.length>2) {
          targetLevel.splice((Math.random() * targetLevel.length), 1);
        }
        $(targetLevel).each(function () {
          jsPlumb.connect({
            source: sourceEndpoint,
            target: jsPlumb.selectEndpoints({target: this.firstChild}).get(0),
          });
          $(this).data('isConnected', true);
        });
      }

      function connectEndpointsEnd(sourceEndpoint){
       jsPlumb.connect({
          source: sourceEndpoint,
          target: jsPlumb.selectEndpoints({target: $('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content')}).get(0),
        });
        $(this).data('isConnected', true);
      }
      function connectOrigin() {
        var sourceEndpoint= jsPlumb.selectEndpoints({source: $('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content')}).get(0);
        if(firstItems.length>0) {
          connectEndpoints(sourceEndpoint, firstItems);
        }
        else{
          if(secondItems.length>0) {
            connectEndpoints(sourceEndpoint, secondItems);
          }
          else{
            if(thirdItems.length>0) {
              connectEndpoints(sourceEndpoint, thirdItems);
            }
            else{
              connectEndpointsEnd(sourceEndpoint);
            }
          }
        }
      }
      function connectFirst() {
        $(firstItems).each(function () {
          if ($(this).data('isConnected') == true) {
            var sourceEndpoint = jsPlumb.selectEndpoints({source: this.firstChild}).get(0);
            if (secondItems.length > 0) {
              connectEndpoints(sourceEndpoint, secondItems);
            }
            else {
              if (thirdItems.length > 0) {
                connectEndpoints(sourceEndpoint, thirdItems);
              }
              else {
                connectEndpointsEnd(sourceEndpoint);
              }
            }
          }
        });
      }
      function connectSecond() {
        $(secondItems).each(function () {
          if ($(this).data('isConnected') == true) {
            var sourceEndpoint=jsPlumb.selectEndpoints({source: this.firstChild}).get(0);
            if (thirdItems.length > 0) {
              connectEndpoints(sourceEndpoint, thirdItems);
            }
            else {
              connectEndpointsEnd(sourceEndpoint);
            }
          }
        });
      }
      function connectThird() {
        $(thirdItems).each(function () {
          if ($(this).data('isConnected') == true) {
            var sourceEndpoint=jsPlumb.selectEndpoints({source: this.firstChild}).get(0);
            connectEndpointsEnd(sourceEndpoint);
          }
        });
      }

      connectOrigin();
      connectFirst();
      connectSecond();
      connectThird();

      var sourceItemContentOutside=$('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content');
      var endReached=false;
      while(!endReached) {
        colorConnection(sourceItemContentOutside);
      }
    //  }
      function colorConnection(sourceItemContent) {
        var connections = jsPlumb.getConnections({source: sourceItemContent});
        if(connections.length==0){
          endReached=true;
        }
        else {
          var maxValue = 0;
          for (var i = 0; i < connections.length; i++) {
            var endpointElement = connections[i].endpoints[1].getElement();
            if ($(endpointElement.lastChild).text() > maxValue) {
              maxValue = ($(endpointElement.lastChild).text());
            }
          }
          for (var i = 0; i < connections.length; i++) {
            var endpointElement = connections[i].endpoints[1].getElement();
            if ($(endpointElement.lastChild).text() == maxValue) {
              connections[i].setPaintStyle({
                stroke: "red",
                strokeWidth: 2
              });
         //     $(connections[i]).css("zIndex", 6);
              i = connections.length - 1;
              sourceItemContentOutside = endpointElement
            }
          }
        }
      }
   });

    var isGrid;

    allGrids.on('dragstart', function(event, ui) {
      isGrid=$(event.target).data('gridstack');
    });

    allGrids.on('change', function(event, items) {
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
  });
  jsPlumb.repaintEverything();
});


