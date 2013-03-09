$(document).ready(function() {
  var arc = new Arc3d.World(document.getElementById('container'));

  var directionsLat = ['n', 's'];
  var directionsLong = ['e', 'w'];
  for (var i = 0; i < 100; i++) {
    var node1 = new Arc3d.Node(
      [90*Math.random(), 60*Math.random(), 60*Math.random(), directionsLat[Math.round(Math.random())]],
      [180*Math.random(), 60*Math.random(), 60*Math.random(), directionsLong[Math.round(Math.random())]]
    );
    var node2 = new Arc3d.Node(
      [90*Math.random(), 60*Math.random(), 60*Math.random(), directionsLat[Math.round(Math.random())]],
      [180*Math.random(), 60*Math.random(), 60*Math.random(), directionsLong[Math.round(Math.random())]]
    );
    var edge = new Arc3d.Edge(node1, node2);
    arc.add(node1);
    arc.add(node2);
    arc.add(edge);
  }

});