class Tile {
	constructor(x, y, sprite, animationSpeed) {
		this.x = x;
		this.y = y;
		this.sprite = sprite;
		this.animationFrame = 0;
		this.animationSpeed = animationSpeed ? animationSpeed : 0;
	}
}

class GameObject {
	constructor(x, y, sprite, animationSpeed) {
		this.x = x;
		this.y = y;
		this.sprite = sprite;
		this.animationFrame = 0;
		this.animationSpeed = animationSpeed ? animationSpeed : 0;
	}

	translate(x, y) {
		this.x += x;
		this.y += y;
	}
}

class Camera {
	constructor(x, y, angle, aspectRatio, zoomLevel) {
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.aspectRatio = aspectRatio;
		this.zoomLevel = zoomLevel;
	}

	translate(x, y) {
		this.x += x;
		this.y += y;
	}

	rotate(angle) {
		this.angle += angle;
	}

	zoom(zoomLevel, zoomOriginX, zoomOriginY) {
		// its not perfect but whatever
		let zoomDelta = zoomLevel * 0.05;
		this.translate(-(this.x + zoomOriginX) * zoomDelta, -(this.y + zoomOriginY) * zoomDelta);
		this.zoomLevel -= zoomDelta;
	}
}

class Level {
	constructor(color, tileSize, objects, sprites) {
		this.color = color;
		this.tileSize = tileSize;
		this.sprites = sprites;

		this.map = {};
		for (var i=0; i<objects.length; i++) {
			this.putInMap(objects[i]);
		}
	}

	addObject(obj) {
		if (obj instanceof Tile) {
			if (this.map[obj.x] && this.map[obj.x][obj.y]) {
				for (var i=0; i<this.map[obj.x][obj.y].length; i++) {
					if (this.map[obj.x][obj.y][i] instanceof Tile) {
						this.map[obj.x][obj.y].splice(i, 1);
						break;
					}
				}
				this.map[obj.x][obj.y].push(obj);
			} else {
				this.putInMap(obj);
			}
		} else {
			this.putInMap(obj);
		}
	}

	translateObject(obj, x, y) {
		let currX = obj.x << 0;
		let currY = obj.y << 0;
		obj.translate(x, y);
		if (obj.x << 0 != currX || obj.y << 0 != currY) {
			remove(this.map[currX][currY], obj);
			this.putInMap(obj);
		}
	}

	removeFromMap(obj) {
		remove(this.map[obj.x][obj.y], obj);
	}

	putInMap(obj) {
		if (!this.map[obj.x]) {
			this.map[obj.x] = {};
		}

		if (this.map[obj.x][obj.y]) {
			this.map[obj.x][obj.y].push(obj);
		} else {
			this.map[obj.x][obj.y] = [obj];
		}
	}
}

class UIButton {
	constructor(x, y, width, height, img, text, onClick) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.img = img;
		this.text = text;
		this.onClick = onClick;
	}
}

class Screen {
	constructor(canvas, context, x, y, width, height, level, camera, ui) {
		this.canvas = canvas;
		this.context = context;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.level = level;
		this.camera = camera;
		this.ui = ui;
	}

	resize(newWidth, newHeight, pageWidth, pageHeight) {
		if (this.canvas.width != Math.ceil(newWidth * pageWidth) || this.canvas.height != Math.ceil(newHeight * pageHeight)) {
			this.canvas.width = Math.ceil(newWidth * pageWidth);
			this.canvas.height = Math.ceil(newHeight * pageHeight);
			this.context = canvas.getContext('2d');
			this.effects = new ArrayBuffer(this.canvas.width * this.canvas.height * 4);
			this.camera.aspectRatio = this.canvas.width/this.canvas.height;
		}
		this.width = newWidth;
		this.height = newHeight;
	}

	checkForResize() {
		if (this.canvas.width != Math.ceil(this.width * window.innerWidth) || this.canvas.height != Math.ceil(this.height * window.innerHeight)) {
			this.canvas.width = Math.ceil(this.width * window.innerWidth);
			this.canvas.height = Math.ceil(this.height * window.innerHeight);
			this.context = this.canvas.getContext('2d');
			this.effects = new ArrayBuffer(this.canvas.width * this.canvas.height * 4);
			this.camera.aspectRatio = this.canvas.width/this.canvas.height;
		}
	}
}

class Game {
	constructor(screens, inputs) {
		this.screens = screens ? screens : [];
		this.inputs = inputs ? inputs : {};
	}
}

function loadSprite(sprite, tileSize) {
	if (!document.getElementById(sprite)) {
		return new Promise(function(resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', 'sprites/' + sprite);
			xhr.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					let img = new Image();
					img.onload = function() {
						let canvas = document.createElement('canvas');
						canvas.classList.add('spriteCanvas');
						canvas.id = sprite;
						canvas.width = tileSize;
						canvas.height = tileSize;
						document.head.appendChild(canvas);

						let context = canvas.getContext('2d');
						context.imageSmoothingEnabled = false;
						context.drawImage(img, 0, 0, tileSize, tileSize);
						resolve([sprite, canvas]);
					}
					img.src = 'sprites/' + sprite;
				}
			}
			xhr.send();
		});
	}
}

