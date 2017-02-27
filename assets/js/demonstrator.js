/**
 * Created by Sven on 02.11.2016.
 */
var instance;
// not extendable? http://stackoverflow.com/questions/18142792/how-to-extend-an-object-inside-an-anonymous-function

(function () {
  jsPlumb.bind("ready", function () {

    var w_height = $(window).height();                          //height of the window

    var allGrids = $('.grid-stack');                            //all grids
    var topGrids = $('.grid-stack-1:not(#containsButton)');     //each top grid
    var bottomGrid = $('.grid-stack-5');                        //bottom grid

    var criteria ='data-duration';                              //the criteria used to calculate distances and path

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
      PaintStyle: {stroke: 'rgba(0,150,130,0.8)', strokeWidth: 1,  joinstyle: "round"},
      HoverPaintStyle: {stroke: 'rgba(0,150,130,1)', strokeWidth:3},
      Connector: ["Flowchart", {stub: 10, cornerRadius: 4, gap: 2}],
      Container: "bottomGrid",
      MaxConnections: -1,
      Endpoint:[ "Dot", { radius:7 } ],
      EndpointStyle: {fill: "transparent", outlineStroke: "transparent", outlineWidth: 1},
      EndpointHoverStyle: {fill: "white", outlineStroke: "rgba(0,150,130,1)", outlineWidth: 1}
    });

    initializeGrids();
    fillGrids();
    addEndpoints();
    connectEndpoints();
    setText();
    dijkstra();
    paintPath();

    //repaints endpoints and connections if window size changes
    window.addEventListener("resize", function () {
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

    $('body').on('show.bs.modal', function () {
      $('#largePopup .modal-body').css('overflow-y', 'auto');

      $('#largePopup .modal-body').css('max-height', $(window).height() * 0.7);

      $('.selectpicker').selectpicker('refresh');
    });

    $('.selectpicker').selectpicker();

    $.fn.editable.defaults.mode = 'inline';

    $("#submitForm").on('click', function() {
      var imgLink;
      if(($('#imagePicker option:selected').text())=="choose please"){
        console.log(true);
        imgLink=randomLink();
      }
      else{
        imgLink='"/images/'+$('#imagePicker option:selected').text()+'.png"';
      }
      var duration;
      var price;
      var comfort;
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
                'data-toggle="popover" ' +
                'data-duration="'+duration+'" ' +
                'data-price="'+price+'" ' +
                'data-comfort="'+comfort+'">' +
                '<img src=' + imgLink + ' />' +
                '<span class="value"></span>' +
                '<span class="startTime"></span></div></div>'),
              0, 0, 1, 1);
            added = true;
            $('[data-toggle="popover"]').each(function(i,v){
              var $el = $(v);
              if(!$el.data("bs.popover")) {
                $el.popover({
                  content: "Duration:&nbsp" +
                  "<a href=\"#\" class=\"pop_duration\">"+$(this).data('duration')+"</a>" +
                  "<br /> Price:&nbsp" +
                  "<a href=\"#\" class=\"pop_price\">"+$(this).data('price')+"</a>" +
                  "<br /> Comfort:&nbsp" +
                  "<a href=\"#\" class=\"pop_comfort\">"+$(this).data('comfort')+"</a>",
                  placement: "auto right",
                  trigger: "manual",
                  html: true
                });
              }
            });
          }
        }
      });
    });

    $("#submitForm2").on('click', function() {
      criteria='data-'+$('#criteriaPicker option:selected').text();
      setText();
      dijkstra();
      paintPath();
    });

    $('[data-toggle="popover"]').each(function(i,v){
      var $el = $(v);
      $el.popover({
        content: "Duration:&nbsp" +
        "<a href=\"#\" class=\"pop_duration\">"+$(this).data('duration')+"</a>" +
        "<br /> Price:&nbsp" +
        "<a href=\"#\" class=\"pop_price\">"+$(this).data('price')+"</a>" +
        "<br /> Comfort:&nbsp" +
        "<a href=\"#\" class=\"pop_comfort\">"+$(this).data('comfort')+"</a>",
        placement: "auto right",
        trigger: "manual",
        html: true
      });
    });

    window.setTimeout(function(){                                                           //Zeichne alles nach 10 Millisekunden nochmal
        instance.repaintEverything()},
        10
    );

    allGrids.on('dragstop', function (event, ui) {
      instance.repaintEverything();                                                          //nötig, sonst kein repaint wenn zweimal auf gleiches Feld zurückgedragt
    });

    $(document).on('mousedown', '[data-toggle="popover"]', function(){
      if($(this).data('bs.popover')) {
        if ($(this).data('bs.popover').tip().hasClass('in')) {
          $(this).popover('hide');
        }
        else {
          $(this).popover('show');
          $('.pop_duration').editable({
              tpl: "<input type='text' style='width: 100px'>",
            });
          $('.pop_price').editable({
            tpl: "<input type='text' style='width: 100px'>"
          });
          $('.pop_comfort').editable({
            tpl: "<input type='text' style='width: 100px'>"
          });
          var changedEntry = false;
          $('.pop_duration').on('save', function(e, params){
            if(!isNaN(params.newValue)) {
              $($($(e.target.parentElement)[0].parentElement)[0])[0].previousSibling.setAttribute("data-duration", params.newValue);
              setText();
              dijkstra();
              paintPath();
            }
          });
          $('.pop_price').on('save', function(e, params){
            if(!isNaN(params.newValue)) {
              $($($(e.target.parentElement)[0].parentElement)[0])[0].previousSibling.setAttribute("data-price", params.newValue);
              setText();
              dijkstra();
              paintPath();
            }
          });
          $('.pop_comfort').on('save', function(e, params){
            if(!isNaN(params.newValue)) {
              $($($(e.target.parentElement)[0].parentElement)[0])[0].previousSibling.setAttribute("data-comfort", params.newValue);
              setText();
              dijkstra();
              paintPath();
            }
          });
        }
      }
    });

    var isGrid;                                                                             //Welches Grid einem Event zu Grunde liegt
    var draggedContent;

    allGrids.on('dragstart', function (event, ui) {
      draggedContent=$(event.target.children[0]);
      draggedContent.popover('hide');
      isGrid=$(this).data('gridstack');                                                     //Speichere Grid, in dem dragstart Event ausgelöst wurde in isGrid ab
    });

    allGrids.on('change', function (event, items) {
      if (isGrid == $(event.target).data('gridstack')) {                                     //Überprüfe ob das Grid auf dem Change Event endet das selbe ist wie isGrid
        var contains=false;
        if(items!=undefined){
          for(var i =0;i<items.length;i++) {
            if (items[i].el.children(":first")[0] == draggedContent[0]) {
              contains = true;
            }
          }
        }
        if(contains) {
          console.log("nothingChanged")
        }
        else{
          instance.detachAllConnections(draggedContent);
          var sourceEndpoint = instance.selectEndpoints({source: $(draggedContent)}).get(0);
          var targetEndpoint = instance.selectEndpoints({target: $(draggedContent)}).get(0);
          instance.deleteEndpoint(sourceEndpoint);
          instance.deleteEndpoint(targetEndpoint);
          console.log('WidgetRemoved');
        }
      }
      else {                                                                                 //Wenn es von isGrid abweicht
        console.log("sthChanged");
        if (isGrid != bottomGrid.data('gridstack') && isGrid != "none" && $(event.target).data('gridstack')== bottomGrid.data('gridstack')) {                                         //Wenn isGrid nicht das untere Grid ist --> zu unterem Grid hinzugefügt
          console.log("addedToBottomGrid");
          _.each(items, function (node) {                                                     //Für jedes hinzugefügte Widget (nur eines im Normalfall)
            var selectedItemContent = node.el.children(":first");                             //Wählt itemContent aus
            $(selectedItemContent[0].childNodes[1]).text(selectedItemContent[0].getAttribute(criteria));
            if (instance.selectEndpoints({element: selectedItemContent}).length == 0) {       //geht in Schlaufe falls keine Endpoints existieren (eigentlich immer, Sicherheitscheck)
              instance.addEndpoint((selectedItemContent), {                                    //Fügt neuen Source Endpoint hinzu
                anchor: [1, 0.5, 1, 0],
                isSource: true
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
            $(selectedItemContent[0].childNodes[1]).text("");                                     //Entfernt Distanz
          });
        }
        $('[data-toggle="popover"]').each(function(i,v){
          var $el = $(v);
          if(!$el.data("bs.popover")) {
            $el.popover({
              content: "Duration:&nbsp" +
              "<a href=\"#\" class=\"pop_duration\">"+$(this).data('duration')+"</a>" +
              "<br /> Price:&nbsp" +
              "<a href=\"#\" class=\"pop_price\">"+$(this).data('price')+"</a>" +
              "<br /> Comfort:&nbsp" +
              "<a href=\"#\" class=\"pop_comfort\">"+$(this).data('comfort')+"</a>",
              placement: "auto right",
              trigger: "manual",
              html: true
            });
          }
        });
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
        removable: '.btn',
        removeTimeout: 100,
        verticalMargin: 0,                                                                                //kein Abstand nach oben
        acceptWidgets: '.grid-stack-item',
        minWidth:0
      };
      topGrids.gridstack(_.defaults({                                                                    //Oberes Grid
        height: 1,
        width: 1,
        float: false,
        cellHeight: w_height / 6 / 2

      }, options));
      bottomGrid.gridstack(_.defaults({                                                                  //unteres Grid
        height: 5,
        width: 5,
        float: true,
        cellHeight: w_height / 6
      }, options));
    }

    function fillGrids() {
      fillTopGrids();
      fillBottomGrid();
    }


    function fillTopGrids() {
      var counter = 0;
      topGrids.each(function () {                                                                         //Für jedes Grid in Scrollbar
        var grid = $(this).data('gridstack');
        if(counter<7){                                                                                   //Füge für die ersten 7 Grids ein Widget hinzu
          var duration= Math.floor(Math.random() * 10);
          var price= + Math.floor(Math.random() * 1000);
          var comfort= Math.floor(Math.random() * 3) + 1;
          grid.addWidget($('<div>'+
              '<div class="grid-stack-item-content" ' +
              'data-toggle="popover" ' +
              'data-duration="' + duration + '" ' +
              'data-price="' + price + '" ' +
              'data-comfort="' + comfort +'">' +
              '<img src=' + randomLink() + ' />' +
              '<span class="value"></span>' +
              '<span class="startTime"></span></div></div>'),
            0, 0, 1, 1);
        }
        counter++;
      });
    }

    function fillBottomGrid() {

      var itemBottomBlock = [                                                                                  //leere Elemente in erster und letzter Spalte
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 3},
        {x: 0, y: 4},
        {x: 4, y: 0},
        {x: 4, y: 1},
        {x: 4, y: 3},
        {x: 4, y: 4}
      ];

      var grid = $(bottomGrid).data('gridstack');
        grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="origin">' +                       //Nicht beweglich
            '<div class="grid-stack-item-content" ' +
            'data-toggle="popover" ' +
            'data-duration=' + 0 + ' ' +
            'data-price=' + 0 + ' ' +
            'data-comfort=' + 1 +'>' +
            '<img src="/images/home.png"/>' +
            '<span class="value">' + 0 + '</span>' +
            '<span class="startTime">' + 0 + '</span></div></div>'),
          0, 2, 1, 1);
        grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="end">' +                          //Nicht beweglich
            '<div class="grid-stack-item-content" ' +
            'data-toggle="popover" ' +
            'data-duration=' + 0 + ' ' +
            'data-price=' + 0 + ' ' +
            'data-comfort=' + 1 +'>' +
            '<img src="/images/home.png"/>' +
            '<span class="value">' + 0 + '</span>' +
            '<span class="startTime"></span></div></div>'),
          4, 2, 1, 1);
      _.each(itemBottomBlock, function (node) {                                                                  //Fügt Block Elemente hinzu
        grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="block">' +                          //Nicht beweglich
            '<div class="grid-stack-item-content"/></div>'),
          node.x, node.y, 1, 1);
      }, this);

      for (var i = 0; i < 7; i++) {                                                                               //Fügt bis zu 7 zufällige Widgets hinzu
        var x = Math.floor(Math.random() * 3)+1;                                                                  //Wert aus [1,3]
        var y = Math.floor(Math.random() * 5);                                                                    //Wert aus [0,4]
        if (grid.willItFit(x, y, 1, 1, false)) {                                                                  //Nur wenn es an dieser x,y Position hinzugefügt werden kann
          var duration= Math.floor(Math.random() * 10);
          var price= + Math.floor(Math.random() * 1000);
          var comfort= Math.floor(Math.random() * 3) + 1;
          grid.addWidget($('<div>' +
              '<div class="grid-stack-item-content" ' +
              'data-toggle="popover" ' +
              'data-duration=' + duration + ' ' +
              'data-price=' + price + ' ' +
              'data-comfort=' + comfort +'>' +
              '<img src=' + randomLink() + ' />' +
              '<span class="value"></span>' +                               //Wert aus [0,9]
              '<span class="startTime"></span></div></div>'),
            x, y, 1, 1);
        }
      }
    }

    function addEndpoints() {
      instance.addEndpoint($('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content'), {                     //Source Endpoint Für Origin Element
        anchor: "Right",
        isSource: true
      });
      instance.addEndpoint($('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content'), {                         //Target Endpoint Für End Element
        anchor: "Left",
        isTarget: true
      });
      instance.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'), {    //Source Endpoint Für alle normalen Widgets
        anchor: "Right",
        isSource: true
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

    function setText(){
      $('.grid-stack-5 .grid-stack-item .grid-stack-item-content').each(function () {                    //Setzte für jedes Element im unteren Grid Werte zurück
        $(this.childNodes[1]).text(this.getAttribute(criteria));
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
          stroke: 'rgba(0,150,130,0.8)',
          strokeWidth:2
        });
        allConnections[i].setHoverPaintStyle({                                                                       //Setzte Farbe zurück
          stroke: 'rgba(0,150,130,1)',
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
              stroke: 'rgba(223,155,27,0.8)',
              strokeWidth:2
            });
            lastConnections[i].setHoverPaintStyle({
              stroke: 'rgba(223,155,27,1)',
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
  var train="/images/train.png";
  var bus="/images/bus.png";
  var car="/images/car.png";
  var plane="/images/plane.png";
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
  return image;
}
