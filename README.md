arc3d.js
========

Show a 3d globe using webGL and map graph nodes and edges onto it with the simple api.

Example:

var container = document.getElementById('container'); // container for the visualization to occupy
var world = new Arc3d.World(container, {OPTIONS});

var node1 = new Arc3d.Node([DEGREES, MINUTES, SECONDS, 'n'/'s'],[DEGREES, MINUTES, SECONDS, 'e'/'w'], {OPTIONS}); // create nodes with latitude and longitude coordinates
var node2 = new Arc3d.Node([DEGREES, MINUTES, SECONDS, 'n'/'s'],[DEGREES, MINUTES, SECONDS, 'e'/'w'], {OPTIONS});

var edge = new Arc3d.Edge(node1, node2, {OPTIONS}); // create edge connecting two nodes

// add nodes and edge to world
world.add(node1);
world.add(node2);
world.add(edge);

edge.sendData(1/-1, {OPTIONS}); // run animation along edge, forward if 1, reverse if -1.

// remove nodes and edge from world
world.remove(edge);
world.remove(node1);
world.remove(node2);

Options:

Arc3d.World: radius

Arc3d.Node: color, radius

Arc3d.Edge: color, lineWidth, segments

Arc3d.Edge.sendData: datacolor, speed, size