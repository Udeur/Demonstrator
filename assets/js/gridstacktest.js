/**
 * Created by Sven on 02.11.2016.
 */
var instance;
// not extendable? http://stackoverflow.com/questions/18142792/how-to-extend-an-object-inside-an-anonymous-function
(function () {
  jsPlumb.bind("ready", function () {

    window.addEventListener("resize", function () {          //Zeichnet die Endpoints und connections neu wenn sich Fenstergröße verändert
      w_height = $(window).height();
      $('.grid-stack-1').each(function () {
        var grid = $(this).data('gridstack');
        grid.cellHeight(w_height / 6 / 2);
      });
      $('.grid-stack-5').each(function () {
        var grid = $(this).data('gridstack');
        grid.cellHeight(w_height / 6);
      });
      instance.repaintEverything();
    }, false);

    var w_height = $(window).height();
    var allGrids = $('.grid-stack');
    var topGrids = $('.grid-stack-1:not(#containsButton)');
    var buttonGrid=$('#containsButton.grid-stack-1');
    var bottomGrids = $('.grid-stack-5');

    $('body').on('show.bs.modal', function () {
      $('#largePopup .modal-body').css('overflow-y', 'auto');

      $('#largePopup .modal-body').css('max-height', $(window).height() * 0.7);

      $('.selectpicker').selectpicker('refresh');
    });

    $('.selectpicker').selectpicker({
      style: 'btn-info',
      size: 4
    });


    $('[data-toggle="popover"]').popover();

    $("#myModal").on("submit", function(e) {
     var path = ($('.selectpicker option:selected').text());
      var duration;
      var price;
      var comfort
      if(isNaN($('#duration')[0].value)||$('#duration')[0].value==""){
        duration=Math.floor(Math.random() * 10);
      }
      else{
        duration=$('#duration')[0].value;
      }
      if(isNaN($('#price')[0].value)||$('#price')[0].value==""){
        price=Math.floor(Math.random() * 1000);
      }
      else{
        price=$('#price')[0].value;
      }
      if(isNaN($('#comfort')[0].value)||$('#comfort')[0].value==""){
        comfort=Math.floor(Math.random() * 3)+1;
      }
      else{
        comfort=$('#comfort')[0].value;
      }
      var added=false;
      topGrids.each(function () {
        if(!added) {
          var grid = $(this).data('gridstack');
          if (grid.willItFit(0, 0, 1, 1, false)) {
            grid.addWidget($('<div>' +
                '<div class="grid-stack-item-content" ' +
                'data-duration="'+duration+'" ' +
                'data-price="'+price+'" ' +
                'data-comfort="'+comfort+'"> ' +
              '<img src=' + path + ' />' +
              '<span class="value">' + duration + '</span>' +
              '<span class="startTime"></span></div></div>'),
              0, 0, 1, 1);
            added = true;
          }
        }
      });
    });

    $("#submitForm").on('click', function() {
      $("#myModal").submit();
    });

    instance = window.jsp = jsPlumb.getInstance({
      ConnectionOverlays: [
        [ "Arrow", {
          location: 1,
          visible:true,
          width:8,
          length:8,
          id:"ARROW",
          events:{
            click:function() { alert("you clicked on the arrow overlay")}
          }
        } ]
      ],
      PaintStyle: {stroke: "#346789", strokeWidth: 1,  joinstyle: "round"},
      HoverPaintStyle: {stroke: "#123456", strokeWidth:3},
      Connector: ["Flowchart", {stub: 10, cornerRadius: 4, gap: 2}],
      Container: "bottomGrid",
      MaxConnections: -1,
      Endpoint:[ "Dot", { radius:7 } ],
      EndpointStyle: {fill: "transparent", outlineStroke: "transparent", outlineWidth: 1},
      EndpointHoverStyle: {fill: "white", outlineStroke: "#346789", outlineWidth: 1}
    });

    initializeGrids();
    fillGrids();
    addEndpoints();
    connectEndpoints();
    dijkstra();
    paintPath();

    window.setTimeout(function(){                                                           //Zeichne alles nach 10 Millisekunden nochmal
        instance.repaintEverything()},
        10
    );

    allGrids.on('dragstop', function (event, ui) {
      instance.repaintEverything();                                                          //nötig, sonst kein repaint wenn zweimal auf gleiches Feld zurückgedragt
    });

    var isGrid;                                                                             //Welches Grid einem Event zu Grunde liegt

    allGrids.on('dragstart', function (event, ui) {
      isGrid=$(this).data('gridstack');                                                     //Speichere Grid, in dem dragstart Event ausgelöst wurde in isGrid ab
    });

    allGrids.on('change', function (event, items) {
      if (isGrid == $(event.target).data('gridstack')) {                                     //Überprüfe ob das Grid auf dem Change Event endet das selbe ist wie isGrid
        console.log("nothingChanged")
      }
      else {                                                                                 //Wenn es von isGrid abweicht
        console.log("sthChanged");
        if(isGrid!=bottomGrids.data('gridstack')&&isGrid!="none") {                                         //Wenn isGrid nicht das untere Grid ist --> zu unterem Grid hinzugefügt
          console.log(isGrid);
          console.log("addedToBottomGrid");
          _.each(items, function (node) {                                                     //Für jedes hinzugefügte Widget (nur eines im Normalfall)
            var selectedItemContent = node.el.children(":first");                             //Wählt itemContent aus
            if (instance.selectEndpoints({element: selectedItemContent}).length == 0) {       //geht in Schlaufe falls keine Endpoints existieren (eigentlich immer, Sicherheitscheck)
              instance.addEndpoint((selectedItemContent), {                                    //Fügt neuen Source Endpoint hinzu
                anchor: [1, 0.5, 1, 0],
                isSource: true,
              });
              instance.addEndpoint((selectedItemContent), {                                    //Fügt neuen Target Endpoint hinzu
                anchor: [0, 0.5, -1, 0],
                isTarget: true
              });
            }
          });
        }
        else {                                                                                //Wenn isGrid das untere Grid ist --> zu oberem Grid hinzugefügt
          console.log("addedToTopGrid");
          _.each(items, function (node) {                                                      //Für jedes hinzugefügte Widget (nur eines im Normalfall)
            var selectedItemContent = node.el.children(":first");                               //Wählt itemContent aus
            instance.detachAllConnections(selectedItemContent);                                  //Entfernt alle Connections des itemContents
            var selectedEndpointSource = instance.selectEndpoints({source: $(selectedItemContent)}).get(0);  //Wählt Source Endpoint aus
            var selectedEndpointsTarget = instance.selectEndpoints({target: $(selectedItemContent)}).get(0);  //Wählt Target Endpoint aus
            instance.deleteEndpoint(selectedEndpointSource);                                       //entfernt Source Endpoint
            instance.deleteEndpoint(selectedEndpointsTarget);                                      //Entfernt Target Endpoint
            selectedItemContent[0].classList.remove("jtk-endpoint-anchor", "jtk-connected");      //Entfernt jsPlumb Attribute
            selectedItemContent.removeAttr('id');                                                 //Entfernt jsPlumb id
            $(selectedItemContent[0].childNodes[2]).text("");                                     //Entfernt Distanz
          });
        }
      }
    });

    instance.bind("connection", function(info) {                                                     //Wenn Verbindung erstellt wurde
      var con=info.connection;
      var arr=instance.select({source:con.sourceId,target:con.targetId});
      if(arr.length>1){
        instance.detach(con);                                                                        //Verhindert doppelte Verbindungen. Problem: Hover funktioniert noch nicht direkt wieder
      }
      dijkstra();                                                                                   //berechne Distanzen
      paintPath();                                                                                   //Zeichne kürzesten Web
    });
    instance.bind("connectionDetached", function(info) {                                             //Wenn Verbindung erstellt wurde
      dijkstra();                                                                                   //berechne Distanzen
      paintPath();                                                                                  //Zeichne kürzesten Web
    });
    allGrids.on('change', function (event, items) {                                                  //Zeigt Change Events an
      console.log("change");
    });
    allGrids.on('dragstart', function (event, ui) {                                                     //Zeigt dragstart Events an
      console.log("dragstart");
    });
    allGrids.on('removed', function (event, items) {                                                  //zeigt Removed Events an
      console.log("removed");
    });
    allGrids.on('added', function (event, items) {                                                    //Zeigt added Events an
      isGrid="none";
      console.log("added");
    });
    allGrids.on('disable', function (event) {                                                          //Zeigt disabled Events an
      console.log("disabled");
    });
    allGrids.on('enable', function (event) {                                                            //Zeigt enable Events an
      console.log("enabled");
    });
    allGrids.on('dragstop', function (event, ui) {                                                      //Zeigt dragstop Events an
      console.log("dragstop");
    });

    function initializeGrids() {
      var options = {                                                                                    //Parameter die für obere und untere Grids gelten
        animate: true,
        disableResize: true,
        removable: false,
        removeTimeout: 100,
        verticalMargin: 0,                                                                                //kein Abstand nach oben
        acceptWidgets: '.grid-stack-item',
        minWidth:0
      };
      buttonGrid.gridstack(_.defaults({                                                                    //Oberes Grid
        height: 1,
        width: 1,
        float: false,
        cellHeight: w_height / 6 / 2

      }, options));
      topGrids.gridstack(_.defaults({                                                                    //Oberes Grid
        height: 1,
        width: 1,
        float: false,
        cellHeight: w_height / 6 / 2,

      }, options));
      bottomGrids.gridstack(_.defaults({                                                                  //unteres Grid
        height: 5,
        width: 5,
        float: true,
        cellHeight: w_height / 6,
      }, options));
    }

    function fillGrids() {
      fillButtonGrid();
      fillTopGrids();
      fillBottomGrids();
    }

    function fillButtonGrid() {
      console.log("here");
      buttonGrid.each(function () {
        console.log(this);
        var grid = $(this).data('gridstack');
        console.log(grid);
            grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" class="pck pck-auto" id="button">' +
                '<div class="grid-stack-item-content">' +
                '<button type="button" class="btn btn-info btn-block" data-toggle="modal" data-target="#myModal"><b>+ / -</b></button></div></div>'),
              0, 0, 1, 1);
      });
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
      topGrids.each(function () {                                                                         //Für jedes Grid in Scrollbar
        var grid = $(this).data('gridstack');
        _.each(itemTop, function (node) {
          if(counter<7){                                                                                   //Füge für die ersten 7 Grids ein Widget hinzu
            var duration= Math.floor(Math.random() * 10);
            var price= + Math.floor(Math.random() * 1000);
            var comfort= Math.floor(Math.random() * 3) + 1;
            grid.addWidget($('<div>'+
                '<div class="grid-stack-item-content"' +
                'data-duration="' + duration + '" ' +
                'data-price="' + price + '" ' +
                'data-comfort="' + comfort +'">' +
                '<img src=' + randomLink() + ' /></div></div>'),//' +
          //      '<span class="value">' + duration + '</span>' +
          ///      '<span class="startTime"></span></div></div>'),
              0, 0, 1, 1);
          }
          counter++;
      }, this);
      });
    }

    function fillBottomGrids() {
      var itemBottomOrigin = [                                                                               //Origin Element
        {
          x: 0,
          y: 2,
          width: 1,
          height: 1,
          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Home_font_awesome.svg/200px-Home_font_awesome.svg.png",
          value: 0,
          price: 0,
          comfort: 1
        }
      ];
      var itemBottomEnd = [                                                                                   //End Element
        {
          x: 4,
          y: 2,
          width: 1,
          height: 1,
          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Home_font_awesome.svg/200px-Home_font_awesome.svg.png",
          value: 0,
          price: 0,
          comfort: 0,
        }
      ];
      var itemBottomBlock = [                                                                                  //leere Elemente in erster und letzter Spalte
        {x: 0, y: 0, width: 1, height: 1},
        {x: 0, y: 1, width: 1, height: 1},
        {x: 0, y: 3, width: 1, height: 1},
        {x: 0, y: 4, width: 1, height: 1},
        {x: 4, y: 0, width: 1, height: 1},
        {x: 4, y: 1, width: 1, height: 1},
        {x: 4, y: 3, width: 1, height: 1},
        {x: 4, y: 4, width: 1, height: 1}
      ];

      bottomGrids.each(function () {                                                                             //unterer Gridstack wird initialisiert
        var grid = $(this).data('gridstack');
        _.each(itemBottomOrigin, function (node) {                                                               //Fügt Origin Element hinzu
          grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="origin">' +                       //Nicht beweglich
              '<div class="grid-stack-item-content"' +
              'data-duration=' + node.value + ' ' +
              'data-price=' + node.price + ' ' +
              'data-comfort=' + node.comfort +'>' +
              '<img src=' + node.image + ' />' +
              '<span class="value">' + node.value + '</span>' +
              '<span class="startTime">' + node.value + '</span></div></div>'),
            node.x, node.y, node.width, node.height);
        }, this);
        _.each(itemBottomEnd, function (node) {                                                                   //Fügt End Element hinzu
          grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="end">' +                          //Nicht beweglich
              '<div class="grid-stack-item-content"' +
              'data-duration=' + node.value + ' ' +
              'data-price=' + node.price + ' ' +
              'data-comfort=' + node.comfort +'>' +
              '<img src=' + node.image + ' />' +
              '<span class="value">' + node.value + '</span>' +
              '<span class="startTime"></span></div></div>'),
            node.x, node.y, node.width, node.height);
        }, this);
        _.each(itemBottomBlock, function (node) {                                                                  //Fügt Block Elemente hinzu
          grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="block">' +                          //Nicht beweglich
              '<div class="grid-stack-item-content"/></div>'),
            node.x, node.y, node.width, node.height);
        }, this);
        for (var i = 0; i < 7; i++) {                                                                               //Fügt bis zu 7 zufällige Widgets hinzu
          var x = Math.floor(Math.random() * 3)+1;                                                                  //Wert aus [1,3]
          var y = Math.floor(Math.random() * 5);                                                                    //Wert aus [0,4]
          if (grid.willItFit(x, y, 1, 1, false)) {                                                                  //Nur wenn es an dieser x,y Position hinzugefügt werden kann
            var duration= Math.floor(Math.random() * 10);
            var price= + Math.floor(Math.random() * 1000);
            var comfort= Math.floor(Math.random() * 3) + 1;
            grid.addWidget($('<div>' +
                '<div class="grid-stack-item-content"' +
                'data-duration=' + duration + ' ' +
                'data-price=' + price + ' ' +
                'data-comfort=' + comfort +'>' +
                '<img src=' + randomLink() + ' />' +
                '<span class="value">' + duration + '</span>' +                               //Wert aus [0,9]
                '<span class="startTime"></span></div></div>'),
              x, y, 1, 1);
          }
        }
      });
    }

    function addEndpoints() {
      instance.addEndpoint($('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content'), {                     //Source Endpoint Für Origin Element
        anchor: "Right",
        isSource: true,
      });
      instance.addEndpoint($('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content'), {                         //Target Endpoint Für End Element
        anchor: "Left",
        isTarget: true
      });
      instance.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'), {    //Source Endpoint Für alle normalen Widgets
        anchor: "Right",
        isSource: true,
      });
      instance.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'), {    //Target Endpoint Für alle normalen Widgets
        anchor: "Left",
        isTarget: true
      });
    }

    function connectEndpoints() {
      var sourceEndpoint = instance.selectEndpoints({source: $('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content')}).get(0);   //Wählt den Source Endpoint von origin aus
      var $items = $('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block)');                                        //Alle normalen Widgets

      var firstItems = jQuery.grep($items, checkFirst);                                                                   //Widgets mit x=1
      var secondItems = jQuery.grep($items, checkSecond);                                                                 //Widgets mit x=2
      var thirdItems = jQuery.grep($items, checkThird);                                                                   //Widgets mit x=3

      removeOneIfGreater2(firstItems);
      removeOneIfGreater2(secondItems);
      removeOneIfGreater2(thirdItems);

      console.log(firstItems);
      console.log(secondItems);
      console.log(thirdItems);

      connectOrigin(sourceEndpoint,firstItems,secondItems,thirdItems);
      connectFirstItems(firstItems,secondItems,thirdItems);
      connectSecondItems(secondItems,thirdItems);
      connectThirdItems(thirdItems);

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
    function removeOneIfGreater2(items){
      if (items.length > 2) {                                                                       //Wenn es mehr als zwei Elemente auf der nächsten Stufe gibt verbinde ein zufällig ausgewähltes nicht
        items.splice((Math.random() * items.length), 1);
      }
    }

    function connectOrigin(sourceEndpoint,firstItems,secondItems,thirdItems) {
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
            connectEndpointsEnd(sourceEndpoint);                                                                            //Wenn es keine weiteren Elemente gibt verbinde mit Target Endpoint des end Elements
          }
        }
      }
    }

    function connectFirstItems(firstItems,secondItems,thirdItems) {
      $(firstItems).each(function () {
        var sourceEndpoint = instance.selectEndpoints({source: this.firstChild}).get(0);
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
      });
    }

    function connectSecondItems(secondItems,thirdItems) {
      $(secondItems).each(function () {
        var sourceEndpoint = instance.selectEndpoints({source: this.firstChild}).get(0);
        if (thirdItems.length > 0) {
          connectEndpointsMiddle(sourceEndpoint, thirdItems);
        }
        else {
          connectEndpointsEnd(sourceEndpoint);
        }
      });
    }

    function connectThirdItems(thirdItems) {
      $(thirdItems).each(function () {
        var sourceEndpoint = instance.selectEndpoints({source: this.firstChild}).get(0);
        connectEndpointsEnd(sourceEndpoint);
      });
    }

    function connectEndpointsMiddle(sourceEndpoint, targetLevel) {
      $(targetLevel).each(function () {
        instance.connect({
          source: sourceEndpoint,
          target: instance.selectEndpoints({target: this.firstChild}).get(0)
        });
      });
    }

    function connectEndpointsEnd(sourceEndpoint) {
      instance.connect({
        source: sourceEndpoint,
        target: instance.selectEndpoints({target: $('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content')}).get(0)   //Verbinde mit Target Endpoint des end Elements
      });
      console.log(sourceEndpoint);
    }

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    function resetValues(){
      $('.grid-stack-5 .grid-stack-item .grid-stack-item-content').each(function () {                    //Setzte für jedes Element im unteren Grid Werte zurück
        this.isInQueue=false;
        this.hasBeenVisited=false;
        this.predecessor="none";
        $(this.childNodes[2]).text("");
      });
    }

    function dijkstra(){
      var i;
      console.log("dijkstra");
      resetValues();                                                                                       //Setze Werte zurück
      var arrQueue = [];                                                                                    //Kandidatenliste
      arrQueue.push($('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content')[0]);                 //Füge Origin Element zu Kandidatenliste hinzu
      $(arrQueue[0].childNodes[2]).text($(arrQueue[0].childNodes[1]).text());                                //Seine Gesamtdistanz entspricht seiner Distanz
      arrQueue[0].predecessor="none";                                                                         //kein Vorgängerknoten
      while(arrQueue.length>0){                                                                               //Solange es Elemente in Kandidatenliste gibt
        arrQueue[0].hasBeenVisited=true;                                                                      //Markiere das erste als besucht und wähle es aus
        var arrNeighbours=[];                                                                                 //Elemente die mit ausgewähltem verbunden sind
        var connections = instance.getConnections({source: arrQueue[0]});                                      //Connections des ausgewählten
        for (i = 0; i < connections.length; i++) {
          arrNeighbours.push(connections[i].endpoints[1].getElement());
        }
        arrNeighbours = arrNeighbours.filter( onlyUnique );                                                   //Nur eindeutige Werte (falls doppelte Verbindungen)
        for (i = 0; i < arrNeighbours.length; i++) {
          var currentDistance;
          if($(arrNeighbours[i].childNodes[2]).text()==""){                                                   //Wenn noch keine Gesamtdistanz setze sie auf unendlich
            currentDistance = Number.POSITIVE_INFINITY;
          }
          else{
            currentDistance=parseInt($(arrNeighbours[i].childNodes[2]).text());                                //jeweilige Gesamtdistanz
          }
          if(arrNeighbours[i].isInQueue==true) {                                                                //Wenn sich untersuchter Nachbarknoten auf Kandidatenliste befindet
            if (parseInt($(arrQueue[0].childNodes[2]).text()) + parseInt($(arrNeighbours[i].childNodes[1]).text()) < currentDistance) {   //Wenn Gesamtdistanz über derzeit untersuchten Knoten kürzer
              $(arrNeighbours[i].childNodes[2]).text(parseInt($(arrQueue[0].childNodes[2]).text()) + parseInt($(arrNeighbours[i].childNodes[1]).text())); //aktualisiere Gesamtdistanz
              arrNeighbours[i].predecessor=arrQueue[0];                                                         //Setzte derzeit untersuchten Knoten als Vorgänger
            }
          }
          else{                                                                                                 //Wenn sich untersuchter Nachbarknoten nicht in Kandidatenliste befindet
            if(arrNeighbours[i].hasBeenVisited!=true){                                                          //Wenn untersuchter Nachbarknoten noch nicht untersucht wurde
              arrQueue.push(arrNeighbours[i]);                                                                  //Füge ihn zu Warteliste hinzu
              arrNeighbours[i].isInQueue=true;
              $(arrNeighbours[i].childNodes[2]).text(parseInt($(arrQueue[0].childNodes[2]).text()) + parseInt($(arrNeighbours[i].childNodes[1]).text())); //aktualisiere Gesamtdistanz
              arrNeighbours[i].predecessor=arrQueue[0];                                                         //Setzte derzeit untersuchten Knoten als Vorgänger
            }
          }
        }
        arrQueue.splice(0,1);                                                                                   //Entferne derzeit untersuchten Knoten aus Warteschlange (erstes Element)
      }
    }

    function resetPaint(){
      var allConnections = instance.getConnections();                                                            //Wähle alle Verbindungen aus
      for(var i = 0; i < allConnections.length; i++) {
        allConnections[i].setPaintStyle({                                                                       //Setzte Farbe zurück
          stroke: "#346789",
          strokeWidth:2
        });
        allConnections[i].setHoverPaintStyle({                                                                       //Setzte Farbe zurück
          stroke: "#123456",
          strokeWidth:3
        });
        $(allConnections[i].canvas).removeClass("bestPath");                                                    //Setzte besten Pfad zurück
      }
    }

    function paintPath(){
      console.log("paintPath");
      resetPaint();
      var lastContent = $('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content')[0];                     //Wähle End Element aus
      while(lastContent.predecessor!="none"){                                                                     //Bis das erste Element ausgewählt wurde
        var preContent = lastContent.predecessor;
        var lastConnections = instance.getConnections({target: lastContent});
        for (var i = 0; i < lastConnections.length; i++) {
          var endpointElement = lastConnections[i].endpoints[0].getElement();
          if (endpointElement==preContent) {                                                                        //Wähle Vorgänger aus
            $(lastConnections[i].canvas).addClass("bestPath");                                                     //Füge CSS Klasse hinzu anhand der später in den Vordergrund gehoben werden kann
            lastConnections[i].setPaintStyle({                                                                      //Passe Farbe an
              stroke: "red",
              strokeWidth:2
            });
            lastConnections[i].setHoverPaintStyle({
              stroke: "red",
              strokeWidth:3
            });
            i = lastConnections.length - 1;
          }
        }
        lastContent=preContent;                                                                                   //Iteriere Richtung Origin Element
      }
    }
  });
})();

function randomLink(){
  var image;
  var myrandom=Math.floor(Math.random()*4);
  var train="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/25_railtransportation.svg/200px-25_railtransportation.svg.png";
  var bus="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Bus-logo.svg/200px-Bus-logo.svg.png";
  var car="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Aiga_carrental_cropped.svg/200px-Aiga_carrental_cropped.svg.png";
  var plane="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Plane_font_awesome.svg/200px-Plane_font_awesome.svg.png";
  if (myrandom==0) {
    image = train;
  }
  else if (myrandom==1) {
    image = bus;
  }
  else if (myrandom==2) {
    image = car;
  }
  else if (myrandom==3) {
    image = plane;
  }
  console.log(myrandom);
  console.log(image);
  return image;
}
