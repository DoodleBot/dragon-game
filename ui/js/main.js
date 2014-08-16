var attackFactory, attackArray, dragonArray, goodDragon, badDragon, stageHeight, stageWidth, keysDown, shotTimeoutID;

function DragonFactory() {
	this.createDragon = function(type) {
		var dragon;

		if(type === 'rock-good') {
			dragon = new DragonRockGood();
		} else if(type === 'rock-bad') {
			dragon = new DragonRockBad();
		} else {
			return;
		}

		dragon.type = type;
		getView(dragon, 0);
		setDimensions(dragon);
		moveToStart(dragon, dragon.startPosition.x, dragon.startPosition.y);
		dragon.$ = $(dragon.selector).eq(0);

		return dragon;
	}
}

function AttackFactory() {
	this.createAttack = function(dragon) {
		var attack, x, y, $dragon;

		$dragon = $(dragon.selector);

		if(dragon.attackType === 'rock') {
			attack = new AttackRock();
		} else {
			return;
		}

		attack.type = dragon.attackType;
		attack.speed *= dragon.attackDirection;
		attack.shooter = dragon;

		//add to attack array.
		attackArray.push(attack);

		// attack.$ = $('#game').append('<div class="attack ' + attack.type + '"></div>');
		attack.$ = $('<div class="attack ' + attack.type + '"></div>');
		attack.$.appendTo('#game');

		getView(attack, attackArray.length - 1);
		setDimensions(attack);
		x = parseInt($dragon.position().left, 10) + dragon.mouthPosition.x;
		y = parseInt($dragon.position().top, 10) + dragon.mouthPosition.y;
		moveToStart(attack, x, y);
		return attack;
	}
}

function HealthBarFactory() {
	this.createHealthBar = function(dragon) {
		var healthBar;
		healthBar = new HealthBar();
		dragon.healthBar = healthBar;

		$dragon = $(dragon.selector);

		healthBar.$ = healthBar.view = $('<div class="health-bar"></div>');
		healthBar.$.appendTo('#game');

		x = dragon.startPosition.x;
		y = 20;
		moveToStart(healthBar, x, y);
		return healthBar;
	}
}

var DragonRockGood = function() {
	this.name = 'Rocky';
	this.selector = '.dragon.rock-good';
	this.startPosition = {
		x: 20,
		y: 50
	};
	this.mouthPosition = {
		x: 265,
		y: 225
	};
	this.attackType = 'rock';
	this.attackDirection = 1;
	this.coolDown = 1200; // milliseconds
	this.canShoot = true;
	this.shields = 25;
	this.health = 50;
	this.level = 1;
	this.speed = 3;
}

var DragonRockBad = function() {
	this.name = 'Bolder';
	this.selector = '.dragon.rock-bad';
	this.startPosition = {
		x: 900,
		y: 100
	};
	this.mouthPosition = {
		x: 30,
		y: 130
	};
	this.attackType = 'rock';
	this.attackDirection = -1;
	this.coolDown = 1200; // milliseconds
	this.canShoot = true;
	this.shields = 25;
	this.health = 50;
	this.level = 1;
	this.speed = 3;
}

var AttackRock = function() {
	this.name = 'rock';
	this.selector = '.attack.rock';
	this.damage = 5;
	this.speed = 4;
}

var HealthBar = function() {

}

/*
 * finds the target element
 * @param {object} the target to find
 * @return {undefined}
 */
function getView(target, index) {
	var selector = target.selector;
	target.view = $(selector).eq(index);
}

/*
 * move the target its starting position
 * @param {object} the target to find
 * @return {undefined}
 */
function moveToStart(target, x, y) {
	var view = target.view;
	view.css('left', x + 'px').css('top', y + 'px');
}

/*
 * records the width and height of the target based on the view
 * @param {object} the target to use
 * @return {undefined}
 */
function setDimensions(target) {
	var view = target.view;
	target.height = view.height();
	target.width = view.width();
}

/*
 *
 */
function keyDown(key) {
	keysDown[key] = true;
}

/*
 *
 */
function keyUp(key) {
	keysDown[key] = false;
}

/*
 *
 */
function moveDragon(dragon, direction) {
	// console.log('moveDragon');
	var $dragon, currentY, newY;

	$dragon = dragon.view;
	currentY = parseInt($dragon.css('top'), 10);

	if(direction === 'up') {
		// console.log('move dragon up');
		newY = currentY - dragon.speed;
		if(newY < 0) {
			newY = 0;
		}
	} else if(direction === 'down') {
		newY = currentY + dragon.speed;
		if(newY > stageHeight - dragon.height) {
			newY = stageHeight - dragon.height;
		}
	}
	// console.log('$dragon: ' + $dragon);
	// console.log('currentY: ' + currentY);
	if(newY) {
		$dragon.css('top', newY + 'px');
	}
}

/*
 *
 * @param (attackObject)
 * @param (number)
 */
function moveAttack(attack, index) {
	var $attack, currentX, newX, rightBoundry, leftBoundry;
	$attack = attack.$;//$(attack.selector).eq(index);
	console.log($attack.position().left);
	currentX = parseInt($attack.position().left, 10);
	newX = currentX + attack.speed;
	$attack.css('left', newX);

	// destroy the attack if it goes outside of the stage.
	rightBoundry = stageWidth - attack.width;
	leftBoundry = 0;
	if(newX > rightBoundry || newX < leftBoundry) {
		$attack.remove();
		attackArray.splice(index, 1);
	}
}

/*
 * returns if $thing1 intersects with $thing2
 * @param (jquery obj) 
 * @param (jquery obj) 
 * @return (boolean)
 */
