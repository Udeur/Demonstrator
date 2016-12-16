/**
 * Created by Sven on 02.11.2016.
 */
//Items dont trigger add/remove events
var w_height;
$(document).ready(function() {
   window.addEventListener("resize", function (event) {          //Zeichnet die Endpoints neu wenn sich Fenstergröße verändert
    /* w_height=$(window).height();
     $('.grid-stack-1').each(function () {
       var grid = $(this).data('gridstack');
       grid.cellHeight(w_height / 6 / 2);
     });
     $('.grid-stack-1').each(function () {
       var grid = $(this).data('gridstack');
       grid.cellHeight(w_height/6);
       grid.update();
     });*/
     jsPlumb.repaintEverything();                               //TODO: JETZT FUNKTIONIERT drag Handle nicht mehr
   }, false);
  w_height=$(window).height();
   $('.grid-stack-1').gridstack({  //Hier führt Aufruf mit options zu Fehler?! Gleiche Zellhöhe wie letzter Grid
     animate: false,
     height: 1,
     width: 1,        //wie viele passen nebeneinander
     float: false,
     disableResize: true,
     cellHeight: w_height/6/2,
   //  cellWidth: 100,
     removable: false,
     removeTimeout: 100,
     minWidth:0,
     verticalMargin: 0, //kein Abstand nach oben
   });
   $('.grid-stack-5').gridstack({
     animate: false,
     height: 5,
     width: 5,
     float: true,
     disableResize: true,
     cellHeight: w_height/6,
  //   cellWidth: 200,
     acceptWidgets: '.grid-stack-item',
     removable: false,
     removeTimeout: 100,
     minWidth:0,
     verticalMargin: 0, //kein Abstand nach oben
   });
//  $('#bottom2.grid-stack').gridstack(_.defaults({height: 5}, options)); //Verwende options aber ändere Parameter für heights

   var items = [
     {x: 0, y: 0, width: 1, height: 1},
   ];
   $('.grid-stack-1').each(function () {                                                   //Scrollbar wird initialisiert
     var grid = $(this).data('gridstack');
     _.each(items, function (node) {
       grid.addWidget($('<div><div class="grid-stack-item-content"><div/><div/>'),
         node.x, node.y, node.width, node.height);
     }, this);
   });


   var itemOrigin = [
     {x: 0, y: 2, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 0},
   ];
   var itemEnd = [
     {x: 4, y: 2, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 10},
   ];
   var itemBlock = [
     {x: 0, y: 0, width: 1, height: 1 },
     {x: 0, y: 1, width: 1, height: 1},
     {x: 0, y: 3, width: 1, height: 1},
     {x: 0, y: 4, width: 1, height: 1},
     {x: 4, y: 0, width: 1, height: 1},
     {x: 4, y: 1, width: 1, height: 1},
     {x: 4, y: 3, width: 1, height: 1},
     {x: 4, y: 4, width: 1, height: 1},
   ];
   var itemsVar = [
     {x: 1, y: 2, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 1},
     {x: 3, y: 0, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 4},
     {x: 2, y: 1, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 2},
     {x: 3, y: 1, width: 1, height: 1, image: "https://appharbor.com/assets/images/stackoverflow-logo.png", value: 7},
   ];
   $('.grid-stack-5').each(function () {                                              //unterer Gridstack wird initialisiert
     var grid = $(this).data('gridstack');
     _.each(itemOrigin, function (node) {
       grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="origin"><div class="grid-stack-item-content">' +
           '<img src=' + node.image + '  style="margin:auto; display:block" /><div/>' +
           '<span class="value"> value: ' + node.value +'<span/>'),
         node.x, node.y, node.width, node.height);
     }, this);
     _.each(itemEnd, function (node) {
       grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="end"><div class="grid-stack-item-content">' +
         '<img src=' + node.image + '  style="margin:auto; display:block" /><div/>' +
       '<span class="value"> value: ' + node.value +'<span/>'),
         node.x, node.y, node.width, node.height);
     }, this);
     var grid = $(this).data('gridstack');
     _.each(itemBlock, function (node) {
       grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="block"><div class="grid-stack-item-content"/><div/>'),
         node.x, node.y, node.width, node.height);
     }, this);
     _.each(itemsVar, function (node) {
       grid.addWidget($('<div data-gs-locked="yes"><div class="grid-stack-item-content">' +
         '<img src=' + node.image + '  style="margin:auto; display:block" /><div/>' +
       '<span class="value"> value: ' + node.value +'<span/>'),
         node.x, node.y, node.width, node.height);
     }, this);
   });
  jsPlumb.setContainer("bottomGrid");

    jsPlumb.registerEndpointTypes({                                                  //Standard Endpointtyp
     "source": {
      // paintStyle: {fill: "transparent"},
     //  paintStyle: {fill: "green"},
       paintStyle: {fill: "white", outlineStroke:"black", outlineWidth:1},
       hoverPaintStyle: {fill: "green"},
       connectorStyle: {stroke: "black", strokeWidth: 5}
     },
     "target": {
    //   paintStyle: {fill: "transparent"},
     //  paintStyle: {fill: "blue"},
      paintStyle: {fill: "white", outlineStroke:"black", outlineWidth:1},
       hoverPaintStyle: {fill: "blue"}
     }
   });

 jsPlumb.addEndpoint($('.grid-stack-5 #origin.grid-stack-item .grid-stack-item-content'), {
 // jsPlumb.addEndpoint("originChild", {
     anchor: [1, 0.5, 1, 0],
     maxConnections: -1,
     type: "source",
     isSource: true,
   });  //right
 jsPlumb.addEndpoint($('.grid-stack-5 #end.grid-stack-item .grid-stack-item-content'), {
     anchor: [0, 0.5, -1, 0],
     maxConnections: -1,
     type: "target",
     isTarget: true,
   }); //left
  // jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item .grid-stack-item-content').parent(:not($('#origin.grid-stack-item, #end.grid-stack-item, #block.grid-stack-item .grid-stack-item-content ')), {
    jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'),{
     anchor: [1, 0.5, 1, 0],
     maxConnections: -1,
     type: "source",
     isSource: true,
   });
  // jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item').not('#origin, #end, #block'), {
 // jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item .grid-stack-item-content').not($('#origin.grid-stack-item, #end.grid-stack-item, #block.grid-stack-item .grid-stack-item-content ')), {
  jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'),{
     anchor: [0, 0.5, -1, 0],
     maxConnections: -1,
     type: "target",
     isTarget: true
   });

   jsPlumb.draggable($('.grid-stack-5 .grid-stack-item').not('#origin, #end, #block'));   //Zeigt den endpoints dass das Element draggable ist. Noch nicht überschrieben - zwei mal Draggable implementiert pro widget
