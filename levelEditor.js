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

function setComboRuleTileOrientation(tile, startComboSprite, level) {
	let spriteData = tile.sprite;

	let tile0 = level.getXYTile(tile.x + 1, tile.y);
	let tile1 = level.getXYTile(tile.x + 1, tile.y + 1);
	let tile2 = level.getXYTile(tile.x, tile.y + 1);
	let tile3 = level.getXYTile(tile.x - 1, tile.y + 1);
	let tile4 = level.getXYTile(tile.x - 1, tile.y);
	let tile5 = level.getXYTile(tile.x - 1, tile.y - 1);
	let tile6 = level.getXYTile(tile.x, tile.y - 1);
	let tile7 = level.getXYTile(tile.x + 1, tile.y - 1);

	let connected = [tile0?.sprite[0] == startComboSprite, tile1?.sprite[0] == startComboSprite, tile2?.sprite[0] == startComboSprite, tile3?.sprite[0] == startComboSprite,
						tile4?.sprite[0] == startComboSprite, tile5?.sprite[0] == startComboSprite, tile6?.sprite[0] == startComboSprite, tile7?.sprite[0] == startComboSprite];

	// Diagonals
	if (connected[1] && !connected[0] && !connected[2] && !connected[3] && !connected[4] && !connected[5] && !connected[6] && !connected[7]) {
		spriteData[1] = 2;
		spriteData[2] = 1;
	} else if (connected[3] && !connected[0] && !connected[1] && !connected[2] && !connected[4] && !connected[5] && !connected[6] && !connected[7]) {
		spriteData[1] = 3;
		spriteData[2] = 1;
	} else if (connected[5] && !connected[0] && !connected[1] && !connected[2] && !connected[3] && !connected[4] && !connected[6] && !connected[7]) {
		spriteData[1] = 3;
		spriteData[2] = 2;
	} else if (connected[7] && !connected[0] && !connected[1] && !connected[2] && !connected[3] && !connected[4] && !connected[5] && !connected[6]) {
		spriteData[1] = 2;
		spriteData[2] = 2;

	// Not Diagonals
	} else {
		let up = 0;
		let down = 0;
		let left = 0;
		let right = 0;
		right += connected[0] ? 1 : 0;
		right += connected[1] ? 0.25 : 0;
		down += connected[1] ? 0.25 : 0;
		down += connected[2] ? 1 : 0;
		down += connected[3] ? 0.25 : 0;
		left += connected[3] ? 0.25 : 0;
		left += connected[4] ? 1 : 0;
		left += connected[5] ? 0.25 : 0;
		up += connected[5] ? 0.25 : 0;
		up += connected[6] ? 1 : 0;
		up += connected[7] ? 0.25 : 0;
		right += connected[7] ? 0.25 : 0;

		// Straights
		if (right > 0 && down < 1 && left < 1 && up < 1) {
			spriteData[1] = 1;
			spriteData[2] = 1;
		} else if (down > 0 && right < 1 && left < 1 && up < 1) {
			spriteData[1] = 1;
			spriteData[2] = 2;
		} else if (left > 0 && right < 1 && down < 1 && up < 1) {
			spriteData[1] = 0;
			spriteData[2] = 1;
		} else if (up > 0 && right < 1 && down < 1 && left < 1) {
			spriteData[1] = 1;
			spriteData[2] = 0;

		// Corners
		} else if (right > 0.25 && down > 0.25) {
			spriteData[1] = 3;
			spriteData[2] = 0;
		} else if (down > 0.25 && left > 0.25) {
			spriteData[1] = 0;
			spriteData[2] = 2;
		} else if (left > 0.25 && up > 0.25) {
			spriteData[1] = 0;
			spriteData[2] = 0;
		} else if (up > 0.25 && right > 0.25) {
			spriteData[1] = 2;
			spriteData[2] = 0;
		}
	}
}

function checkComboRuleAtTiles(tile1, tile2, comboRules) {
	if (comboRules[tile1?.sprite[0] + tile2?.sprite[0]]) {
		return [tile1, tile2, comboRules[tile1?.sprite[0] + tile2?.sprite[0]]];
	} else if (comboRules[tile2?.sprite[0] + tile1?.sprite[0]]) {
		return [tile2, tile1, comboRules[tile2?.sprite[0] + tile1?.sprite[0]]];
	}

	let comboRuleValues = Object.values(comboRules);
	for (var i=0; i<comboRuleValues.length; i++) {
		if (tile1?.sprite[0] == comboRuleValues[i] && tile1?.sprite[0]?.split('_')[0].includes(tile2?.sprite[0]?.split('_')[0])) {
			return [tile2, tile1, comboRuleValues[i]];
		} else if (tile2?.sprite[0] == comboRuleValues[i] && tile2?.sprite[0]?.split('_')[0].includes(tile1?.sprite[0]?.split('_')[0])) {
			return [tile1, tile2, comboRuleValues[i]];
		}
	}

	return null;
}