function detectHit($thing1, $thing2) {
	var thing1X = parseInt($thing1.position().left, 10);
	var thing1Y = parseInt($thing1.position().top, 10);
	var thing1Width = $thing1.width();
	var thing1Height = $thing1.height();
	var thing2X = parseInt($thing2.position().left, 10);
	var thing2Y = parseInt($thing2.position().top, 10);
	var thing2Width = $thing2.width();
	var thing2Height = $thing2.height();
	var points = [];
	var i;

	points[0] = [
		{
			x: thing1X,
			y: thing1Y
		},
		{
			x: thing1X + thing1Width,
			y: thing1Y
		},
		{
			x: thing1X,
			y: thing1Y + thing1Height
		},
		{
			x: thing1X + thing1Width,
			y: thing1Y + thing1Height
		}
	];

	points[1] = [
		{
			x: thing2X,
			y: thing2Y
		},
		// {
		// 	x: thing2X + thing2Width,
		// 	y: thing2Y
		// },
		// {
		// 	x: thing2X,
		// 	y: thing2Y + thing2Height
		// },
		{
			x: thing2X + thing2Width,
			y: thing2Y + thing2Height
		}
	];

	// check if any of thing1 points are in thing2 bounds
	for(i = 0; i < points[0].length; i++) {
		if(points[0][i].x > points[1][0].x && points[0][i].x < points[1][1].x && points[0][i].y > points[1][0].y && points[0][i].y < points[1][1].y) {
			console.log('HIT DETECTED!');
			return true;
		}
	}

	return false;
}

function attackHit(attack, index, target) {
	// remove the attack from the attackArray and from screen
	attack.$.remove();
	attackArray.splice(index, 1);
	// add damage to the target
	target.health -= attack.damage;
	console.log(target.name + ' got hit and took ' + attack.damage + ' damage! It\'s health is now ' + target.health);
	// show damage graphic
}

/*
 *
 */
function shoot(dragon) {
	var type = dragon.attackType;
	var direction = dragon.attackDirection;

	//if dragon can't shoot, end.
	if(!dragon.canShoot) {
		return;
	}
	// else, get dragon, attack direction, attack type. Then create attack
	attackFactory.createAttack(dragon);
	// set dragon cooldown timer.
	dragon.canShoot = false;
	shotTimeoutID = window.setTimeout(function() {
		dragon.canShoot = true;
	}, dragon.coolDown);
}

function gameLoop() {
	var i, ii, hit;

	// UP ARROW KEY DETECTION
	if(keysDown.up) {
		moveDragon(goodDragon, 'up');
	} else if(keysDown.down) {
		moveDragon(goodDragon, 'down')
	}

	// RIGHT ARROW KEY DETECTION
	if(keysDown.right) {
		shoot(goodDragon);
	}

	// UPDATE ALL ATTACKS
	for(i = attackArray.length - 1; i >= 0; i--) {
		moveAttack(attackArray[i], i);
	}

	// DETECT SHIELD HITS
	// for(i = attackArray.length - 1; i >= 0; i--) {
		// loop through shields.
		// detectHit(attackArray[i].$, SHIELD);
	// }

	// DETECT DRAGON HITS
	for(i = attackArray.length - 1; i >= 0; i--) {
		for(ii = 0; ii < dragonArray.length; ii++) {
			if(attackArray[i].shooter === dragonArray[ii]) {
				continue;
			} else {
				hit = detectHit(attackArray[i].$, dragonArray[ii].$);
				if(hit) {
					attackHit(attackArray[i], i, dragonArray[ii]);
				}
			}
		}
	}





	////////////////////


	// need a list of all dragons that are effected by this attack.
	// 
	// for(i = 0; i < dragonArray.length; i++) {
		// only detect for target dragons
		// if(attack.shooter === dragonArray[i]) {
		// 	continue;
		// } else {
			// lookup points for attack
			// lookup points for dragon
	// 	}
	// }

	

	// if hit detected,
		// update health bar
		// see if dragon is dead
	// else no hit detected



	/////////////////////




	requestAnimationFrame(gameLoop);
}

init = function() {
	var dragonFactory, keyCode, w, a, s, d, up, down, left, right;

	dragonFactory = new DragonFactory();
	attackFactory = new AttackFactory();
	healthBarFactory = new HealthBarFactory();

	stageWidth = $('#game').width();
	stageHeight = $('#game').height();
	keysDown = {
		up: false,
		down: false,
		right: false
	}
	attackArray = [];
	w = 87;
	a = 65;
	s = 83;
	d = 68;
	up = 38;
	down = 40;
	left = 37;
	right = 39;

	goodDragon = dragonFactory.createDragon('rock-good');
	badDragon = dragonFactory.createDragon('rock-bad');
	dragonArray = [goodDragon, badDragon];

	healthBarFactory.createHealthBar(goodDragon);
	healthBarFactory.createHealthBar(badDragon);


	$(document).on('keydown', function(event) {
		keyCode = event.keyCode;

		if(keyCode === up || keyCode === w) {
			keyDown('up');
		} else if(keyCode === down || keyCode === s) {
			keyDown('down');
		} else if(keyCode === right || keyCode === d) {
			keyDown('right');
		}
	});

	$(document).on('keyup', function(event) {
		keyCode = event.keyCode;
		if(keyCode === up || keyCode === w) {
			keyUp('up');
		} else if(keyCode === down || keyCode === s) {
			keyUp('down');
		} else if(keyCode === right || keyCode === d) {
			keyUp('right');
		}
	});

	gameLoop();

	console.log("good dragon's name: " + goodDragon.name);
	console.log("bad dragon's name: " + badDragon.name);
}

init();