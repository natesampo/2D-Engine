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
	addInputs(game.inputs);
	preventContextMenu();

	let previewTile = new GameObject(0, 0, [undefined, 0, 0, 1], 0, 0);
	previewTile.opacity = 0.4;

	addKeyDownListener(function(key) {
		if (key == 'KeyR') {
			previewTile.angle = (previewTile.angle + 90) % 360;
		}
	});

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

		let savedTiles = [];

		let buttons = [];
		let buttonsLength = 0;
		buttons.push(new UIButton(canvas.width - 80, 16, 64, 64, undefined, 'Tile', function() {
			if (!this.extended) {
				let spriteCanvi = document.getElementsByClassName('spriteCanvas');
				for (var i=0; i<savedTiles.length; i++) {
					buttons.push(savedTiles[i]);
				}

				buttons.push(new UIButton(canvas.width - 216, 16 + 66*savedTiles.length, 64, 64, undefined, 'Save Tile', function() {
					if (buttons[0].img) {
						let ind = savedTiles.length;
						let savedTileButton = new UIButton(canvas.width - 216, 16 + 66*ind, 64, 64, buttons[0].img, buttons[0].img.id, function() {
							buttons[0].img = this.img;
							buttons[0].spriteX = this.spriteX;
							buttons[0].spriteY = this.spriteY;
							buttons[0].spriteWidth = this.spriteWidth;
							buttons[0].spriteHeight = this.spriteHeight;
							buttons[0].frames = this.frames;
							buttons[0].animationSpeed = this.animationSpeed;
							previewTile.angle = this.angle;
						});
						savedTileButton.spriteX = buttons[0].spriteX;
						savedTileButton.spriteY = buttons[0].spriteY;
						savedTileButton.spriteWidth = buttons[0].spriteWidth;
						savedTileButton.spriteHeight = buttons[0].spriteHeight;
						savedTileButton.frames = buttons[0].frames;
						savedTileButton.animationSpeed = buttons[0].animationSpeed;
						savedTileButton.angle = previewTile.angle;

						savedTiles.push(savedTileButton);
						buttons.push(savedTileButton);
						this.y += 66;
					}
				}));

				for (var i=0; i<spriteCanvi.length; i++) {
					buttons.push(new UIButton(canvas.width - 148, 16 + 66*i, 64, 64, spriteCanvi[i], spriteCanvi[i].id, function() {
						buttons[0].img = this.img;
						buttons[0].extended = false;
						buttons.length = buttonsLength;

						if (parseInt(this.img.id.split('.')[this.img.id.split('.').length-2].split('_')[this.img.id.split('_').length-2]) > 1 ||
								parseInt(this.img.id.split('.')[this.img.id.split('.').length-2].split('_')[this.img.id.split('_').length-1]) > 1) {

							let data = window.prompt('x,y,width,height,frames,animation speed (in tiles and frames per tick)', '0,0,1,1,1,0');
							if (data) {
								data = data.split(',');
								buttons[0].spriteX = (isNaN(parseInt(data[0]))) ? 0 : parseInt(data[0]);
								buttons[0].spriteY = (isNaN(parseInt(data[1]))) ? 0 : parseInt(data[1]);
								buttons[0].spriteWidth = (isNaN(parseInt(data[2]))) ? 1 : parseInt(data[2]);
								buttons[0].spriteHeight = (isNaN(parseInt(data[3]))) ? 1 : parseInt(data[3]);
								buttons[0].frames = (isNaN(parseInt(data[4]))) ? 1 : parseInt(data[4]);
								buttons[0].animationSpeed = (isNaN(parseInt(data[5]))) ? 0 : parseInt(data[5]);
								previewTile.angle = 0;
							} else {
								buttons[0].spriteX = 0;
								buttons[0].spriteY = 0;
								buttons[0].spriteWidth = 1;
								buttons[0].spriteHeight = 1;
								buttons[0].frames = 1;
								buttons[0].animationSpeed = 0;
								previewTile.angle = 0;
							}
						} else {
							buttons[0].spriteX = 0;
							buttons[0].spriteY = 0;
							buttons[0].spriteWidth = 1;
							buttons[0].spriteHeight = 1;
							buttons[0].frames = 1;
							buttons[0].animationSpeed = 0;
							previewTile.angle = 0;
						}
					}));
				}

				buttons.push(new UIButton(canvas.width - 148, 16 + 66*spriteCanvi.length, 64, 64, undefined, 'New Sprite', function() {
					let input = document.getElementById('inputButton');
					let onUpload = function(event) {
						let splitPeriod = input.files[0].name.split('.');
						let splitUnderscore = splitPeriod[splitPeriod.length-2].split('_');
						let sizeX = parseInt(splitUnderscore[splitUnderscore.length-2]);
						let sizeY = parseInt(splitUnderscore[splitUnderscore.length-1]);

						let img = new Image();
						img.onload = function() {
							let canvas = document.createElement('canvas');
							canvas.classList.add('spriteCanvas');
							canvas.id = input.files[0].name;
							canvas.width = sizeX * game.screens[0].level.tileSize;
							canvas.height = sizeY * game.screens[0].level.tileSize;
							document.head.appendChild(canvas);

							let context = canvas.getContext('2d');
							context.imageSmoothingEnabled = false;
							context.drawImage(img, 0, 0, sizeX * game.screens[0].level.tileSize, sizeY * game.screens[0].level.tileSize);

							game.screens[0].level.sprites[input.files[0].name] = canvas;
							buttons[0].img = canvas;

							if (sizeX > 1 || sizeY > 1) {
								let data = window.prompt('x,y,width,height,frames,animation speed (in tiles and frames per tick)', '0,0,1,1,1,0');
								if (data) {
									data = data.split(',');
									buttons[0].spriteX = (isNaN(parseInt(data[0]))) ? 0 : parseInt(data[0]);
									buttons[0].spriteY = (isNaN(parseInt(data[1]))) ? 0 : parseInt(data[1]);
									buttons[0].spriteWidth = (isNaN(parseInt(data[2]))) ? 1 : parseInt(data[2]);
									buttons[0].spriteHeight = (isNaN(parseInt(data[3]))) ? 1 : parseInt(data[3]);
									buttons[0].frames = (isNaN(parseInt(data[4]))) ? 1 : parseInt(data[4]);
									buttons[0].animationSpeed = (isNaN(parseInt(data[5]))) ? 0 : parseInt(data[5]);
									previewTile.angle = 0;
								} else {
									buttons[0].spriteX = 0;
									buttons[0].spriteY = 0;
									buttons[0].spriteWidth = 1;
									buttons[0].spriteHeight = 1;
									buttons[0].frames = 1;
									buttons[0].animationSpeed = 0;
									previewTile.angle = 0;
								}
							} else {
								buttons[0].spriteX = 0;
								buttons[0].spriteY = 0;
								buttons[0].spriteWidth = 1;
								buttons[0].spriteHeight = 1;
								buttons[0].frames = 1;
								buttons[0].animationSpeed = 0;
								previewTile.angle = 0;
							}
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
		buttons[0].spriteX = 0;
		buttons[0].spriteY = 0;
		buttons[0].spriteWidth = 1;
		buttons[0].spriteHeight = 1;
		buttons[0].frames = 1;
		buttons[0].animationSpeed = 0;

		buttons.push(new UIButton(canvas.width - 80, canvas.height - 80, 64, 64, undefined, 'Print Level', function() {
			console.log(game.screens[0].level.toString());
		}));

		buttonsLength = buttons.length;

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
					let button = game.screens[0].ui[0];
					game.screens[0].level.addObject(new Tile(tileX, tileY, [button.img.id, button.spriteX, button.spriteY, button.spriteWidth, button.spriteHeight, button.frames],
																previewTile.angle, game.screens[0].ui[0].animationSpeed));
				}
			} else if (which == 3) {
				for (var i=0; i<game.screens[0].ui.length; i++) {
					let button = game.screens[0].ui[i];

					if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
						hitButton = true;
					}
				}

				if (!hitButton && game.screens[0].level.map[tileX] && game.screens[0].level.map[tileX][tileY]) {
					if (game.screens[0].level.map[tileX] && game.screens[0].level.map[tileX][tileY]) {
						let objects = game.screens[0].level.map[tileX][tileY];
						let toBeRemoved = objects[objects.length-1];
						if (toBeRemoved == previewTile) {
							if (objects.length > 1) {
								game.screens[0].level.removeFromMap(objects[objects.length-2]);
							}
						} else {
							game.screens[0].level.removeFromMap(toBeRemoved);
						}
					}
				}
			}
		});

		game.screens.push(new Screen(canvas, context, 0, 0, 1, 1, level, new Camera(0, 0, 0, canvas.width/canvas.height, 1), buttons));
		addMouseWheelListener(function(sign) {game.screens[0].camera.zoom(sign, game.screens[0].camera.x + (canvas.width/level.tileSize)/2, game.screens[0].camera.y + (canvas.height/level.tileSize)/2);});

		addMouseMoveListener(function(x, y) {
			if (game.screens[0].ui[0].img) {
				previewTile.sprite[0] = game.screens[0].ui[0].img.id;
				previewTile.sprite[1] = game.screens[0].ui[0].spriteX;
				previewTile.sprite[2] = game.screens[0].ui[0].spriteY;
				previewTile.sprite[3] = game.screens[0].ui[0].spriteWidth;
				previewTile.sprite[4] = game.screens[0].ui[0].spriteHeight;
				previewTile.sprite[5] = game.screens[0].ui[0].frames;
				previewTile.animationSpeed = game.screens[0].ui[0].animationSpeed;

				game.screens[0].level.removeFromMap(previewTile);
				previewTile.x = x / (game.screens[0].level.tileSize * game.screens[0].camera.zoomLevel) + game.screens[0].camera.x << 0;
				previewTile.y = y / (game.screens[0].level.tileSize * game.screens[0].camera.zoomLevel) + game.screens[0].camera.y << 0;
				game.screens[0].level.addObject(previewTile);
			}
		});

		start(game);
	});
}

launchLevelEditor();