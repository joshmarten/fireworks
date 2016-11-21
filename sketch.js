var serial;
var portName = '/dev/cu.usbmodem1411';

var options = {
	baudrate: 9600
};

var inData;

var magnitude;
var size;

var hslaInterior;
var hueMap;
var lifespanMap;
var c;

var system;

////////////////////////////////////////////////////////////////////

function setup() {
	createCanvas(windowWidth, windowHeight);

	serial = new p5.SerialPort();
	serial.on('connected', serverConnected);
	serial.on('open', portOpen);
	serial.on('data', serialEvent);
	serial.on('error', serialError);
	serial.on('close', portClose);
	serial.open(portName, options);

	system = new ParticleSystem(createVector(width / 2, height / 2));
}

////////////////////////////////////////////////////////////////////

function draw() {
	background(0);

	magnitude = map(inData, -20, 255, 0, 6);
	size = map(inData, -40, 255, width / 20, 3);

	system.addParticle();
	system.run();

	console.log(inData);
}

//PARTICLE BUSINESS
////////////////////////////////////////////////////////////////////

// A simple Particle class
var Particle = function(position) {
	this.velocity = createVector(random(-5, 5), random(-5, 5));
	this.position = position.copy();
	this.lifespan = 1020.0;
};

Particle.prototype.run = function() {
	this.update();
	this.display();
};

// Method to update position
Particle.prototype.update = function() {
	this.position.add(this.velocity);
	this.velocity.rotate(2 * PI / 360);
	this.velocity.setMag(magnitude);
	this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function() {
	noStroke();
	hueMap = round(map(inData, -40, 255, 0, 58));
	lifespanMap = map(this.lifespan, 1020, 0, 1, 0.01);
	hslaInterior = 'hsla(' + hueMap + ', 100%, 50%, ' + lifespanMap + ')'
	c = color(hslaInterior);
	fill(c);
	ellipse(this.position.x, this.position.y, size, size);
};

// Is the particle still useful?
Particle.prototype.isDead = function() {
	if (this.lifespan < 0) {
		return true;
	} else {
		return false;
	}
};

var ParticleSystem = function(position) {
	this.origin = position.copy();
	this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
	this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
	for (var i = this.particles.length - 1; i >= 0; i--) {
		var p = this.particles[i];
		p.run();
		if (p.isDead()) {
			this.particles.splice(i, 1);
		}
	}
};

//SERIAL BUSINESS
////////////////////////////////////////////////////////////////////

function serverConnected() {
	print('connected to server.');
}

function portOpen() {
	print('the serial port opened.')
}

function serialEvent() {
	inData = Number(serial.read());
}

function serialError(err) {
	print('Something went wrong with the serial port. ' + err);
}

function portClose() {
	print('The serial port closed.');
}