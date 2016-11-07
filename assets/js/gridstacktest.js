/**
 * Created by Sven on 02.11.2016.
 */
$(function () {
  $('.grid-stack').gridstack({

    // turns animation on
    animate: true,

    // amount of columns
    width: 12,

    // maximum rows amount
    height: 5,

    // widget class
    item_class: 'grid-stack-item',

    // class for placeholder
    placeholder_class: 'grid-stack-placeholder',

    // text for placeholder
    placeholderText: '',

    // draggable handle selector
    handle: '.grid-stack-item-content',

    // class for handle
    handleClass: null,

    // one cell height
    cell_height: 100,

    // if false it tells to do not initialize existing items
    auto: true,

    // minimal width.
    min_width: 768,

    // enable floating widgets
    float: false,

    // vertical gap size
    vertical_margin: 20,

    // makes grid static
    static_grid: false,

    // if true the resizing handles are shown even the user is not hovering over the widget
    always_show_resize_handle: false,

    // allows to owerride jQuery UI draggable options
    draggable: {handle: '.grid-stack-item-content', scroll: true, appendTo: 'body'},

    // allows to owerride jQuery UI resizable options
    resizable: {autoHide: true, handles: 'se'},

    // disallows dragging of widgets
    disableDrag: false,

    // disallows resizing of widgets
    disableResize: false,

    // if `true` turns grid to RTL.
    // Possible values are `true`, `false`, `'auto'`
    rtl: 'auto',

    // if `true` widgets could be removed by dragging outside of the grid
    removable: false,

    // time in milliseconds before widget is being removed while dragging outside of the grid
    removeTimeout: 2000

  });

  new function () {

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

  };
});
function randomIntFromInterval(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}