function applyComboRule(tile1, tile2, comboRules, level) {
	if (tile1 && tile2) {
		let order = checkComboRuleAtTiles(tile1, tile2, comboRules);
		if (order) {
			order[1].sprite[0] = order[2];
			setComboRuleTileOrientation(order[1], order[0].sprite[0], level);
		}
	}
}

function launchLevelEditor() {
	let game = new Game();
	addInputs(game.inputs);
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

		let previewTile = new GameObject(0, 0, [undefined, 0, 0, 1], 0, 0);
		previewTile.opacity = 0.4;

		let comboRules = {};
		let savedTiles = [];
		let spriteButtons = [];
		let comboButtons = [];

		let buttons = [];
		let buttonsLength = 0;

		let comboRule1;
		let comboRule2;
		let comboRule3;

		function createSpriteButton(sprite) {
			return new UIButton(canvas.width - 148, 16 + 68 * (spriteButtons.length - 1), 64, 64, sprite, sprite.id, function(which) {
				if (which == 1) {
					buttons[0].img = this.img;
					previewTile.sprite[0] = this.img.id;

					if (parseInt(this.img.id.split('.')[this.img.id.split('.').length-2].split('_')[this.img.id.split('_').length-2]) > 1 ||
							parseInt(this.img.id.split('.')[this.img.id.split('.').length-2].split('_')[this.img.id.split('_').length-1]) > 1) {

						let data = window.prompt('x,y,width,height,frames,animation speed (in tiles and frames per tick)', '0,0,1,1,1,0');
						if (data) {
							data = data.split(',');
							previewTile.sprite[1] = (isNaN(parseInt(data[0]))) ? 0 : parseInt(data[0]);
							previewTile.sprite[2] = (isNaN(parseInt(data[1]))) ? 0 : parseInt(data[1]);
							previewTile.sprite[3] = (isNaN(parseInt(data[2]))) ? 1 : parseInt(data[2]);
							previewTile.sprite[4] = (isNaN(parseInt(data[3]))) ? 1 : parseInt(data[3]);
							previewTile.sprite[5] = (isNaN(parseInt(data[4]))) ? 1 : parseInt(data[4]);
							previewTile.animationSpeed = (isNaN(parseInt(data[5]))) ? 0 : parseInt(data[5]);
							previewTile.angle = 0;
						} else {
							previewTile.sprite[1] = 0;
							previewTile.sprite[2] = 0;
							previewTile.sprite[3] = 1;
							previewTile.sprite[4] = 1;
							previewTile.sprite[5] = 1;
							previewTile.animationSpeed = 0;
							previewTile.angle = 0;
						}
					} else {
						previewTile.sprite[1] = 0;
						previewTile.sprite[2] = 0;
						previewTile.sprite[3] = 1;
						previewTile.sprite[4] = 1;
						previewTile.sprite[5] = 1;
						previewTile.animationSpeed = 0;
						previewTile.angle = 0;
					}
				} else if (which == 3) {
					for (var i=getIndex(spriteButtons, this) + 1; i<spriteButtons.length; i++) {
						spriteButtons[i].y -= 68;
					}
					remove(spriteButtons, this);
					remove(buttons, this);
					spriteButtons[0].y -= 68;
				}
			});
		}

		function createComboRuleButton1() {
			return new UIButton(canvas.width - 368, 16 + 136 * Object.keys(comboRules).length, 64, 64, undefined, 'New Combo 1', function(which) {
				if (previewTile.sprite[0] && previewTile.sprite[0] != this.text && which == 1) {
					if (!this.myCombo2) {
						buttons.push(comboRule2);
						comboButtons.push(comboRule2);
						this.myCombo2 = comboRule2;
						comboRule2.myCombo1 = this;
					}

					let comboFinished = false;
					if (this.myCombo2?.myCombo3?.img && comboRules[this.text + this.myCombo2.text]) {
						comboFinished = true;
						delete comboRules[this.text + this.myCombo2.text];
					}

					this.text = previewTile.sprite[0];
					this.img = level.sprites[previewTile.sprite[0]];

					if (comboFinished) {
						comboRules[this.text + this.myCombo2.text] = this.myCombo2.myCombo3.text;
					}
				}
			});
		}

		function createComboRuleButton2() {
			return new UIButton(canvas.width - 300, 16 + 136 * Object.keys(comboRules).length, 64, 64, undefined, 'New Combo 2', function(which) {
				if (previewTile.sprite[0] && previewTile.sprite[0] != this.text && !(this.myCombo1 && this.myCombo1.text == previewTile.sprite[0]) && which == 1) {
					if (!this.myCombo3) {
						buttons.push(comboRule3);
						comboButtons.push(comboRule3);
						this.myCombo3 = comboRule3;
						comboRule3.myCombo2 = this;
					}

					let comboFinished = false;
					if (comboRules[this.myCombo1.text + this.text]) {
						comboFinished = true;
						delete comboRules[this.myCombo1.text + this.text];
					}

					this.text = previewTile.sprite[0];
					this.img = level.sprites[previewTile.sprite[0]];

					if (comboFinished) {
						comboRules[this.myCombo1.text + this.text] = this.myCombo3.text;
					}
				}
			});
		}

		function createComboRuleButton3() {
			return new UIButton(canvas.width - 334, 84 + 136 * Object.keys(comboRules).length, 64, 64, undefined, 'New Combo 3', function(which) {
				if (previewTile.sprite[0] && previewTile.sprite[0] != this.text && which == 1) {
					this.text = previewTile.sprite[0];
					this.img = level.sprites[previewTile.sprite[0]];

					comboRules[this.myCombo2.myCombo1.text + this.myCombo2.text] = this.myCombo2.myCombo3.text;

					comboRule1 = createComboRuleButton1();
					comboRule2 = createComboRuleButton2();
					comboRule3 = createComboRuleButton3();

					comboButtons.push(comboRule1);
					buttons.push(comboRule1);
				}
			});
		}

		comboRule1 = createComboRuleButton1();
		comboRule2 = createComboRuleButton2();
		comboRule3 = createComboRuleButton3();

		comboButtons.push(comboRule1);

		buttons.push(new UIButton(canvas.width - 80, 16, 64, 64, undefined, 'Tile', function(which) {
			if (which == 1) {
				if (!this.extended) {
					buttons.push(...comboButtons);

					for (var i=0; i<savedTiles.length; i++) {
						buttons.push(savedTiles[i]);
					}

					buttons.push(new UIButton(canvas.width - 216, 16 + 68 * savedTiles.length, 64, 64, undefined, 'Save Tile', function(which) {
						if (buttons[0].img && which == 1) {
							let ind = savedTiles.length;
							let me = this;
							let savedTileButton = new UIButton(canvas.width - 216, 16 + 68 * ind, 64, 64, level.sprites[previewTile.sprite[0]], previewTile.sprite[0], function(which) {
								if (which == 1) {
									buttons[0].img = this.img;
									previewTile.sprite[0] = this.img.id;
									previewTile.sprite[1] = this.spriteX;
									previewTile.sprite[2] = this.spriteY;
									previewTile.sprite[3] = this.spriteWidth;
									previewTile.sprite[4] = this.spriteHeight;
									previewTile.sprite[5] = this.frames;
									previewTile.animationSpeed = this.animationSpeed;
									previewTile.angle = this.angle;
								} else if (which == 3) {
									for (var i=getIndex(savedTiles, this) + 1; i<savedTiles.length; i++) {
										savedTiles[i].y -= 68;
									}
									remove(savedTiles, this);
									remove(buttons, this);
									me.y -= 68;
								}
							});
							savedTileButton.spriteX = previewTile.sprite[1];
							savedTileButton.spriteY = previewTile.sprite[2];
							savedTileButton.spriteWidth = previewTile.sprite[3];
							savedTileButton.spriteHeight = previewTile.sprite[4];
							savedTileButton.frames = previewTile.sprite[5];
							savedTileButton.animationSpeed = previewTile.animationSpeed;
							savedTileButton.angle = previewTile.angle;

							savedTiles.push(savedTileButton);
							buttons.push(savedTileButton);
							this.y += 68;
						}
					}));

					for (var i=0; i<spriteButtons.length; i++) {
						buttons.push(spriteButtons[i]);
					}

					this.extended = true;
				} else {
					buttons.length = buttonsLength;
					this.extended = false;
				}
			}
		}));

		let spriteCanvi = document.getElementsByClassName('spriteCanvas');
		spriteButtons.push(new UIButton(canvas.width - 148, 16 + 68 * spriteCanvi.length, 64, 64, undefined, 'New Sprite', function(which) {
			if (which == 1) {
				let input = document.getElementById('inputButton');
				let me = this;
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
						canvas.width = sizeX * level.tileSize;
						canvas.height = sizeY * level.tileSize;
						document.head.appendChild(canvas);

						let context = canvas.getContext('2d');
						context.imageSmoothingEnabled = false;
						context.drawImage(img, 0, 0, sizeX * level.tileSize, sizeY * level.tileSize);

						level.sprites[input.files[0].name] = canvas;
						buttons[0].img = canvas;
						previewTile.sprite[0] = canvas.id;

						if (sizeX > 1 || sizeY > 1) {
							let data = window.prompt('x,y,width,height,frames,animation speed (in tiles and frames per tick)', '0,0,1,1,1,0');
							if (data) {
								data = data.split(',');
								previewTile.sprite[1] = (isNaN(parseInt(data[0]))) ? 0 : parseInt(data[0]);
								previewTile.sprite[2] = (isNaN(parseInt(data[1]))) ? 0 : parseInt(data[1]);
								previewTile.sprite[3] = (isNaN(parseInt(data[2]))) ? 1 : parseInt(data[2]);
								previewTile.sprite[4] = (isNaN(parseInt(data[3]))) ? 1 : parseInt(data[3]);
								previewTile.sprite[5] = (isNaN(parseInt(data[4]))) ? 1 : parseInt(data[4]);
								previewTile.animationSpeed = (isNaN(parseInt(data[5]))) ? 0 : parseInt(data[5]);
								previewTile.angle = 0;
							} else {
								previewTile.sprite[1] = 0;
								previewTile.sprite[2] = 0;
								previewTile.sprite[3] = 1;
								previewTile.sprite[4] = 1;
								previewTile.sprite[5] = 1;
								previewTile.animationSpeed = 0;
								previewTile.angle = 0;
							}
						} else {
							previewTile.sprite[1] = 0;
							previewTile.sprite[2] = 0;
							previewTile.sprite[3] = 1;
							previewTile.sprite[4] = 1;
							previewTile.sprite[5] = 1;
							previewTile.animationSpeed = 0;
							previewTile.angle = 0;
						}

						let newSpriteButton = createSpriteButton(canvas);
						spriteButtons.push(newSpriteButton);
						if (buttons.length != buttonsLength) {buttons.push(newSpriteButton);}
						me.y += 68;
					}
					img.src = URL.createObjectURL(input.files[0]);
					input.removeEventListener('change', onUpload);
				};
				input.addEventListener('change', onUpload);
				input.click();
			}
		}));

		for (var i=0; i<spriteCanvi.length; i++) {
			spriteButtons.push(createSpriteButton(spriteCanvi[i]));
		}

		buttons.push(new UIButton(canvas.width - 80, canvas.height - 80, 64, 64, undefined, 'Print Level', function(which) {
			if (which == 1) {
				console.log(level.toString());
			}
		}));

		buttonsLength = buttons.length;

		let dragging = [false, false, false, false];
		let lastPos = [0, 0];
		addMouseDownListener(function(which, x, y) {
			let hitButton = false;
			let tileX = x / (level.tileSize * game.screens[0].camera.zoomLevel) + game.screens[0].camera.x << 0;
			let tileY = y / (level.tileSize * game.screens[0].camera.zoomLevel) + game.screens[0].camera.y << 0;
			if (which == 1) {
				for (var i=0; i<game.screens[0].ui.length; i++) {
					let button = game.screens[0].ui[i];

					if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
						hitButton = true;
						button.onClick(which);
						break;
					}
				}

				if (!hitButton && game.screens[0].ui[0].img) {
					dragging[1] = true;
					lastPos[0] = tileX;
					lastPos[1] = tileY;
					let newTile = new Tile(tileX, tileY, copyArray(previewTile.sprite), previewTile.angle, previewTile.animationSpeed);
					level.addObject(newTile);

					let tile0 = level.getXYTile(tileX + 1, tileY);
					let tile1 = level.getXYTile(tileX + 1, tileY + 1);
					let tile2 = level.getXYTile(tileX, tileY + 1);
					let tile3 = level.getXYTile(tileX - 1, tileY + 1);
					let tile4 = level.getXYTile(tileX - 1, tileY);
					let tile5 = level.getXYTile(tileX - 1, tileY - 1);
					let tile6 = level.getXYTile(tileX, tileY - 1);
					let tile7 = level.getXYTile(tileX + 1, tileY - 1);

					applyComboRule(newTile, tile0, comboRules, level);
					applyComboRule(newTile, tile1, comboRules, level);
					applyComboRule(newTile, tile2, comboRules, level);
					applyComboRule(newTile, tile3, comboRules, level);
					applyComboRule(newTile, tile4, comboRules, level);
					applyComboRule(newTile, tile5, comboRules, level);
					applyComboRule(newTile, tile6, comboRules, level);
					applyComboRule(newTile, tile7, comboRules, level);
				}
			} else if (which == 3) {
				for (var i=0; i<game.screens[0].ui.length; i++) {
					let button = game.screens[0].ui[i];

					if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
						hitButton = true;
						button.onClick(which);
						break;
					}
				}

				if (!hitButton && level.map[tileX] && level.map[tileX][tileY]) {
					dragging[3] = true;
					lastPos[0] = tileX;
					lastPos[1] = tileY;
					if (level.map[tileX] && level.map[tileX][tileY]) {
						let objects = level.map[tileX][tileY];
						let toBeRemoved = objects[objects.length-1];
						if (toBeRemoved == previewTile) {
							if (objects.length > 1) {
								level.removeFromMap(objects[objects.length-2]);
							}
						} else {
							level.removeFromMap(toBeRemoved);
						}
					}
				}
			}
		});

		addMouseUpListener(function(which, x, y) {
			dragging[which] = false;
		});

		game.screens.push(new Screen(canvas, context, 0, 0, 1, 1, level, new Camera(0, 0, 0, canvas.width/canvas.height, 1), buttons));
		addMouseWheelListener(function(sign) {game.screens[0].camera.zoom(sign, game.screens[0].camera.x + (canvas.width/level.tileSize)/2, game.screens[0].camera.y + (canvas.height/level.tileSize)/2);});

		addMouseMoveListener(function(x, y) {
			let tileX = x / (level.tileSize * game.screens[0].camera.zoomLevel) + game.screens[0].camera.x << 0;
			let tileY = y / (level.tileSize * game.screens[0].camera.zoomLevel) + game.screens[0].camera.y << 0;
			if (game.screens[0].ui[0].img) {
				level.removeFromMap(previewTile);
				previewTile.x = tileX;
				previewTile.y = tileY;
				level.addObject(previewTile);
			}

			if (dragging[1] && (lastPos[0] != tileX || lastPos[1] != tileY)) {
				lastPos[0] = tileX;
				lastPos[1] = tileY;

				let newTile = new Tile(tileX, tileY, copyArray(previewTile.sprite), previewTile.angle, previewTile.animationSpeed);
				level.addObject(newTile);

				let tile0 = level.getXYTile(tileX + 1, tileY);
				let tile1 = level.getXYTile(tileX + 1, tileY + 1);
				let tile2 = level.getXYTile(tileX, tileY + 1);
				let tile3 = level.getXYTile(tileX - 1, tileY + 1);
				let tile4 = level.getXYTile(tileX - 1, tileY);
				let tile5 = level.getXYTile(tileX - 1, tileY - 1);
				let tile6 = level.getXYTile(tileX, tileY - 1);
				let tile7 = level.getXYTile(tileX + 1, tileY - 1);

				applyComboRule(newTile, tile0, comboRules, level);
				applyComboRule(newTile, tile1, comboRules, level);
				applyComboRule(newTile, tile2, comboRules, level);
				applyComboRule(newTile, tile3, comboRules, level);
				applyComboRule(newTile, tile4, comboRules, level);
				applyComboRule(newTile, tile5, comboRules, level);
				applyComboRule(newTile, tile6, comboRules, level);
				applyComboRule(newTile, tile7, comboRules, level);
			} else if (dragging[3] && (lastPos[0] != tileX || lastPos[1] != tileY)) {
				lastPos[0] = tileX;
				lastPos[1] = tileY;

				if (level.map[tileX] && level.map[tileX][tileY]) {
					let objects = level.map[tileX][tileY];
					let toBeRemoved = objects[objects.length-1];
					if (toBeRemoved == previewTile) {
						if (objects.length > 1) {
							level.removeFromMap(objects[objects.length-2]);
						}
					} else {
						level.removeFromMap(toBeRemoved);
					}
				}
			}
		});

		addKeyDownListener(function(key) {
			if (key == 'KeyR') {
				previewTile.angle = (previewTile.angle + 90) % 360;
			} else if (key.substring(0, 5) == 'Digit') {
				let num = parseInt(key[5]) - 1;
				if (savedTiles[num]) {
					savedTiles[num].onClick(1);
				}
			}
		});

		start(game);
	});
}

launchLevelEditor();