//  jsPlumb.draggable($('.grid-stack-5 .grid-stack-item:not(#origin, #end, #block) .grid-stack-item-content'));
  jsPlumb.repaintEverything();

   var isGrid;
   $('.grid-stack').on('change', function(event, items) {
   //  console.log(event);
    // console.log($(event.target).data('gridstack'));
     if(isGrid==$(event.target).data('gridstack')){
       console.log("nothingChanged")
     }
     else {
       console.log("Changed");
       _.each(items, function (node) {
         var selectedItemContent=node.el.children(":first");
     //    console.log(selectedItemContent);
     //    console.log(jsPlumb.selectEndpoints({element:selectedItemContent}).length);
         if (jsPlumb.selectEndpoints({element:selectedItemContent}).length == 0) {     //geht in Schlaufe falls Element aus Scrollbar hinzugefügt wurde
           jsPlumb.addEndpoint((selectedItemContent), {
             anchor: [1, 0.5, 1, 0],
             maxConnections: -1,
             type: "source",
             isSource: true,
           });
           jsPlumb.addEndpoint((selectedItemContent), {
             anchor: [0, 0.5, -1, 0],
             maxConnections: -1,
             type: "target",
             isTarget: true
           });
           jsPlumb.draggable(node.el);                                        //Macht neues Element draggable
         }
         //    console.log(jsPlumb.selectEndpoints({element: node.el}));
       });
     }
    // jsPlumb.repaint(items);                                                //Aktualisiert Endpointpositionen nach stop des draggens
     jsPlumb.repaintEverything();

   });
   $('.grid-stack').on('dragstop', function(event, ui) {
   //  console.log($(this).data('gridstack'));
     if(isGrid == $(this).data('gridstack')){
     //  console.log("nothingChanged");
     }
     else{
   //    console.log("Changed");
     }
     var element = event.target;
  //   grid.removeWidget(element);
   //  console.log(this);
   //  console.log(element);
   //  console.log(event);
    //  if (grid.willItFit(element.x, element.y, element.width, element.height, true)) {
    // //   grid.addWidget(element.el, element.x, element.y, element.width, element.height, false);
    // }
    //  // if(grid.isAreaEmpty(element.x, element.y, element.width, element.height)==true){
    //  //   console.log("ok");
    //  // }
    //  else {
    //    alert('Not enough free space to place the widget');
    //  }
   });



   $('.grid-stack').on('change', function(event, items) {
     console.log("change");
   });
   $('.grid-stack').on('dragstart', function(event, ui) {
   //  console.log(this);             //entspricht console.log(event.currentTarget);
     isGrid=$(this).data('gridstack');
    // console.log(isGrid);
    // grid.removeWidget(event.target);
  //   console.log(event);
  //   console.log(event.currentTarget);
   //  console.log(event.target);
     console.log("dragstart");
   });
   $('.grid-stack').on('removed', function(event, items) {
     console.log("removed");
   });
   $('.grid-stack').on('added', function(event, items) {
     console.log("added");
   });
   $('.grid-stack').on('disable', function(event) {
     console.log("disabled");
   });
   $('.grid-stack').on('enable', function(event) {
     console.log("enabled");
   });
    $('.grid-stack').on('dragstop', function(event, ui) {
      console.log("dragstop");
    });
});
   /*
   $('.grid-stack-5 .grid-stack-item').draggable(
     {
       drag: function(e){
         jsPlumb.repaintEverything(); // jsPlumb.repaint($(this)); (or) jsPlumb.repaintEverything(); to repaint the connections and endpoints
         //followed by your code
         var offset = $(this).offset();
         var xPos = offset.left;
         var yPos = offset.top;
         console.log('x: ' + xPos);
         console.log('y: ' + yPos);
       }
     });
*/
   //  $('.grid-stack-1 .grid-stack-item').draggable({
   //   revert: 'invalid',
   //   handle: '.grid-stack-item-content',
   //   scroll: false,
   //   appendTo: 'body'
   // });
   // $('.grid-stack').on('dragstop', function(event, ui) {
   //   var grid = this;
   //   var element = event.target;
   //   if (grid.willItFit(element.x, element.y, element.width, element.height, true)) {
   //     grid.addWidget(element.el, element.x, element.y, element.width, element.height, true);
   //   }
   //   else {
   //     alert('Not enough free space to place the widget');
   //   }
   // });
   // $('.grid-stack').on('change', function(event, items) {
   //   prompt("change");
   // });
   // $('.grid-stack').on('removed', function(event, items) {
   //     prompt("remove");
   // });
   // $('.grid-stack').on('added', function(event, items) {
   //    prompt("added");
   // });


