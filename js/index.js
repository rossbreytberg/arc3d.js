$(document).ready(function() {
  var arc = new Arc3d.World(document.getElementById('container'));
  var node1 = new Arc3d.Node([5, 50, 50, 'n'], [50, 50, 50, 'e']);
  var node2 = new Arc3d.Node([5, 50, 50, 's'], [50, 50, 50, 'w']);
  var edge = new Arc3d.Edge(node1, node2);
  arc.add(node1);
  arc.add(node2);
  arc.add(edge);

});