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

function launchLevelEditor() {
	let game = new Game();
	addKeyUpListener(game.inputs);
	addKeyDownListener(game.inputs);
	addMouseDownListener(function(which, x, y) {
		let hitButton = false;
		let tileX = x / game.screens[0].level.tileSize + game.screens[0].camera.x << 0;
		let tileY = y / game.screens[0].level.tileSize + game.screens[0].camera.y << 0;
		if (which == 1) {
			for (var i=0; i<game.screens[0].ui.length; i++) {
				let button = game.screens[0].ui[i];

				if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
					hitButton = true;
					button.onClick();
				}
			}

			if (!hitButton) {
				game.screens[0].level.addObject(new Tile(tileX, tileY, game.screens[0].ui[0].img.id, 0));
			}
		} else if (which == 3) {
			for (var i=0; i<game.screens[0].ui.length; i++) {
				let button = game.screens[0].ui[i];

				if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
					hitButton = true;
				}
			}

			if (!hitButton && game.screens[0].level.map[tileX] && game.screens[0].level.map[tileX][tileY]) {
				game.screens[0].level.map[tileX][tileY] = [];
			}
		}
	});
	preventContextMenu();

	loadLevel('example.lvl', function(level) {
		let canvas = document.createElement('canvas');
		canvas.classList.add('screenCanvas');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.body.appendChild(canvas);
		let context = canvas.getContext('2d');
		context.imageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;

		let buttons = [];
		buttons.push(new UIButton(canvas.width - 80, 16, 64, 64, undefined, 'Tile', function() {
			if (!this.extended) {
				let spriteCanvi = document.getElementsByClassName('spriteCanvas');
				for (var i=0; i<spriteCanvi.length; i++) {
					buttons.push(new UIButton(canvas.width - 148, 16 + 64*i, 64, 64, spriteCanvi[i], spriteCanvi[i].id, function() {
						buttons[0].extended = false;
						buttons[0].img = this.img;
						buttons.length = 1;
					}));
				}
				this.extended = true;
			} else {
				buttons.length = 1;
				this.extended = false;
			}
		}));

		game.screens.push(new Screen(canvas, context, 0, 0, 1, 1, level, new Camera(0, 0, 0, canvas.width/canvas.height, 1), buttons));
		addMouseWheelListener(function(sign) {game.screens[0].camera.zoom(sign, game.screens[0].camera.x + (canvas.width/level.tileSize)/2, game.screens[0].camera.y + (canvas.height/level.tileSize)/2);});

		start(game);
	});
}

launchLevelEditor();