function render(game) {
	
}

function tick(game) {
	let levelCam = game.screens[0].camera;
	let pressed = Object.keys(game.inputs);
	if (contains(pressed, 'KeyW')) {
		levelCam.translate(0, -0.1);
	}
	if (contains(pressed, 'KeyA')) {
		levelCam.translate(-0.1, 0);
	}
	if (contains(pressed, 'KeyS')) {
		levelCam.translate(0, 0.1);
	}
	if (contains(pressed, 'KeyD')) {
		levelCam.translate(0.1, 0);
	}
}

launchExample();