$(document).ready(function() {
  var arc = new Arc3d.World(document.getElementById('container'));

  var directionsLat = ['n', 's'];
  var directionsLong = ['e', 'w'];
  var edges = [];
  for (var i = 0; i < 50; i++) {
    var node1 = new Arc3d.Node(
      [90*Math.random(), 60*Math.random(), 60*Math.random(), directionsLat[Math.round(Math.random())]],
      [180*Math.random(), 60*Math.random(), 60*Math.random(), directionsLong[Math.round(Math.random())]]
    );
    var node2 = new Arc3d.Node(
      [90*Math.random(), 60*Math.random(), 60*Math.random(), directionsLat[Math.round(Math.random())]],
      [180*Math.random(), 60*Math.random(), 60*Math.random(), directionsLong[Math.round(Math.random())]]
    );
    edges[i] = new Arc3d.Edge(node1, node2);
    arc.add(node1);
    arc.add(node2);
    arc.add(edges[i]);
    setTimeout((function(n) {
      return function() {
        setInterval(function() {
          edges[n].sendData(1, {speed: 10000 * Math.random()});
        }, 5000*Math.random());
      }
    })(i), 10000 * Math.random());
  }

});