//
// function runButton(){
//   this.grid = $('.grid-stack').data('gridstack');
//
//   this.addNewWidget = function () {
//     var node = {
//       x: randomIntFromInterval(1,10),
//       y: randomIntFromInterval(0,4),
//       width: 1,
//       height: 1
//     };
//     this.grid.addWidget($('<div class="grid-stack-item" data-gs-no-resize="yes"  data-gs-locked="yes">' +
//         '<div class="grid-stack-item-content"/></div>'),
//       node.x, node.y, node.width, node.height);
//     return false;
//   }.bind(this);
//
//   $('#add-new-widget').click(this.addNewWidget);
//   connection.bind("click", function(conn) {
//     this.addNewWidget;
//   });
// }
//
// function randomIntFromInterval(min,max) {
//   return Math.floor(Math.random()*(max-min+1)+min);
// }

function connect(source,target) {
 var sourceEndpoint = jsPlumb.addEndpoint($(source),{ anchor:"BottomCenter", isSource:true});
 var targetEndpoint = jsPlumb.addEndpoint($(target), { anchor:"BottomCenter", isTarget:true});
 // jsPlumb.connect({
 //   source: source,
  //  target: target
 // });
}

// $( window ).resize(function() {
//   this.repaintEverything();
// });

function connect2(source,target) {
  jsPlumb.connect({
    source: source,
    target: target,
    anchors:["BottomCenter", "BottomCenter" ],
    endpoint:"Dot",
    endpointStyle:{ fill: "black" },
  //  detachable:false
  })
//  jsPlumb.draggable((source), {containment:false});
//  jsPlumb.draggable((target));
}

//jsPlumb.bind("ready", function () {
//  $('.grid-stack').on('dragstop', function (event, ui) {
//    var element = $(event.target);
//    var node = element.data('_gridstack_node');
//    console.log(node);
//    connection2 = connect(element.children(),$('#final .grid-stack-item-content'));
//    jsPlumb.revalidate(this);
//  });
//});
