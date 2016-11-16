// $(function () {
//   dashboardFn.initiate();
// });
// var dashboardFn = {
//   initiate: function () {
//     // Grid area to hold active widgets
//     var grid_options = {
//       animate: true,
//       width: 12,
//       height: 1,
//       grid_class: 'grid-stack-top',
//       cell_height:100,
//       float: false,
//       acceptWidgets: '.grid-stack-item'
//     };
//     $('#top').gridstack(grid_options);
//     $('#bottom').gridstack(_.defaults({grid_class: 'grid-stack-bottom', height: 5},grid_options));
//
//     dashboardFn.top_grid = $('#top').data('gridstack');
//     dashboardFn.bottom_grid = $('#bottom').data('gridstack');
//
//     dashboardFn.load_grid();
//   },
//   activate_widget: function (widget, position) {
//     // Get the position of the cell under a pixel on screen
//     var cell = dashboardFn.top_grid.get_cell_from_pixel(widget.position);
//     if(typeof(position) !== 'undefined' && position != null){
//       cell = dashboardFn.top_grid.get_cell_from_pixel(position);
//     }
//     // Check if widget will fit anywhere on Active grid, auto position set to true
//     if (dashboardFn.bottom_grid.will_it_fit(cell.x, cell.y, 1, 1, true)) {
//       // Remove Widget from In-Active grid, remove from DOM set to false
//       dashboardFn.top_grid.remove_widget(widget, false);
//       // Add Widget to Active Grid, auto position set to true
//       dashboardFn.bottom_grid.add_widget(widget, cell.x, cell.y, 1, 1, true);
//       // Enable re-sizing of Widget while In-Active
//       dashboardFn.bottom_grid.resizable('.grid-stack-bottom .grid-stack-item', true);
//     }
//     else {
//       alert('Not enough free space to add the widget');
//     }
//   },
//
//   deactivate_widget: function (widget, position) {
//     // Get the position of the cell under a pixel on screen
//     var	cell = dashboardFn.bottom_grid.get_cell_from_pixel(widget.position);
//     if(typeof(position) !== 'undefined' && position != null){
//       cell = dashboardFn.bottom_grid.get_cell_from_pixel(position);
//     }
//     // Check if widget will fit anywhere on In-Active grid, auto position set to true
//     if (dashboardFn.top_grid.will_it_fit(cell.x, cell.y, 1, 1, true)) {
//       // Remove Widget from Active grid, remove from DOM set to false
//       dashboardFn.bottom_grid.remove_widget(widget, false);
//       // Add Widget to In-Active Grid, auto position set to true
//       dashboardFn.top_grid.add_widget(widget, cell.x, cell.y, 1, 1, true);
//       // Disable re-sizing of Widget while In-Active
//       dashboardFn.top_grid.resizable('.grid-stack-top .grid-stack-item', false);
//     }
//     else {
//       alert('Not enough free space to remove the widget');
//     }
//   },
//
//   load_grid : function () {
//     // Force Active grid to accept only Widgets from In-Active Grid, otherwise allow grid-stack to do it's thing
//     dashboardFn.bottom_grid.container.droppable({
//       accept: ".grid-stack-top .grid-stack-item",
//       tolerance: 'pointer',
//       drop: function( event, ui ) {
//         dashboardFn.activate_widget(ui.draggable, ui.position);
//       }
//     });
//
//     // Force In-Active grid to accept only Widgets from Active Grid, otherwise allow grid-stack to do it's thing
//     dashboardFn.top_grid.container.droppable({
//       accept: ".grid-stack-bottom .grid-stack-item",
//       tolerance: 'pointer',
//       drop: function( event, ui ) {
//         dashboardFn.deactivate_widget(ui.draggable, ui.position);
//       }
//     });
//   }
// };
