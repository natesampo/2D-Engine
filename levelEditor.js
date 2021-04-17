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
		let tileX = x / (game.screens[0].level.tileSize * game.screens[0].camera.zoomLevel) + game.screens[0].camera.x << 0;
		let tileY = y / (game.screens[0].level.tileSize * game.screens[0].camera.zoomLevel) + game.screens[0].camera.y << 0;
		if (which == 1) {
			for (var i=0; i<game.screens[0].ui.length; i++) {
				let button = game.screens[0].ui[i];

				if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
					hitButton = true;
					button.onClick();
				}
			}

			if (!hitButton && game.screens[0].ui[0].img) {
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
				delete game.screens[0].level.map[tileX][tileY];
				if (Object.values(game.screens[0].level.map[tileX]).length == 0) {
					delete game.screens[0].level.map[tileX];
				}
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
		let buttonsLength = 0;
		buttons.push(new UIButton(canvas.width - 80, 16, 64, 64, undefined, 'Tile', function() {
			if (!this.extended) {
				let spriteCanvi = document.getElementsByClassName('spriteCanvas');
				for (var i=0; i<spriteCanvi.length; i++) {
					buttons.push(new UIButton(canvas.width - 148, 16 + 66*i, 64, 64, spriteCanvi[i], spriteCanvi[i].id, function() {
						buttons[0].img = this.img;
						buttons[0].extended = false;
						buttons.length = buttonsLength;
					}));
				}
				buttons.push(new UIButton(canvas.width - 148, 16 + 66*spriteCanvi.length, 64, 64, undefined, 'New Sprite', function() {
					let input = document.getElementById('inputButton');
					let onUpload = function(event) {
						let img = new Image();
						img.onload = function() {
							let canvas = document.createElement('canvas');
							canvas.classList.add('spriteCanvas');
							canvas.id = input.files[0].name;
							canvas.width = game.screens[0].level.tileSize;
							canvas.height = game.screens[0].level.tileSize;
							document.head.appendChild(canvas);

							let context = canvas.getContext('2d');
							context.imageSmoothingEnabled = false;
							context.drawImage(img, 0, 0, game.screens[0].level.tileSize, game.screens[0].level.tileSize);
							game.screens[0].level.addSprite(input.files[0].name, canvas, parseInt(input.files[0].name.split('_')[input.files[0].name.split('_').length-1]));
							buttons[0].img = canvas;
						}
						img.src = URL.createObjectURL(input.files[0]);
						input.removeEventListener('change', onUpload);
					};
					input.addEventListener('change', onUpload);
					input.click();

					buttons[0].extended = false;
					buttons.length = buttonsLength;
				}));
				this.extended = true;
			} else {
				buttons.length = buttonsLength;
				this.extended = false;
			}
		}));

		buttons.push(new UIButton(canvas.width - 80, canvas.height - 80, 64, 64, undefined, 'Print Level', function() {
			let levelString = 'color ' + game.screens[0].level.color['r'] + ' ' + game.screens[0].level.color['g'] + ' ' + game.screens[0].level.color['b'] + ' ' + game.screens[0].level.color['a'] + '\n';
			levelString += 'tileSize ' + game.screens[0].level.tileSize + '\n';
			for (var i in game.screens[0].level.map) {
				for (var j in game.screens[0].level.map[i]) {
					levelString += game.screens[0].level.map[i][j].toString() + '\n';
				}
			}
			console.log(levelString);
		}));

		buttonsLength = buttons.length;

		game.screens.push(new Screen(canvas, context, 0, 0, 1, 1, level, new Camera(0, 0, 0, canvas.width/canvas.height, 1), buttons));
		addMouseWheelListener(function(sign) {game.screens[0].camera.zoom(sign, game.screens[0].camera.x + (canvas.width/level.tileSize)/2, game.screens[0].camera.y + (canvas.height/level.tileSize)/2);});

		start(game);
	});
}

launchLevelEditor();