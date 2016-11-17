/**
 * Created by Sven on 02.11.2016.
 */
 $(function () {
  var options = {
    // turns animation on
    animate: true,
    height: 1,
    width: 1,        //wie viele passen nebeneinander
    float: false,
    disableResize: true,
    cellHeight: 100,
    removable: true,
    acceptWidgets: '.grid-stack-item',
  };
  $('.grid-stack-1').gridstack(options);
  $('.grid-stack-12').gridstack(_.defaults({height: 5, width: 12, float:true}, options)); //Verwende options aber ändere Parameter für heights
  $('.grid-stack .grid-stack-item').draggable({
    revert: 'invalid',
    handle: '.grid-stack-item-content',
    scroll: false,
    appendTo: 'body'
  });
});




function runButton(){
  this.grid = $('.grid-stack').data('gridstack');

  this.addNewWidget = function () {
    var node = {
      x: randomIntFromInterval(1,10),
      y: randomIntFromInterval(0,4),
      width: 1,
      height: 1
    };
    this.grid.addWidget($('<div class="grid-stack-item" data-gs-no-resize="yes"  data-gs-locked="yes">' +
        '<div class="grid-stack-item-content"/></div>'),
      node.x, node.y, node.width, node.height);
    return false;
  }.bind(this);

  $('#add-new-widget').click(this.addNewWidget);
  connection.bind("click", function(conn) {
    this.addNewWidget;
  });
}

function randomIntFromInterval(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}













function connect(source,target) {
 //  var endpointOptions = { isSource:true, isTarget:true };
 //  var sourceEndpoint = jsPlumb.addEndpoint($(source),{ anchor:"BottomCenter" }, endpointOptions );
 //  var targetEndpoint = jsPlumb.addEndpoint($(target), { anchor:"BottomCenter" }, endpointOptions );
  jsPlumb.makeSource(source, {
    anchor:"Continuous",
    endpoint:["Rectangle", { width:40, height:20 }],
    maxConnections:3
  });
  jsPlumb.makeTarget(target, {
    anchor:"Continuous",
    endpoint:["Rectangle", { width:40, height:20 }],
    maxConnections:3
  });
  jsPlumb.connect({
    source: source,
    target: target
  });
 // jsPlumb.draggable($("#connect1 .endpoint1"), {containment:false});
 // jsPlumb.draggable($(".grid-stack-item-content"));
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
  $('.grid-stack').on('dragstop', function(event, ui) {
    connection2 = connect2("connect1", "connect2");
    jsPlumb.revalidate(this);
  });
  $.draggable({
    drag: function (event, ui) {
      jsPlumb.revalidate(this);
      repaintEverything()
    }
  });
  $.dragstop({
    drag: function (event, ui) {
      jsPlumb.revalidate(this);
      repaintEverything()
    }
  });
  connection = connect2("connect1", "connect2");
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
