function addKeyDownListener(inputs) {
	document.addEventListener('keydown', function(event) {
		inputs[event.code] = event.key;
	});
}

function addKeyUpListener(inputs) {
	document.addEventListener('keyup', function(event) {
		delete inputs[event.code];
	});
}

function addMouseDownListener(inputs) {
	inputs['mousedown'] = [];
	document.addEventListener('mousedown', function(event) {
		inputs['mousedown'].push(event.which);
	});
}

function addMouseUpListener(inputs) {
	document.addEventListener('mouseup', function(event) {
		inputs['mousedown'] = [];
	});
}

function addMouseWheelListener(func) {
	document.addEventListener('wheel', function(event) {
		func(Math.sign(event.deltaY));
	});
}

function preventContextMenu() {
	document.addEventListener('contextmenu', function(event) {
		event.preventDefault()
	});
}