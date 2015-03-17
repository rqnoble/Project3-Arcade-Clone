"use strict";

var Cast = function() {
	console.log("Casting...");
};

// Enemies our player must avoid
var Enemy = function() {
    // the starting pixel for the roads
	this.rowPixel = [ 70, 150, 230 ];
	
	// how fast the enemies move across the screen
	this.speeds = [ 100, 150, 200, 250, 300, 350, 400, 450, 500];
	
	Cast.call(this);
	// starting position
	this.x = -100;  
	this.y = this.rowPixel[Math.floor((Math.random() * 3))];
	this.characterY = 75;
	// the width and height used for collision detection
	this.width = 90;
	this.height = 60;
	this.speed = this.speeds[Math.floor((Math.random() * 9))];

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

Enemy.prototype = Object.create(Cast.prototype);

Enemy.prototype.contructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	this.x = this.x + (this.speed * dt);
	
	// if the enemy moves off screen reset enemy position and speed
	if (this.x > 505) {
		this.x = -100;
		this.y = this.rowPixel[ Math.floor((Math.random() * 3)) ];
		this.speed = this.speeds[Math.floor((Math.random() * 9))];
	}
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
	// player starting position
	Cast.call(this);
	this.x = 200;
	this.y = 400;
	this.characterX = 15;
	this.characterY = 60;
	this.width = 60;
	this.height = 70;
	
	// the distance to move player
	this.moveColumn = 100;
	this.moveRow = 85;
	this.score = 0;
	this.lives = 4;
	this.highScore = 0;
	this.gameOverSprite = 'images/Rock.png';
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/char-cat-girl.png';
};

Player.prototype = Object.create(Cast.prototype);

Player.prototype.contructor = Player;

Player.prototype.update = function(){

	// If reach goal score points and restart player
	if ( this.y < 0 ) {
		this.restart();
		this.score = this.score + 100;
	} else if (this.y > 400 ) {  // this doesn't let player exit bottom of board
		this.y = 400;
		
		// if the player goes off the bottom of the screen this negates the subtracting of 10 points for going backwards
		this.score = this.score + 10;
	}

	// This won't let the player exit left or right side of board
	if ( this.x < 0 ) {
		this.x = this.x + 100;
	} else if ( this.x > 400 ) {
		this.x = this.x - 100;
	}

	// check if player has hit an enemy
	collide();
};

Player.prototype.render = function(){

	var image = new Image();

	if (this.lives == 0 ){
		image.src = this.gameOverSprite;
	}else{
		image.src = this.sprite;
	}
	ctx.drawImage(image, this.x, this.y );

	// render score
	ctx.font = "48px Comic";
	ctx.textBaseline = "hanging";
	ctx.fillStyle = "gold";
	ctx.fillText(this.score, 0, 542);
	ctx.strokeText(this.score, 0, 542);

	// render lives
	ctx.fillText("LIVES: " + this.getLives(), 310, 542);
	ctx.strokeText("LIVES: " + this.getLives(), 310, 542);
	
	// render highscore
	this.renderHighScore();

	// if no lives stay in gameover state
	if ( this.lives == 0) gameOver();

};

Player.prototype.renderHighScore = function(){

	// White rectangle to clear score drawing
	ctx.beginPath();
	ctx.strokeStyle = "white";
	ctx.fillStyle = "white";
	ctx.rect(0, 0, 300, 35);
	ctx.stroke();
	ctx.fill();
	// Render High Score
	ctx.font = "30px Comic";
	ctx.fillStyle = "black";
	ctx.strokeStyle = "black";
	ctx.fillText("high score: " + this.highScore, 0, 0);
	ctx.strokeText("high score: " + this.highScore, 0, 0);

};

Player.prototype.handleInput = function(e){

	if(this.lives > 0){
		if (e == 'up') {
			this.y = this.y - this.moveRow;
			this.score = this.score + 10;
		}else if (e == 'down') {
			this.y = this.y + this.moveRow;
			this.score = this.score - 10;
		}else if (e == 'right') {
			this.x = this.x + this.moveColumn;
		}else if (e == 'left') {
			this.x = this.x - this.moveColumn;
		}
	}else if (e == 'replay'){
		this.replay();
	}
};

// This function moves the player back to starting point
Player.prototype.restart = function(){
	this.x = 200;
	this.y = 400;
};

// Initializes for a new game
Player.prototype.replay = function(){
	this.restart();
	if (this.score > this.highScore) this.highScore = this.score;
	this.score = 0;
	this.lives = 4;
};

Player.prototype.getLives = function(){
	return this.lives;
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();
var allEnemies = [ new Enemy(), new Enemy(), new Enemy() ];

var collide = function(){

	var imgData;
	var hit = false;

	for (var i = 0; i < allEnemies.length; i++){

		// if any part of player is on an enemy hit will be true
		hit = ((player.x + player.characterX) > (allEnemies[i].x - allEnemies[i].width)) &&
			  ((player.x + player.characterX) < (allEnemies[i].x + allEnemies[i].width)) &&
			  ((player.y + player.characterY) > ((allEnemies[i].y + allEnemies[i].characterY ) - allEnemies[i].height)) &&
			  ((player.y + player.characterY) < ((allEnemies[i].y + allEnemies[i].characterY ) + allEnemies[i].height));

		if (hit) {
			player.restart();
			player.lives--;
			if ( player.lives <= 0 ){
				player.lives=0;
				//this.gameOver();
			}
		}

	}

};

var gameOver = function(){
		ctx.font = "48px Comic";
		ctx.textBaseline = "hanging";
		ctx.fillStyle = "gold";
		ctx.strokeText("GAME OVER", 10, 50);
		ctx.fillText("GAME OVER", 10, 50);
		ctx.font = "18px Comic";
		ctx.fillStyle = "White";
		ctx.fillText("HIT \"r\" TO PLAY AGAIN", 105, 100);
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
		82: 'replay'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
