var Arc3d = {_nextID:0};

Arc3d.Util = {
  dist: function(p1, p2) {
    return Math.sqrt(Math.pow((p1.x-p2.x),2) + Math.pow((p1.y-p2.y),2) + Math.pow((p1.z-p2.z),2));
  },

  midPoint: function(p1, p2) {
    return {x: (p1.x+p2.x)/2, y: (p1.y+p2.y)/2, z: (p1.z+p2.z)/2};
  },

  normalize: function(vector) {
    var length = Arc3d.Util.dist(vector, {x: 0, y: 0, z: 0});
    return {x: vector.x/length, y: vector.y/length, z: vector.z/length};
  },

  scale: function(vector, scalar) {
    return {x: vector.x * scalar, y: vector.y * scalar, z: vector.z * scalar};
  },

  add: function(v1, v2) {
    return {x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z};
  }
};

Arc3d.World = function(container, options) {
  var self = this;

  this._options = {radius: 500};

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this._options[key] = options[key];
    }
  }

  var camera, renderer, controls, projector, scene, stats, container, plane, composer, effectFXAA;

  var keyDict = {};
  var buttonDict = {};

  var postprocessing = { enabled  : true };

  function init () {

    camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 50, 20000);

    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);
    controls.autoRotate = true;

    camera.position.x = 0;
    camera.position.y = 2500;
    camera.position.z = 2500;

    scene = new THREE.Scene();
    self._scene = scene;
    scene.fog = new THREE.FogExp2(0x222222, 0.0001);

    // Model Loader
    // var loader = new THREE.JSONLoader();

    // Projector
    projector = new THREE.Projector();

    // Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );

    // Earth
    var earthGeo = new THREE.SphereGeometry(self._options.radius, 25, 25);
    var earthMat = new THREE.MeshPhongMaterial({
      color: 0x44ff44
    });
    var earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // Lights
    var light = new THREE.PointLight(0xffffff, 1, 20000);
    light.position.set(0, 1500, 0);
    // light.castShadow = true;
    // light.shadowMapBias = 0.001
    // light.shadowMapWidth = light.shadowMapHeight = 2048;
    // light.shadowMapDarkness = .6;
    scene.add(light);

    var lightGeo = new THREE.SphereGeometry(300, 25, 25);
    var lightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    var lightMesh = new THREE.Mesh(lightGeo, lightMat);
    lightMesh.position.y = 1500;
    scene.add(lightMesh);


    //var ambientLight = new THREE.AmbientLight( 0x999999 );
    //scene.add( ambientLight );

    // renderer
    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.setClearColor(scene.fog.color, 1);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColorHex(0x222222, renderer.getClearAlpha());

    container.appendChild(renderer.domElement);

    var renderModel = new THREE.RenderPass( scene, camera );
    var effectBloom = new THREE.BloomPass( 1, 9, 1.0, 1024 );
    var effectCopy = new THREE.ShaderPass( THREE.CopyShader );
    effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    var width = container.offsetWidth || 2;
    var height = container.offsetHeight || 2;
    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
    effectCopy.renderToScreen = true;
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( renderModel );
    //composer.addPass( effectFXAA );
    //composer.addPass( effectBloom );
    composer.addPass( effectCopy );

    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('keydown', onDocumentKeyDown, false);
    window.addEventListener('keyup', onDocumentKeyUp, false);
  }

  function onWindowResize () {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / container.offsetWidth, 1 / container.offsetHeight );

    composer.reset();
  }

  function animate () {
    requestAnimationFrame(animate);
    render();
    controls.update();
    stats.update();

    keyControl();

  }

  function render () {
    renderer.clear();
    composer.render();
  }

  function keyControl () {
  }

  function onDocumentMouseDown (event) {
    if (event.button == 0) {
      event.preventDefault();
    }
  }

  function onDocumentKeyDown (event) {
    keyDict[event.keyCode] = true;
  }

  function onDocumentKeyUp (event) {
    keyDict[event.keyCode] = false;
  }

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  } else {
    init();
    animate();
  }
}

