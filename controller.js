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

function addMouseDownListener(func) {
	document.addEventListener('mousedown', function(event) {
		func(event.which, event.clientX, event.clientY);
	});
}

function addMouseUpListener(func) {
	document.addEventListener('mouseup', function(event) {
		func(event.which, event.clientX, event.clientY);
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