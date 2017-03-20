/**
 * Created by Sven on 02.11.2016.
 */

var instance;                                                                                                           //the jsPlumb instance

(function () {
  jsPlumb.bind("ready", function () {

    var randomWidgets = false;                                                                                          //decides if random widgets should be loaded

    var topGridsWidgets = [                                                                                             //the widgets to be added to the grids in the scroll bar on top
      {duration: 2, price: 135, comfort: 2, img: "/images/plane.png"},
      {duration: 8, price: 20, comfort: 4, img: "/images/bus.png"},
      {duration: 4, price: 80  , comfort: 1, img: "/images/train.png"},
      {duration: 6, price: 50, comfort: 2, img: "/images/plane.png"},
      {duration: 10, price: 15, comfort: 4, img: "/images/bus.png"},
      {duration: 5, price: 60, comfort: 1, img: "/images/train.png"},
      {duration: 7, price: 35, comfort: 3, img: "/images/car.png"}
    ];

    var bottomGridWidgets = [                                                                                           //the widgets to be added to the grid on the bottom
      {x: 1, y: 2, duration: 1, price: 5, comfort: 4, img: "/images/bus.png"},
      {x: 2, y: 1, duration: 8, price: 20, comfort: 4, img: "/images/bus.png"},
      {x: 2, y: 2, duration: 5, price: 35  , comfort: 2, img: "/images/car.png"},
      {x: 2, y: 3, duration: 3, price: 60, comfort: 1, img: "/images/train.png"},
      {x: 3, y: 1, duration: 2, price: 10, comfort: 4, img: "/images/bus.png"},
      {x: 3, y: 2, duration: 1, price: 15, comfort: 3, img: "/images/train.png"},
      {x: 3, y: 3, duration: 1, price: 50, comfort: 1, img: "/images/car.png"}
    ];

    var w_height = $(window).height();                                                                                  //the height of the window

    var allGrids = $('.grid-stack');                                                                                    //all grids
    var topGrids = $('.grid-stack-1:not(#containsButton)');                                                             //the grids in the scroll bar without the grid containing the button
    var bottomGrid = $('.grid-stack-5');                                                                                //the grid on the bottom

    var criteria ='data-duration';
    var criteriaName = "duration";                                                                                      //the criteria used to calculate distances and the shortest path

    //initializes the jsPlumb instance
    instance = window.jsp = jsPlumb.getInstance({
      ConnectionOverlays: [
        [ "Arrow", {
          location: 1,
          visible:true,
          width:8,
          length:8,
          id:"ARROW"
        } ]
      ],
      PaintStyle: {stroke: 'rgba(0,150,130,0.8)', strokeWidth: 1,  joinstyle: "round"},
      HoverPaintStyle: {stroke: 'rgba(0,150,130,1)', strokeWidth:3},
      Container: "bottomGrid",
      Connector: "Straight",
      MaxConnections: -1,
      Endpoint:[ "Dot", { radius:7 } ],
      EndpointStyle: {fill: "transparent", outlineStroke: "transparent", outlineWidth: 1},
      EndpointHoverStyle: {fill: "white", outlineStroke: "rgba(0,150,130,1)", outlineWidth: 1}
    });

    initializeGrids();
    fillGrids();
    addEndpoints();
    connectEndpoints();
    dijkstra();
    setText();
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

    //loads the model if button is pressed
    $('body').on('show.bs.modal', function () {
      $('#largePopup .modal-body').css('overflow-y', 'auto');

      $('#largePopup .modal-body').css('max-height', $(window).height() * 0.7);

      $('.selectpicker').selectpicker('refresh');
    });

    $.fn.editable.defaults.mode = 'inline';

    //the functionality of the modal to add a widget
    $("#submitWidget").on('click', function() {
      var imgLink;                                                                                                      //the image of the new widget
      //checks if an image was selected, else chooses a random image
      if(($('#imagePicker option:selected').text())=="choose please"){
        imgLink=randomLink();
      }
      else{
        imgLink='"/images/'+$('#imagePicker option:selected').text()+'.png"';
      }
      var duration;                                                                                                     //the duration value of the new widget
      var price;                                                                                                        //the price value of the new widget
      var comfort;                                                                                                      //the comfort value of the new widget
      //checks if a valid duration value was enderd, else chooses a random value
      if(isNaN($('#duration')[0].value)||$('#duration')[0].value==""){
        duration=Math.floor(Math.random() * 10);      //between 0 and 9
      }
      else{
        duration=$('#duration')[0].value;
      }
      //checks if a valid price value was enderd, else chooses a random value
      if(isNaN($('#price')[0].value)||$('#price')[0].value==""){
        price=Math.floor(Math.random() * 251);       //between 0 and 250
      }
      else{
        price=$('#price')[0].value;
      }
      //checks if a valid comfort value was enderd, else chooses a random value
      if(isNaN($('#comfort')[0].value)||$('#comfort')[0].value==""){
        comfort=Math.floor(Math.random() * 5)+1;      //between 1 and 5
      }
      else{
        comfort=$('#comfort')[0].value;
      }

      var added=false;                                                                                                  //indicating if the new widget has been added already

      //adds the new widget to the first empty grid in the scroll bar
      topGrids.each(function () {
        //checks if the widget has been added already
        if(!added) {
          var grid = $(this).data('gridstack');
          //adds the widget
          if (grid.willItFit(0, 0, 1, 1, false)) {
            grid.addWidget($('<div>' +
                '<div class="grid-stack-item-content" ' +
                'data-toggle="popover" ' +
                'data-duration="'+duration+'" ' +
                'data-price="'+price+'" ' +
                'data-comfort="'+comfort+'" ' +
                'data-total="9999999999" >' +
                '<img src=' + imgLink + ' />' +
                '<span class="value"></span>' +
                '<span class="startTime"></span></div></div>'),
              0, 0, 1, 1);
            added = true;
            //adds the popover for that widget
            $('[data-toggle="popover"]').each(function(i,v){
              var $el = $(v);
              if(!$el.data("bs.popover")) {
                $el.popover({
                  content: function() {
                    var message = "duration:&nbsp" +
                      "<a href=\"#\" class=\"pop_duration\">" + this.getAttribute('data-duration') + "</a>" +
                      "<br /> price:&nbsp" +
                      "<a href=\"#\" class=\"pop_price\">" + this.getAttribute('data-price') + "</a>" +
                      "<br /> comfort:&nbsp" +
                      "<a href=\"#\" class=\"pop_comfort\">" + this.getAttribute('data-comfort') + "</a>";
                    return message;
                  },
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

    //the functionality of the modal to change the criteria
    $("#submitCriteria").on('click', function() {
      criteria='data-'+$('#criteriaPicker option:selected').text();
      criteriaName=$('#criteriaPicker option:selected').text();
      dijkstra();
      setText();
      paintPath();
    });

    //the functionality of the modal to change the connector style
    $("#submitConnector").on('click', function() {
      //checks if the option "straight" has been selected and sets connectors accordingly
      if ($('#connectorPicker option:selected').text() === 'straight') {
        //updates existing connectors
        instance.select().each(function (connection) {
          connection.setConnector(["Straight"], false)
        });
        //sets default values for new connectors
        instance.importDefaults({
          Connector: "Straight"
        });
      }
      //checks if the option "flowchart" has been selected and sets connectors accordingly
      if ($('#connectorPicker option:selected').text() === 'flowchart') {
        //updates existing connectors
        instance.select().each(function (connection) {
          connection.setConnector(["Flowchart", {stub: 10, cornerRadius: 4, gap: 2, midpoint: 0.5}], false)
        });
        //sets default values for new connectors
        instance.importDefaults({
          Connector: ["Flowchart", {stub: 10, cornerRadius: 4, gap: 2, midpoint: 0.5}]
        });
      }
      //checks if the option "curvy" has been selected and sets connectors accordingly
      if ($('#connectorPicker option:selected').text() === 'curvy') {
        //updates existing connectors
        instance.select().each(function (connection) {
          connection.setConnector(["StateMachine"], false)
        });
        //sets default values for new connectors
        instance.importDefaults({
          Connector: "StateMachine"
        });
      }
    });

    //fills the content of all popovers
    $('[data-toggle="popover"]').each(function(i,v){
      var $el = $(v);
      if(!$el.data("bs.popover")) {
        $el.popover({
          content: function() {
            var message = "Duration:&nbsp" +
              "<a href=\"#\" class=\"pop_duration\">" + this.getAttribute('data-duration') + "</a>" +
              "<br /> Price:&nbsp" +
              "<a href=\"#\" class=\"pop_price\">" + this.getAttribute('data-price') + "</a>" +
              "<br /> Comfort:&nbsp" +
              "<a href=\"#\" class=\"pop_comfort\">" + this.getAttribute('data-comfort') + "</a>";
            return message;
          },
          placement: "auto right",
          trigger: "manual",
          html: true
        });
      }
    });

    //repaints connections again after 10 ms
    window.setTimeout(function(){
        instance.repaintEverything()},
        10
    );

    //repaints connections after an item has been dragged - otherwise there would be no repaint if an item snaps back to its original position
    allGrids.on('dragstop', function (event, ui) {
      instance.repaintEverything();
    });

    //the functionality of popovers
    $(document).on('mousedown', '[data-toggle="popover"]', function(){
      if($(this).data('bs.popover')) {
        var duration = $(this).data('duration');                                                                        //the duration value of the selected item
        var price = $(this).data('price');                                                                              //the price value of the selected item
        var comfort = $(this).data('comfort');                                                                          //the comfort value of the selected item
        //closes popover on each second click
        if ($(this).data('bs.popover').tip().hasClass('in')) {
          $(this).popover('hide');
        }
        //opens popover
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
          //functionality of the editable field for the duration value
          $('.pop_duration').on('save', function(e, params){
            if(!isNaN(params.newValue)) {
              $($($(e.target.parentElement)[0].parentElement)[0])[0].previousSibling.setAttribute("data-duration", params.newValue);
              dijkstra();
              setText();
              paintPath();
            }
          });
          //functionality of the editable field for the price value
          $('.pop_price').on('save', function(e, params){
            if(!isNaN(params.newValue)) {
              $($($(e.target.parentElement)[0].parentElement)[0])[0].previousSibling.setAttribute("data-price", params.newValue);
              dijkstra();
              setText();
              paintPath();
            }
          });
          //functionality of the editable field for the comfort value
          $('.pop_comfort').on('save', function(e, params){
            if(!isNaN(params.newValue)) {
              $($($(e.target.parentElement)[0].parentElement)[0])[0].previousSibling.setAttribute("data-comfort", params.newValue);
              dijkstra();
              setText();
              paintPath();
            }
          });
        }
      }
    });

    var isGrid;                                                                                                         //the grid an item has been dragged from
    var draggedContent;                                                                                                 //the widget that is dragged

    //actions performed if a widget is dragged
    allGrids.on('dragstart', function (event, ui) {
      draggedContent=$(event.target.children[0]);
      //hides the popover
      draggedContent.popover('hide');
      isGrid=$(this).data('gridstack');
    });

    //actions performed if a "change" event is fired
    allGrids.on('change', function (event, items) {
      //checks if the value of a widget has been changed
      if($(event.target)[0].getAttribute("class")=="form-control input-sm"){
        console.log("value changed");
      }
      else{
        //checks if the grid a change event occurs is the same an item has been dragged from
        if (isGrid == $(event.target).data('gridstack')) {
          var contains = false;                                                                                         //indicating if the widget is contained in the grid the change event occurred in
          //checks if any items have been changed
          if (items != undefined) {
            for (var i = 0; i < items.length; i++) {
              if (items[i].el.children(":first")[0] == draggedContent[0]) {
                contains = true;
              }
            }
          }
          //checks if an item has just been dragged around in its original grid
          if (contains) {
            console.log("nothingChanged")
          }
          //else the widget must have been removed
          else {
            instance.detachAllConnections(draggedContent);
            var sourceEndpoint = instance.selectEndpoints({source: $(draggedContent)}).get(0);
            var targetEndpoint = instance.selectEndpoints({target: $(draggedContent)}).get(0);
            instance.deleteEndpoint(sourceEndpoint);
            instance.deleteEndpoint(targetEndpoint);
            console.log('WidgetRemoved');
          }
        }
        //else the widget must have been dragged to another grid
        else {
          console.log("sthChanged");
          //checks if the widget has been added to the bottom grid
          if (isGrid != bottomGrid.data('gridstack') && isGrid != "none" && $(event.target).data('gridstack') == bottomGrid.data('gridstack')) {                                         //Wenn isGrid nicht das untere Grid ist --> zu unterem Grid hinzugefügt
            console.log("addedToBottomGrid");
            //adds new endpoints to the widget which had been added - should be only one widget
            _.each(items, function (node) {
              var selectedItemContent = node.el.children(":first");                                                     //the content of the widget which has been added
              $(selectedItemContent[0].childNodes[1]).text(criteriaName + ": " +selectedItemContent[0].getAttribute(criteria));
              //safety check, should not be needed: only if the widget has no endpoints
              if (instance.selectEndpoints({element: selectedItemContent}).length == 0) {
                //adds new source endpoint
                instance.addEndpoint((selectedItemContent), {
                  anchor: [1, 0.5, 1, 0],
                  isSource: true
                });
                //adds new target endpoint
                instance.addEndpoint((selectedItemContent), {
                  anchor: [0, 0.5, -1, 0],
                  isTarget: true
                });
              }
            });
          }
          //else the widget must have been added to one of the grids in the scroll bars
          else {
            console.log("addedToTopGrid");
            //removes additional data of the widget which has been added to a grid in the scroll bar - should be only one widget
            _.each(items, function (node) {
              var selectedItemContent = node.el.children(":first");                                                     //the content of the widget which has been added
              instance.detachAllConnections(selectedItemContent);                                                       //removes all connections
              instance.deleteEndpoint(instance.selectEndpoints({source: $(selectedItemContent)}).get(0));               //removes the source endpoint
              instance.deleteEndpoint(instance.selectEndpoints({target: $(selectedItemContent)}).get(0));               //removes the target endpoint
              selectedItemContent[0].classList.remove("jtk-endpoint-anchor", "jtk-connected");                          //removes JsPlumb attributes
              selectedItemContent.removeAttr('id');                                                                     //removes JsPlumb ID
              $(selectedItemContent[0].childNodes[2]).text("");                                                         //removes text of the selected value
              $(selectedItemContent[0].childNodes[1]).text("");                                                         //removes text of the total of the selected value
            });
          }
          //adds a new popover for the added widget
          $('[data-toggle="popover"]').each(function (i, v) {
            var $el = $(v);
            if (!$el.data("bs.popover")) {
              $el.popover({
                content: function() {
                  var message = "Duration:&nbsp" +
                    "<a href=\"#\" class=\"pop_duration\">" + this.getAttribute('data-duration') + "</a>" +
                    "<br /> Price:&nbsp" +
                    "<a href=\"#\" class=\"pop_price\">" + this.getAttribute('data-price') + "</a>" +
                    "<br /> Comfort:&nbsp" +
                    "<a href=\"#\" class=\"pop_comfort\">" + this.getAttribute('data-comfort') + "</a>";
                  return message;
                },
                placement: "auto right",
                trigger: "manual",
                html: true
              });
            }
          });
        }
      }
    });

    //actions performed if a connection has been created
    instance.bind("connection", function(info) {
      var con=info.connection;                                                                                          //the created connections
      var arr=instance.select({source:con.sourceId,target:con.targetId});                                               //ids of the source and the target of the created connection
      //prohibits twice the same connection - problem: hover not working immediately again
      if(arr.length>1){
        instance.detach(con);
      }
      dijkstra();
      setText();
      paintPath();
    });

    //actions performed if a connection has been removed
    instance.bind("connectionDetached", function(info) {
      dijkstra();
      setText();
      paintPath();
    });

    //shows the names of the events occuring
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

    //initializes all grids
    function initializeGrids() {
      var options = {                                                                                                   //parameters valid for the grids in the scroll bar and the bottom grid
        animate: true,
        disableResize: true,
        removable: '.btn',
        removeTimeout: 100,
        verticalMargin: 0,
        acceptWidgets: '.grid-stack-item',
        minWidth:0
      };
      //initializes the grids in the scroll bar
      topGrids.gridstack(_.defaults({
        height: 1,
        width: 1,
        float: false,
        cellHeight: w_height / 6 / 2
      }, options));
      //initializes the bottom grid
      bottomGrid.gridstack(_.defaults({
        height: 5,
        width: 5,
        float: true,
        cellHeight: w_height / 6
      }, options));
    }

    //fills all grids with widgets
    function fillGrids() {
      fillTopGrids();
      fillBottomGrid();
    }

    //fills the grids in the scroll bar with widgets
    function fillTopGrids() {
      //checks if widgets should be read from file
      if(!randomWidgets) {
        //adds each widget specified in the file to the next grid in the scroll bar
        _.each(topGridsWidgets, function (node) {
          var grid = $(topGrids[topGridsWidgets.indexOf(node)]).data('gridstack');                                      //the grid the widget is added to
          grid.addWidget($('<div>' +
              '<div class="grid-stack-item-content" ' +
              'data-toggle="popover" ' +
              'data-duration="' + node.duration + '" ' +
              'data-price="' + node.price + '" ' +
              'data-comfort="' + node.comfort + '" ' +
              'data-total="9999999999" >' +
              '<img src=' + node.img + ' />' +
              '<span class="value"></span>' +
              '<span class="startTime"></span></div></div>'),
            0, 0, 1, 1);
        });
      }
      //else: create random widgets
      else{
        var counter = 0;                                                                                                //amount of widgets created already
        //iterates through all grids in the scroll bar
        topGrids.each(function () {
          var grid = $(this).data('gridstack');                                                                         //the selected grid in the scroll bar

          //adds widgets to the first seven grids
          if(counter<7){
            var duration= Math.floor(Math.random() * 10);       //between 0 and 9                                       //the duration value of the new widget
            var price= + Math.floor(Math.random() * 251);       //between 0 and 250                                     //the price value of the new widget
            var comfort= Math.floor(Math.random() * 5) + 1;     //between 1 and 5                                       //the comfort value of the new widget
            grid.addWidget($('<div>'+
                '<div class="grid-stack-item-content" ' +
                'data-toggle="popover" ' +
                'data-duration="' + duration + '" ' +
                'data-price="' + price + '" ' +
                'data-comfort="' + comfort +'" ' +
                'data-total="9999999999" >' +
                '<img src=' + randomLink() + ' />' +
                '<span class="value"></span>' +
                '<span class="startTime"></span></div></div>'),
              0, 0, 1, 1);
          }
          counter++;
        });
      }
    }

    //fills the bottom grid with widgets
    function fillBottomGrid() {

      var itemBottomBlock = [                                                                                           //empty elements in the first and last column
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 3},
        {x: 0, y: 4},
        {x: 4, y: 0},
        {x: 4, y: 1},
        {x: 4, y: 3},
        {x: 4, y: 4}
      ];

      var grid = $(bottomGrid).data('gridstack');                                                                       //the bottom grid
        //adds the origin widget
        grid.addWidget($('<div class="origin" data-gs-no-move="yes" data-gs-locked="yes">' +    //not moveable
            '<div class="grid-stack-item-content" ' +
            'data-toggle="popover" ' +
            'data-duration=' + 0 + ' ' +
            'data-price=' + 0 + ' ' +
            'data-comfort=' + 1 +' ' +
            'data-total="9999999999" >' +
            '<img src="/images/home.png"/>' +
            '<span class="value"></span>' +
            '<span class="startTime"></span></div></div>'),
          0, 2, 1, 1);
        //adds the end widget
        grid.addWidget($('<div class="end" data-gs-no-move="yes" data-gs-locked="yes">' +       //not moveable
            '<div class="grid-stack-item-content" ' +
            'data-toggle="popover" ' +
            'data-duration=' + 0 + ' ' +
            'data-price=' + 0 + ' ' +
            'data-comfort=' + 1 +' ' +
            'data-total="9999999999" >' +
            '<img src="/images/home.png"/>' +
            '<span class="value"></span>' +
            '<span class="startTime"></span></div></div>'),
          4, 2, 1, 1);
      //adds the empty elements in the first and last column
      _.each(itemBottomBlock, function (node) {
        grid.addWidget($('<div class="block"  data-gs-no-move="yes" data-gs-locked="yes">' +    //not moveable
            '<div class="grid-stack-item-content"/></div>'),
          node.x, node.y, 1, 1);
      }, this);
      //checks if widgets should be read from file
      if(!randomWidgets) {
        //adds each widget specified in the file to the bottom grid
        _.each(bottomGridWidgets, function (node) {
          grid.addWidget($('<div>' +
              '<div class="grid-stack-item-content" ' +
              'data-toggle="popover" ' +
              'data-duration=' + node.duration + ' ' +
              'data-price="' + node.price + '" ' +
              'data-comfort="' + node.comfort + '" ' +
              'data-total="9999999999" >' +
              '<img src=' + node.img + ' />' +
              '<span class="value"></span>' +
              '<span class="startTime"></span></div></div>'),
            node.x, node.y, 1, 1);
        });
      }
      //else: create random widgets
      else {
        //adds an maximum of seven random widgets
        for (var i = 0; i < 7; i++) {
          var x = Math.floor(Math.random() * 3) + 1;            //between 1 and 3                                       //x coordinate of the new widget
          var y = Math.floor(Math.random() * 5);                //between 0 and 4                                       //y coordinate of the new widget
          //checks if item can be added at this position
          if (grid.willItFit(x, y, 1, 1, false)) {
            var duration = Math.floor(Math.random() * 10);      //between 0 and 9                                       //the duration value of the new grid
            var price= + Math.floor(Math.random() * 251);       //between 0 and 250                                     //the price value of the new grid
            var comfort= Math.floor(Math.random() * 5) + 1;     //between 1 and 5                                       //the comfort value of the new grid
            grid.addWidget($('<div>' +
                '<div class="grid-stack-item-content" ' +
                'data-toggle="popover" ' +
                'data-duration=' + duration + ' ' +
                'data-price="' + price + '" ' +
                'data-comfort="' + comfort + '" ' +
                'data-total="9999999999" >' +
                '<img src=' + randomLink() + ' />' +
                '<span class="value"></span>' +
                '<span class="startTime"></span></div></div>'),
              x, y, 1, 1);
          }
        }
      }
    }

    //adds endpoints to widgets
    function addEndpoints() {
      //adds source endpoint to the origin widget
      instance.addEndpoint($('.grid-stack-5 .origin .grid-stack-item-content'), {
        anchor: "Right",
        isSource: true
      });
      //adds target endpoint for the end widget
      instance.addEndpoint($('.grid-stack-5 .end .grid-stack-item-content'), {
        anchor: "Left",
        isTarget: true
      });
      //adds source endpoint for all normal widgets
      instance.addEndpoint($('.grid-stack-5 .grid-stack-item:not(.origin, .end, .block) .grid-stack-item-content'), {
        anchor: "Right",
        isSource: true
      });
      //adds target endpoint for all normal widgets
      instance.addEndpoint($('.grid-stack-5 .grid-stack-item:not(.origin, .end, .block) .grid-stack-item-content'), {
        anchor: "Left",
        isTarget: true
      });
    }

    //connects endpoints
    function connectEndpoints() {
      var sourceEndpoint = instance.selectEndpoints({source: $('.grid-stack-5 .origin .grid-stack-item-content')}).get(0);  //source endpoint of the origin widget
      var $items = $('.grid-stack-5 .grid-stack-item:not(.origin, .end, .block)');                                          //all normal widgets

      var firstItems = jQuery.grep($items, checkFirst);                                                                     //all widgets with x=1
      var secondItems = jQuery.grep($items, checkSecond);                                                                   //all widgets with x=2
      var thirdItems = jQuery.grep($items, checkThird);                                                                     //all widgets with x=3

      //removes a few connections if the display of random widgets is selected
      if(randomWidgets) {
        removeOneIfGreater2(firstItems);
        removeOneIfGreater2(secondItems);
        removeOneIfGreater2(thirdItems);
      }

      connectOrigin(sourceEndpoint,firstItems,secondItems,thirdItems);
      connectFirstItems(firstItems,secondItems,thirdItems);
      connectSecondItems(secondItems,thirdItems);
      connectThirdItems(thirdItems);

    }

    //checks if a widget has x=1
    function checkFirst(item) {
      var node = $(item).data('_gridstack_node');
      return node.x == 1;
    }

    //checks if a widget has x=2
    function checkSecond(item) {
      var node = $(item).data('_gridstack_node');
      return node.x == 2;
    }

    //checks if a widget has x=3
    function checkThird(item) {
      var node = $(item).data('_gridstack_node');
      return node.x == 3;
    }

    //do not draw a random connection if there are more than two elements on the next level
    function removeOneIfGreater2(items){
      if (items.length > 2) {
        items.splice((Math.random() * items.length), 1);
      }
    }

    //connects the origin widget
    function connectOrigin(sourceEndpoint,firstItems,secondItems,thirdItems) {
      //checks if there are widgets with x=1
      if (firstItems.length > 0) {
        connectEndpointsMiddle(sourceEndpoint, firstItems);
      }
      else {
        //checks if there are widgets with x=2
        if (secondItems.length > 0) {
          connectEndpointsMiddle(sourceEndpoint, secondItems);
        }
        else {
          //checks if there are widgets with x=3
          if (thirdItems.length > 0) {
            connectEndpointsMiddle(sourceEndpoint, thirdItems);
          }
          //else connect directly to end widget
          else {
            connectEndpointsEnd(sourceEndpoint);
          }
        }
      }
    }

    //connects widgets with x=1
    function connectFirstItems(firstItems,secondItems,thirdItems) {
      //draw connections for each widget
      $(firstItems).each(function () {
        var sourceEndpoint = instance.selectEndpoints({source: this.firstChild}).get(0);                                //the selected source endpoint
        //checks if there are widgets with x=2
        if (secondItems.length > 0) {
          connectEndpointsMiddle(sourceEndpoint, secondItems);
        }
        else {
          //checks if there are widgets with x=3
          if (thirdItems.length > 0) {
            connectEndpointsMiddle(sourceEndpoint, thirdItems);
          }
          else {
            //else connect directly to end widget
            connectEndpointsEnd(sourceEndpoint);
          }
        }
      });
    }

    //connects widgets with x=2
    function connectSecondItems(secondItems,thirdItems) {
      //draw connections for each widget
      $(secondItems).each(function () {
        var sourceEndpoint = instance.selectEndpoints({source: this.firstChild}).get(0);                                //the selected source endpoint
        //checks if there are widgets with x=3
        if (thirdItems.length > 0) {
          connectEndpointsMiddle(sourceEndpoint, thirdItems);
        }
        else {
          //else connect directly to end widget
          connectEndpointsEnd(sourceEndpoint);
        }
      });
    }

    //connects widgets with x=3
    function connectThirdItems(thirdItems) {
      //draw connections for each widget
      $(thirdItems).each(function () {
        var sourceEndpoint = instance.selectEndpoints({source: this.firstChild}).get(0);                                //the selected source endpoint
        connectEndpointsEnd(sourceEndpoint);
      });
    }

    //connects a widget with the widgets on the target level
    function connectEndpointsMiddle(sourceEndpoint, targetLevel) {
      //draw connection for each widget on the target level
      $(targetLevel).each(function () {
        instance.connect({
          source: sourceEndpoint,
          target: instance.selectEndpoints({target: this.firstChild}).get(0)
        });
      });
    }

    //connects a widget with the end widget
    function connectEndpointsEnd(sourceEndpoint) {
      instance.connect({
        source: sourceEndpoint,
        target: instance.selectEndpoints({target: $('.grid-stack-5 .end .grid-stack-item-content')}).get(0)
      });
    }

    //filters for unique values
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    //resets the values of all widgets in the bottom grid
    function resetValues(){
      //for each widget in the bottom grid
      $('.grid-stack-5 .grid-stack-item .grid-stack-item-content').each(function () {
        this.predecessor="none";                                                                                        //resets predecessor in the best path
        this.hasBeenVisited=false;                                                                                      //resets indicator if widget has been considered for the best path
        this.isInQueue=false;                                                                                           //resets indicator if widget was in the queue for calculation of the best path
        this.setAttribute('data-total',9999999999);                                                                     //resets the total value to the max value
      });
    }

    //sets the text of a widget according to its data
    function setText(){
      //for each widget in the bottom grid
      $('.grid-stack-5 .grid-stack-item .grid-stack-item-content').each(function () {
        //sets the text for the selected value
        $(this.childNodes[1]).text(criteriaName + ": " + this.getAttribute(criteria));
        //if widget is contained in the path
        if(parseInt(this.getAttribute('data-total'))!=9999999999) {
          //sets the text for the total value
          $(this.childNodes[2]).text("total: " + this.getAttribute('data-total'));
        }
        else{
          $(this.childNodes[2]).text("");
        }
      });
    }

    //algorithm to calculate the fastest path
    function dijkstra(){
      console.log("dijkstra");
      resetValues();
      var arrQueue = [];                                                                                                //list with widgets to be examined
      arrQueue.push($('.grid-stack-5 .origin .grid-stack-item-content')[0]);                                            //adds origin widget to list
      $(arrQueue[0])[0].setAttribute('data-total',$(arrQueue[0])[0].getAttribute(criteria));                            //its total value equals its value
      arrQueue[0].isInQueue=true;
      //iterate as long as there are elements in the list
       while(arrQueue.length>0){
         var select=0;
         //if there are more than one widgets in the list select the one with the lowest total value
         if(arrQueue.length>1){
          for(var i=0;i<arrQueue.length;i++){
            if(parseInt($(arrQueue[i])[0].getAttribute('data-total'))<parseInt($(arrQueue[select])[0].getAttribute('data-total'))){
              select=i;
            }
          }
        }
        arrQueue[select].hasBeenVisited=true;
        var arrNeighbours=[];                                                                                           //neighbours of the selected widget
        var connections = instance.getConnections({source: arrQueue[select]});                                          //connections of the selected widget
        for (i = 0; i < connections.length; i++) {
          arrNeighbours.push(connections[i].endpoints[1].getElement());
        }
        arrNeighbours = arrNeighbours.filter( onlyUnique );
         //iterate through all neighbours of the selected widget
        for (i = 0; i < arrNeighbours.length; i++) {
          //checks if the neighbour has not already be considered for the shortest path
          if(arrNeighbours[i].hasBeenVisited==false) {
            var currentDistance;                                                                                        //total value of the selected neighbour
            currentDistance = parseInt($(arrNeighbours[i])[0].getAttribute('data-total'));
            //checks if the neighbour is not yet in the list
            if (currentDistance == 9999999999) {                                                                        //add it to the list
              arrQueue.push(arrNeighbours[i]);
              arrNeighbours[i].isInQueue = true;
              $(arrNeighbours[i])[0].setAttribute('data-total', (parseInt($(arrQueue[select])[0].getAttribute('data-total')) + parseInt($(arrNeighbours[i])[0].getAttribute(criteria)))); //update its total distance
              arrNeighbours[i].predecessor = arrQueue[select];
            }
            //else it is in the list already
            else {
              //savety check, should be always true
              if (arrNeighbours[i].isInQueue == true) {
                //checks if total value is shorter with path of selected widget
                if (parseInt(($(arrQueue[select])[0].getAttribute('data-total')) + parseInt($(arrNeighbours[i])[0].getAttribute(criteria))) < currentDistance) {
                  $(arrNeighbours[i])[0].setAttribute('data-total', (parseInt($(arrQueue[select])[0].getAttribute('data-total')) + parseInt($(arrNeighbours[i])[0].getAttribute(criteria)))); //update its total distance
                  arrNeighbours[i].predecessor = arrQueue[select];
                }
              }
            }
          }
        }
        arrQueue[select].isInQueue=false;
        arrQueue.splice(select,1);                                                                                      //remove selected widget from list
      }
    }

    //resets the paint of all connections
    function resetPaint(){
      var allConnections = instance.getConnections();                                                                   //all connections
      for(var i = 0; i < allConnections.length; i++) {
        allConnections[i].setPaintStyle({                                                                               //resets paint
          stroke: 'rgba(0,150,130,0.8)',
          strokeWidth:2
        });
        allConnections[i].setHoverPaintStyle({                                                                          //resets hover paint
          stroke: 'rgba(0,150,130,1)',
          strokeWidth:3
        });
        $(allConnections[i].canvas).removeClass("bestPath");                                                            //resets css class of the best path
      }
    }

    //paints the best path
    function paintPath(){
      console.log("paintPath");
      resetPaint();
      var lastContent = $('.grid-stack-5 .end .grid-stack-item-content')[0];                                            //the content of the end element
      //iterate through widgets until end of the best path is reached
      while(lastContent.predecessor!="none"){
        var preContent = lastContent.predecessor;
        var lastConnections = instance.getConnections({target: lastContent});
        //iterates through lal predecessors of the selected widget
        for (var i = 0; i < lastConnections.length; i++) {
          var endpointElement = lastConnections[i].endpoints[0].getElement();
          //chooses predecessor in the best path
          if (endpointElement==preContent) {
            $(lastConnections[i].canvas).addClass("bestPath");                                                          //adds CSS class to move path into foreground
            lastConnections[i].setPaintStyle({                                                                          //updates paint
              stroke: 'rgba(223,155,27,0.8)',
              strokeWidth:2
            });
            lastConnections[i].setHoverPaintStyle({                                                                     //updates hover paint
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

//generates a random link
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