Arc3d.World.prototype.add = function(obj) {
  if (obj instanceof Arc3d.Node) {
    obj._position.z = this._options.radius * Math.cos(obj._theta) * Math.sin(obj._phi);
    obj._position.x = this._options.radius * Math.sin(obj._theta) * Math.sin(obj._phi);
    obj._position.y = this._options.radius * Math.cos(obj._phi);
    console.log(obj._theta, obj._phi);
    var geometry = new THREE.SphereGeometry(obj._options.radius, 25, 25);
    var material = new THREE.MeshPhongMaterial({
      color: obj._options.color
    });
    obj._mesh = new THREE.Mesh(geometry, material);
    obj._mesh.position.x = obj._position.x;
    obj._mesh.position.y = obj._position.y;
    obj._mesh.position.z = obj._position.z;
    this._scene.add(obj._mesh);
  } else if (obj instanceof Arc3d.Edge) {
    var normalizedMidpoint = Arc3d.Util.normalize(Arc3d.Util.midPoint(obj._node1._position, obj._node2._position));
    var surfaceMidpoint = Arc3d.Util.scale(normalizedMidpoint, this._options.radius);
    var dist = Arc3d.Util.dist(obj._node1._position, obj._node2._position);
    obj._midpoint = Arc3d.Util.add(surfaceMidpoint, Arc3d.Util.scale(normalizedMidpoint, dist));
    var curve = new THREE.QuadraticBezierCurve3(obj._node1._position, obj._midpoint, obj._node2._position);
    var curvePath = new THREE.CurvePath();
    curvePath.add(curve);
    var geometry = curvePath.createSpacedPointsGeometry(obj._options.segments);
    var material = new THREE.LineBasicMaterial({
      color: obj._options.color
    });
    obj._mesh = new THREE.Line(geometry, material);
    console.log(obj._mesh);
    this._scene.add(obj._mesh);
  } else {
    console.error('Arc3d.World.add: INVALID OBJECT TYPE SUPPLIED');
  }
  this._scene.add(obj._mesh);
}

Arc3d.World.prototype.remove = function(obj) {
  if (obj instanceof Arc3d.Node) {
    var edgeIDs = Object.keys(obj._edges);
    for (var i = 0; i < edgeIDs.length; i++) {
      var edge = obj._edges[edgeIDs[i]];
      delete edge._node1._edges[edge._ID];
      delete edge._node2._edges[edge._ID];
      this._scene.remove(edge);
    }
    this._scene.remove(obj);
  } else if (obj instanceof Arc3d.Edge) {
    delete obj._node1._edges[obj._ID];
    delete obj._node2._edges[obj._ID];
    this._scene.remove(obj);
  } else {
    console.error('Arc3d.World.remove: INVALID OBJECT TYPE SUPPLIED');
  }
}



Arc3d.Node = function(latitude, longitude, options) {
  var self = this;

  this._options = {color: 0xffffff * Math.random(), radius: 25};

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this._options[key] = options[key];
    }
  }

  var latDegrees = latitude[0] + latitude[1]/60 + latitude[2]/3600;
  var longDegrees = longitude[0] + longitude[1]/60 + longitude[2]/3600;
  var latRadians = latDegrees * Math.PI/180;
  var longRadians = longDegrees * Math.PI/180;
  var theta, phi;
  if (latitude[3] == 'n') {
    this._phi = Math.PI/2 - latRadians;
  } else if (latitude[3] == 's') {
    this._phi = Math.PI/2 + latRadians;
  } else {
    console.error('Arc3d.Node: INVALID DIRECTION FOR LATITUDE');
  }
  if (longitude[3] == 'e') {
    this._theta = longRadians;
  } else if (longitude[3] == 'w') {
    this._theta = -longRadians;
  } else {
    console.error('Arc3d.Node: INVALID DIRECTION FOR LONGITUDE');
  }

  this._edges = {};
  this._position = {x: null, y: null, z: null};
  this._mesh = null;
};



Arc3d.Edge = function(node1, node2, options) {
  var self = this;

  this._options = {color: 0xffffff * Math.random(), segments: 25};

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this._options[key] = options[key];
    }
  }

  this._ID = Arc3d._nextID;
  Arc3d._nextID++;

  this._mesh = null;

  node1._edges[this._ID] = this;
  node2._edges[this._ID] = this;

  this._node1 = node1;
  this._node2 = node2;

  this._midpoint = {x: null, y: null, z: null};

};