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
    cellHeight: 300,
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
   var itemsFix = [
     {x: 0, y: 2, width: 1, height: 1},
    // {x: 4, y: 2, width: 1, height: 1},
   ];
   var itemsVar = [
     {x: 1, y: 2, width: 1, height: 1},
     {x: 3, y: 0, width: 1, height: 1},
     {x: 2, y: 1, width: 1, height: 1},
     {x: 3, y: 1, width: 1, height: 1},
   ];
   $('.grid-stack-5').each(function () {
     var grid = $(this).data('gridstack');
     _.each(itemsFix, function (node) {
       grid.addWidget($('<div data-gs-no-move="yes" data-gs-locked="yes" id="final"><div class="grid-stack-item-content"><div/><div/>'),
         node.x, node.y, node.width, node.height);
     }, this);
     _.each(itemsVar, function (node) {
       grid.addWidget($('<div><div class="grid-stack-item-content"><div/><div/>'),
         node.x, node.y, node.width, node.height);
     }, this);
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
  jsPlumb.connect({
    source: source,
    target: target
  });
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

jsPlumb.bind("ready", function () {
  $('.grid-stack').on('dragstop', function (event, ui) {
    var element = $(event.target);
    var node = element.data('_gridstack_node');
    console.log(node);
    connection2 = connect(element.children(),$('#final .grid-stack-item-content'));
    jsPlumb.revalidate(this);
  });
  // $.draggable({
  //   drag: function (event, ui) {
  //     jsPlumb.revalidate(this);
  //     repaintEverything()
  //   }  q
  // });
  // $.dragstop({
  //   drag: function (event, ui) {
  //     jsPlumb.revalidate(this);
  //     repaintEverything()
  //   }
  // });
  // connection = connect2("connect1", "connect2");
/*  var firstInstance = jsPlumb.getInstance({
    PaintStyle: {
      lineWidth: 10,
      strokeStyle: "#567567",
      outlineColor: "black",
      outlineWidth: 1
    },
    Connector: ["Bezier", { curviness: 10 }],
    Endpoint: ["Dot", { radius: 8 }]
  });
 firstInstance.connect({
    source: "connect1",
    target: "connect2",
    anchors: ["BottomCenter", "BottomCenter"],
   paintStyle:{strokeWidth:15,stroke:'rgb(243,230,18)'}
  });
  $( window ).resize(function() {
    firstInstance.repaintEverything();
  });*/
});
