/**
 * Created by Sven on 02.11.2016.
 */
//Items dont trigger add/remove events
 $(function () {
  $('.grid-stack-1').gridstack({  //Hier führt Aufruf mit options zu Fehler?! Gleiche Zellhöhe wie letzter Grid
    animate: true,
    height: 1,
    width: 1,        //wie viele passen nebeneinander
    float: false,
    disableResize: true,
    cellHeight: 100,
    removable: true,
    removeTimeout: 100,
  });
  $('.grid-stack-5').gridstack({
    animate: true,
    height: 5,
    width: 5,
    float: true,
    disableResize: true,
    cellHeight: 250,
    acceptWidgets:'.grid-stack-item',
    removable: true,
    removeTimeout: 100,
  });
//  $('#bottom2.grid-stack').gridstack(_.defaults({height: 5}, options)); //Verwende options aber ändere Parameter für heights
   var items = [
    {x: 0, y: 0, width: 1, height: 1},
  ];
  $('.grid-stack-1').each(function () {
    var grid = $(this).data('gridstack');
    _.each(items, function (node) {
      grid.addWidget($('<div><div class="grid-stack-item-content">Drag<div/><div/>'),
        node.x, node.y, node.width, node.height);
    }, this);
  });
   var itemOrigin = [
     {x: 0, y: 1, width: 1, height: 1},
   ];
   var itemEnd = [
    {x: 4, y: 1, width: 1, height: 1},
   ];
   var itemsVar = [
     {x: 1, y: 2, width: 1, height: 1},
     {x: 3, y: 0, width: 1, height: 1},
     {x: 2, y: 1, width: 1, height: 1},
     {x: 3, y: 1, width: 1, height: 1},
   ];
   $('.grid-stack-5').each(function () {
     var grid = $(this).data('gridstack');
     _.each(itemOrigin, function (node) {
       grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="origin"><div class="grid-stack-item-content"><div/><div/>'),
         node.x, node.y, node.width, node.height);
     }, this);
     _.each(itemEnd, function (node) {
       grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="end"><div class="grid-stack-item-content"><div/><div/>'),
         node.x, node.y, node.width, node.height);
     }, this);
     _.each(itemsVar, function (node) {
       grid.addWidget($('<div><div class="grid-stack-item-content"><div/><div/>'),
         node.x, node.y, node.width, node.height);
     }, this);
   });
 //  $('.grid-stack-item').each(function () {
  //  jsPlumb.addEndpoint(this,{ anchor:"BottomCenter", isSource:true, isTarget:true});
  //  });
   jsPlumb.registerEndpointTypes({
     "source": {
       paintStyle: {fill:"green"}
     },
     "target": {
       paintStyle: {fill:"blue"}
     }
   });
   jsPlumb.addEndpoint($('.grid-stack-5 #origin'),{ anchor:[ 0.9, 0.5, 1, 0], type:"source", isSource:true});  //right
   jsPlumb.addEndpoint($('.grid-stack-5 #end'),{ anchor:[ 0.1, 0.5, -1, 0], type:"target", isTarget:true}); //left
   jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item').not('#origin, #end'),{ anchor:[ 0.9, 0.5, 1, 0], maxConnections: -1, type:"source", isSource:true});
   jsPlumb.addEndpoint($('.grid-stack-5 .grid-stack-item').not('#origin, #end'),{ anchor:[ 0.1, 0.5, -1, 0], maxConnections: -1, type:"target", isTarget:true});
  // jsPlumb.draggable($('.grid-stack-5 .grid-stack-item'));

   $('.grid-stack-5 .grid-stack-item').draggable(
     {
       drag: function(e){
         jsPlumb.repaintEverything(); // (or) jsPlumb.repaintEverything(); to repaint the connections and endpoints
         //followed by your code
         var offset = $(this).offset();
         var xPos = offset.left;
         var yPos = offset.top;
         console.log('x: ' + xPos);
         console.log('y: ' + yPos);
       }
     });

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
});

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
