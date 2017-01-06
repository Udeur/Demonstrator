/**
 * Created by Sven on 02.11.2016.
 */

// not extendable? http://stackoverflow.com/questions/18142792/how-to-extend-an-object-inside-an-anonymous-function
(function () {
  jsPlumb.bind("ready", function () {

    window.addEventListener("resize", function (event) {          //Zeichnet die Endpoints neu wenn sich Fenstergröße verändert
      w_height = $(window).height();
      $('.grid-stack-1').each(function () {
        var grid = $(this).data('gridstack');
        grid.cellHeight(w_height / 6 / 2);
      });
      $('.grid-stack-5').each(function () {
        var grid = $(this).data('gridstack');
        grid.cellHeight(w_height / 6);
      });
      jsPlumb.repaintEverything();
    }, false);

    var w_height = $(window).height();
    var allGrids = $('.grid-stack');
    var topGrids = $('.grid-stack-1');
    var bottomGrids = $('.grid-stack-5');

    jsPlumb.setContainer("bottomGrid");
    jsPlumb.registerEndpointTypes({
      "source": {
        paintStyle: {fill: "transparent", outlineStroke: "transparent", outlineWidth: 1},
        hoverPaintStyle: {fill: "white", outlineStroke: "#346789", outlineWidth: 1},
        connectorStyle: {stroke: "#123456", strokeWidth: 3}
      },
      "target": {
        paintStyle: {fill: "transparent", outlineStroke: "transparent", outlineWidth: 1},
        hoverPaintStyle: {fill: "white", outlineStroke: "#346789", outlineWidth: 1},
      }
    });

    initializeGrids();
    fillGrids();
    addEndpoints();
    connectEndpoints();
    highlightBestPath();
    dijkstra();
    paintPath();

    allGrids.on('dragstop', function (event, ui) {
      jsPlumb.repaintEverything();        //nötig, sonst kein repaint wenn zweimal auf gleiches Feld zurückgedragt
    });

    var isGrid;

    allGrids.on('dragstart', function (event, ui) {
      isGrid=$(this).data('gridstack');
    });

    allGrids.on('change', function (event, items) {
      if (isGrid == $(event.target).data('gridstack')) {
        console.log("nothingChanged")
      }
      else {
        console.log("sthChanged");
        if(isGrid!=bottomGrids.data('gridstack')) {
          console.log("addedToBottomGrid");
          _.each(items, function (node) {
            var selectedItemContent = node.el.children(":first");
            if (jsPlumb.selectEndpoints({element: selectedItemContent}).length == 0) {     //geht in Schlaufe falls Element aus Scrollbar hinzugefügt wurde
              jsPlumb.addEndpoint((selectedItemContent), {
                anchor: [1, 0.5, 1, 0],
                maxConnections: -1,
                type: "source",
                isSource: true,
                connector: ["Flowchart", {stub: 10, cornerRadius: 5}]
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
        else {
          console.log("addedToTopGrid");
          _.each(items, function (node) {
            var selectedItemContent = node.el.children(":first");
            console.log(selectedItemContent);
            jsPlumb.detachAllConnections(selectedItemContent);
            var selectedEndpointSource = jsPlumb.selectEndpoints({source: $(selectedItemContent)}).get(0);
            var selectedEndpointsTarget = jsPlumb.selectEndpoints({target: $(selectedItemContent)}).get(0);
            jsPlumb.deleteEndpoint(selectedEndpointSource);
            jsPlumb.deleteEndpoint(selectedEndpointsTarget)
            selectedItemContent[0].classList.remove("jtk-endpoint-anchor", "jtk-connected");
            selectedItemContent.removeAttr('id');
            console.log(selectedItemContent);
            $(selectedItemContent[0].childNodes[2]).text("");
          });
        }
      }
      jsPlumb.repaintEverything();
    });
    jsPlumb.bind("connection", function(info) {
      dijkstra();
      paintPath();
    });
    jsPlumb.bind("connectionDetached", function(info) {
      dijkstra();
      paintPath();
    });
    allGrids.on('change', function (event, items) {
      console.log("change");
    });
    allGrids.on('dragstart', function (event, ui) {
      console.log("dragstart");
    });
    allGrids.on('removed', function (event, items) {
      console.log("removed");
    });
    allGrids.on('added', function (event, items) {
      console.log("added");
    });
    allGrids.on('disable', function (event) {
      console.log("disabled");
    });
    allGrids.on('enable', function (event) {
      console.log("enabled");
    });
    allGrids.on('dragstop', function (event, ui) {
      console.log("dragstop");
    });

    function initializeGrids() {
      var options = {
        animate: true,
        disableResize: true,
        removable: false,
        removeTimeout: 100,
        minWidth: 0,
        verticalMargin: 0 //kein Abstand nach oben
      };
      topGrids.gridstack(_.defaults({
        height: 1,
        width: 1,
        float: false,
        cellHeight: w_height / 6 / 2,
        acceptWidgets: '.grid-stack-item'
      }, options));
      bottomGrids.gridstack(_.defaults({
        height: 5,
        width: 5,
        float: true,
        cellHeight: w_height / 6,
        acceptWidgets: '.grid-stack-item'
      }, options));
    }

    function fillGrids() {
      fillTopGrids();
      fillBottomGrids();
    }

    function fillTopGrids() {
      var counter = 0;
      var itemTop = [
        {
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          image: "https://appharbor.com/assets/images/stackoverflow-logo.png",
          value: 10
        }
      ];
      topGrids.each(function () {                                                   //Scrollbar wird initialisiert
        var grid = $(this).data('gridstack');
        _.each(itemTop, function (node) {
          if(counter<7){
          grid.addWidget($('<div><div class="grid-stack-item-content">' +
              '<img src=' + "https://appharbor.com/assets/images/stackoverflow-logo.png" + ' />' +
              '<span class="value">' + Math.floor(Math.random() * 10) + '</span>' +
             '<span class="startTime"></span></div></div>'),
            0, 0, 1, 1);
          }
          counter++;
      }, this);
      });
    }

    function fillBottomGrids() {
      var itemBottomOrigin = [
        {
          x: 0,
          y: 2,
          width: 1,
          height: 1,
          image: "https://appharbor.com/assets/images/stackoverflow-logo.png",
          value: 0
        }
      ];
      var itemBottomEnd = [
        {
          x: 4,
          y: 2,
          width: 1,
          height: 1,
          image: "https://appharbor.com/assets/images/stackoverflow-logo.png",
          value: 0
        }
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
              '<img src=' + node.image + ' />' +
              '<span class="value">' + node.value + '</span>' +
              '<span class="startTime">' + node.value + '</span></div></div>'),
            node.x, node.y, node.width, node.height);
        }, this);
        _.each(itemBottomEnd, function (node) {
          grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="end">' +
              '<div class="grid-stack-item-content">' +
              '<img src=' + node.image + ' />' +
              '<span class="value">' + node.value + '</span>' +
              '<span class="startTime"></span></div></div>'),
            node.x, node.y, node.width, node.height);
        }, this);
        _.each(itemBottomBlock, function (node) {
          grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="block">' +
              '<div class="grid-stack-item-content"/></div>'),
            node.x, node.y, node.width, node.height);
        }, this);
        for (var i = 0; i < 7; i++) {
          var x = Math.floor(Math.random() * 3)+1;
          var y = Math.floor(Math.random() * 5);
          if (grid.willItFit(x, y, 1, 1, false)) {
            grid.addWidget($('<div>' +
                '<div class="grid-stack-item-content">' +
                '<img src=' + "https://appharbor.com/assets/images/stackoverflow-logo.png" + ' />' +
                '<span class="value">' + Math.floor(Math.random() * 10) + '</span>' +
                '<span class="startTime"></span></div></div>'),
              x, y, 1, 1);
          }
        }
      });
    }

    function addEndpoints() {
      jsPlumb.addEndpoint($('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content'), {
        anchor: [1, 0.5, 1, 0],
        maxConnections: -1,
        type: "source",
        isSource: true,
        connector: ["Flowchart", {stub: 10, cornerRadius: 5}]
      });
      jsPlumb.addEndpoint($('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content'), {
        anchor: [0, 0.5, -1, 0],
        maxConnections: -1,
        type: "target",
        isTarget: true,
      });
      jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'), {
        anchor: [1, 0.5, 1, 0],
        maxConnections: -1,
        type: "source",
        isSource: true,
        connector: ["Flowchart", {stub: 10, cornerRadius: 5}],
      });
      jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'), {
        anchor: [0, 0.5, -1, 0],
        maxConnections: -1,
        type: "target",
        isTarget: true,
      });
    }

    function connectEndpoints() {
      $('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content').each(function () {                                              //unterer Gridstack wird initialisiert
        var $items = $('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block)');

        var firstItems = jQuery.grep($items, checkFirst);
        var secondItems = jQuery.grep($items, checkSecond);
        var thirdItems = jQuery.grep($items, checkThird);

        var sourceEndpoint = jsPlumb.selectEndpoints({source: $('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content')}).get(0);
        if (firstItems.length > 0) {
          connectEndpointsMiddle(sourceEndpoint, firstItems);
        }
        else {
          if (secondItems.length > 0) {
            connectEndpointsMiddle(sourceEndpoint, secondItems);
          }
          else {
            if (thirdItems.length > 0) {
              connectEndpointsMiddle(sourceEndpoint, thirdItems);
            }
            else {
              connectEndpointsEnd(sourceEndpoint);
            }
          }
        }

        $(firstItems).each(function () {
          if ($(this).data('isConnected') == true) {
            sourceEndpoint = jsPlumb.selectEndpoints({source: this.firstChild}).get(0);
            if (secondItems.length > 0) {
              connectEndpointsMiddle(sourceEndpoint, secondItems);
            }
            else {
              if (thirdItems.length > 0) {
                connectEndpointsMiddle(sourceEndpoint, thirdItems);
              }
              else {
                connectEndpointsEnd(sourceEndpoint);
              }
            }
          }
        });

        $(secondItems).each(function () {
          if ($(this).data('isConnected') == true) {
            sourceEndpoint = jsPlumb.selectEndpoints({source: this.firstChild}).get(0);
            if (thirdItems.length > 0) {
              connectEndpointsMiddle(sourceEndpoint, thirdItems);
            }
            else {
              connectEndpointsEnd(sourceEndpoint);
            }
          }
        });

        $(thirdItems).each(function () {
          if ($(this).data('isConnected') == true) {
            sourceEndpoint = jsPlumb.selectEndpoints({source: this.firstChild}).get(0);
            connectEndpointsEnd(sourceEndpoint);
          }
        });
      });
    }

    function checkFirst(item) {
      var node = $(item).data('_gridstack_node');
      return node.x == 1;
    }

    function checkSecond(item) {
      var node = $(item).data('_gridstack_node');
      return node.x == 2;
    }

    function checkThird(item) {
      var node = $(item).data('_gridstack_node');
      return node.x == 3;
    }

    function connectEndpointsMiddle(sourceEndpoint, targetLevel) {
      if (targetLevel.length > 2) {
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

    function connectEndpointsEnd(sourceEndpoint) {
      jsPlumb.connect({
        source: sourceEndpoint,
        target: jsPlumb.selectEndpoints({target: $('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content')}).get(0),
      });
      $(this).data('isConnected', true);
    }
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    function resetValues(){
      $('.grid-stack-5 .grid-stack-item .grid-stack-item-content').each(function () {
        console.log(this);
        console.log($(this));
        this.isInQueue=false;
        this.hasBeenVisited=false;
        this.predecessor="none";
        $(this.childNodes[2]).text("");
      });
    }

    function dijkstra(){
      console.log("dijkstra");
      resetValues();
      var arrQueue = [];
      arrQueue.push($('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content')[0]);
      $(arrQueue[0].childNodes[2]).text($(arrQueue[0].childNodes[1]).text());
      arrQueue[0].predecessor="none";
      while(arrQueue.length>0){
        arrQueue[0].hasBeenVisited=true;
        var arrNeighbours=[];
        var connections = jsPlumb.getConnections({source: arrQueue[0]});
        for (var i = 0; i < connections.length; i++) {
          arrNeighbours.push(connections[i].endpoints[1].getElement());
        }
        arrNeighbours = arrNeighbours.filter( onlyUnique );
        for (var i = 0; i < arrNeighbours.length; i++) {
          var currentDistance;
          if($(arrNeighbours[i].childNodes[2]).text()==""){
            currentDistance = Number.POSITIVE_INFINITY;
          }
          else{
            currentDistance=parseInt($(arrNeighbours[i].childNodes[2]).text());
          }
          if(arrNeighbours[i].isInQueue==true) {
            if (parseInt($(arrQueue[0].childNodes[2]).text()) + parseInt($(arrNeighbours[i].childNodes[1]).text()) < currentDistance) {
              $(arrNeighbours[i].childNodes[2]).text(parseInt($(arrQueue[0].childNodes[2]).text()) + parseInt($(arrNeighbours[i].childNodes[1]).text()));
              arrNeighbours[i].predecessor=arrQueue[0];
            }
          }
          else{
            if(arrNeighbours[i].hasBeenVisited!=true){
              arrQueue.push(arrNeighbours[i]);
              arrNeighbours[i].isInQueue=true;
              $(arrNeighbours[i].childNodes[2]).text(parseInt($(arrQueue[0].childNodes[2]).text()) + parseInt($(arrNeighbours[i].childNodes[1]).text()));
              arrNeighbours[i].predecessor=arrQueue[0];
            }
          }
        }
        arrQueue.splice(0,1);
      }
    }
    function resetPaint(){
      var allConnections = jsPlumb.getConnections();
      for(var i = 0; i < allConnections.length; i++) {
        allConnections[i].setPaintStyle({
          stroke: "#123456",
          strokeWidth: 3
        });
        $(allConnections[i].canvas).removeClass("bestPath");
      }
    }
    function paintPath(){
      console.log("paintPath");
      resetPaint();
      var lastContent = $('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content')[0];
      while(lastContent.predecessor!="none"){
        var preContent = lastContent.predecessor;
        var lastConnections = jsPlumb.getConnections({target: lastContent});
        for (var i = 0; i < lastConnections.length; i++) {
          var endpointElement = lastConnections[i].endpoints[0].getElement();
          if (endpointElement==preContent) {
            $(lastConnections[i].canvas).addClass("bestPath");        //Fügt CSS Klasse hinzu anhand der später in den Vordergrund gehoben werden kann
            lastConnections[i].setPaintStyle({
              stroke: "red",
              strokeWidth: 3
            });
            i = lastConnections.length - 1;
          }
        }
        lastContent=preContent;
      }
    }

    function highlightBestPath() {
      var sourceItemContent = $('.grid-stack-5 #oriin.grid-stack-item .grid-stack-item-content');
      var endReached = false;

      while (!endReached) {
        var connections = jsPlumb.getConnections({source: sourceItemContent});
        if (connections.length == 0) {
          endReached = true;
        }
        else {
          var minValue = Number.POSITIVE_INFINITY;
          for (var i = 0; i < connections.length; i++) {
            var endpointElement = connections[i].endpoints[1].getElement();
            if ($(endpointElement.lastChild).text() < minValue) {
              minValue = ($(endpointElement.lastChild).text());
            }
          }
          for (var i = 0; i < connections.length; i++) {
            var endpointElement = connections[i].endpoints[1].getElement();
            if ($(endpointElement.lastChild).text() == minValue) {
              $(connections[i].canvas).addClass("bestPath");        //Fügt CSS Klasse hinzu anhand der später in den Vordergrund gehoben werden kann
              connections[i].setPaintStyle({
                stroke: "red",
                strokeWidth: 3
              });
              i = connections.length - 1;
              sourceItemContent = endpointElement
            }
          }
        }
      }
    }
  });
})();