function loadLevel(level, func) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', 'levels/' + level);
		xhr.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				let levelColor;
				let tileSize;
				let objects = [];
				let promises = {};
				let levelText = this.responseText.split('\n');
				for (var i=0; i<levelText.length; i++) {
					let line = levelText[i].split(' ');
					switch (line[0]) {
						case 'color':
							levelColor = {'r': parseInt(line[1]), 'g': parseInt(line[2]), 'b': parseInt(line[3]), 'a': parseInt(line[4])};
							break;
						case 'tileSize':
							tileSize = parseInt(line[1]);
							break;
						case 't':
							let sprite = document.getElementById(line[1]);
							if (!sprite) {
								if (!promises[line[1]]) {
									promises[line[1]] = (loadSprite(line[1], tileSize));
								}
							} else if (!sprites[line[1]]) {
								sprites[line[1]] = sprite;
							}
							objects.push(new Tile(parseInt(line[2]), parseInt(line[3]), line[1], parseFloat(line[4])));
							break;
					}
				}

				Promise.all(Object.values(promises)).then(function(imageDati) {
					let sprites = {};
					for (var i in imageDati) {
						sprites[imageDati[i][0]] = [imageDati[i][1], parseInt(imageDati[i][0].split('_')[imageDati[i][0].split('_').length-1])];
					}

					resolve(new Level(levelColor, tileSize, objects, sprites));
				});
			}
		}
		xhr.send();
	}).then(function(values) {
		if (func) {func(values);}
	}, function() {
		throw ('Error loading level \"levels/' + level);
	});
}

function renderScreen(screen) {
	screen.checkForResize();

	let canvasWidth = screen.canvas.width;
	let canvasHeight = screen.canvas.height;
	let context = screen.context;
	let camera = screen.camera;
	let level = screen.level;
	let tileSize = level.tileSize * camera.zoomLevel;

	context.fillStyle = 'rgba(' + level.color['r'] + ', ' +
									level.color['g'] + ', ' +
									level.color['b'] + ', ' +
									level.color['a'] + ')';
	context.fillRect(0, 0, canvasWidth, canvasHeight);

	let minXPos = camera.x << 0;
	let maxXPos = camera.x + canvasWidth/tileSize << 0;
	let minYPos = camera.y << 0;
	let maxYPos = camera.y + canvasHeight/tileSize << 0;
	for (var i=minXPos; i<=maxXPos; i++) {
		if (level.map[i]) {
			for (var j=minYPos; j<=maxYPos; j++) {
				if (level.map[i][j]) {
					for (var k=0; k<level.map[i][j].length; k++) {
						let obj = level.map[i][j][k];
						let xPos = (obj.x - camera.x) * tileSize;
						let yPos = (obj.y - camera.y) * tileSize;

						let spriteData = level.sprites[obj.sprite];
						let sprite = spriteData[0];
						let animationFrames = spriteData[1];
						let frameSize = sprite.width / animationFrames;
						if (animationFrames > 0) {
							context.drawImage(sprite, (obj.animationFrame << 0) * frameSize, 0, frameSize, sprite.height, xPos, yPos, tileSize, tileSize);
							obj.animationFrame = (obj.animationFrame + obj.animationSpeed) % animationFrames;
						} else {
							context.drawImage(sprite, xPos, yPos, tileSize, tileSize);
						}
					}
				}
			}
		}
	}

	for (var i=0; i<screen.ui.length; i++) {
		let button = screen.ui[i];

		context.fillStyle = 'rgba(255, 255, 255, 1)';
		context.lineWidth = 3;
		context.beginPath();
		context.rect(button.x, button.y, button.width, button.height);
		context.stroke();
		context.fill();
		context.closePath();

		if (button.img) {
			context.drawImage(button.img, button.x, button.y, button.width, button.height);
		}

		context.fillStyle = 'rgba(0, 0, 0, 1)';
		context.fillText(button.text, button.x, button.y + 8);
	}
}

function gameLoop(game) {
	tick(game);
	for (var i=0; i<game.screens.length; i++) {
		renderScreen(game.screens[i]);
	}
	render(game);
	window.requestAnimationFrame(function() {gameLoop(game)});
}

function start(game) {
	window.requestAnimationFrame(function() {gameLoop(game);});
}

function launchExample() {
	let game = new Game();
	addKeyUpListener(game.inputs);
	addKeyDownListener(game.inputs);
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

		game.screens.push(new Screen(canvas, context, 0, 0, 1, 1, level, new Camera(0, 0, 0, canvas.width/canvas.height, 1), []));
		addMouseWheelListener(function(sign) {game.screens[0].camera.zoom(sign, game.screens[0].camera.x + (canvas.width/level.tileSize)/2, game.screens[0].camera.y + (canvas.height/level.tileSize)/2);});

		start(game);
	});
}