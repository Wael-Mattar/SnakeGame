class Game {
  constructor() {
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.sprites = [];
    this.lives = 3;
    this.snake;
    this.won = false;
    this.lost = false;
    this.gameIntro = true;
    this.direction;
    this.move;
    this.win = new Audio("assets/wongame.wav");
    this.lose = new Audio("assets/losegame.mp3");
    this.bgMusic = new Audio("assets/bgmusic.mp3");
    this.pausedDirection = null;
    this.endTime = null;
    this.lostLife = false;
    this.lostLifeMessageEndTime = 0;

    var game = this;
    document.addEventListener("keydown", (e) => {
      if (e.keyCode === 37 && game.direction !== "right") {
        game.direction = "left";
      } else if (e.keyCode === 38 && game.direction !== "down") {
        game.direction = "up";
      } else if (e.keyCode === 39 && game.direction !== "left") {
        game.direction = "right";
      } else if (e.keyCode === 40 && game.direction !== "up") {
        game.direction = "down";
      } else if (e.keyCode === 80) {
        game.pausedDirection = game.direction; // remember the previous direction
        game.bgMusic.pause();
        game.direction = "pause";
        game.move = "pause";
      } else if (e.keyCode === 13) {
        game.direction = game.pausedDirection; // set direction to previous direction
        game.move = "continue";
      } else if (e.keyCode == 82) {
        game.bgMusic.currentTime = 0;
        game.bgMusic.play();
        game.endTime = null;
        game.snake.reset();
        game.snake.score = 0;
        game.lives = 3;
      }
    });

    this.bgReady = false;
    this.bgImage = new Image();
    this.bgImage.onload = () => {
      this.bgReady = true;
    };

    this.bgImage.src = "assets/bg4.jpg";
    this.bgWidth = this.canvas.width;
    this.bgHeight = this.canvas.height;
    this.duration = 1000 * 60 * 2; //2 minutes
    this.endTime = null;
    this.pauseTime = null;
  }

  update(modifier) {
    this.snake = this.sprites[0];
    if (this.move == "pause" && this.pauseTime == null)
      this.pauseTime = Date.now();
    if (
      this.move == "continue" &&
      this.pauseTime != null &&
      this.endTime != null
    ) {
      this.endTime += Date.now() - this.pauseTime;
      this.pauseTime = null;
    }
    if (this.move == "continue") {
      if (this.endTime == null) {
        this.endTime = Date.now() + this.duration;
        this.pauseTime = null;
      }
      for (var i = 0; i < this.sprites.length; i++)
        this.sprites[i].update(modifier, this.canvas, this.sprites);
      if (Date.now() > this.endTime) this.snake.loses = 3;
    }

    if (this.move == "continue") {
      this.gameIntro = false;
      this.won = false;
      this.lost = false;
    }
    if (this.snake.loses == 3) {
      this.snake.positionX = 27;
      this.snake.positionY = 81;
      this.snake.score = 0;
      this.snake.loses = 0;
      this.lost = true;
      this.bgMusic.pause();
      this.lose.play();
      this.move = "pause";
      this.lives = 3;
      this.snake.snakeParts = [];
      this.endTime = null;
      this.pauseTime = null;
    }
    if (this.snake.score == 10) {
      this.snake.positionX = 27;
      this.snake.positionY = 81;
      this.snake.score = 0;
      this.snake.loses = 0;
      this.won = true;
      this.bgMusic.pause();
      this.win.play();
      this.move = "pause";
      this.lives = 3;
      this.snake.snakeParts = [];
      this.endTime = null;
      this.pauseTime = null;
      this.snake.dx = this.snake.dy = 0;
    }
  }

  addSprites(pSprites) {
    this.sprites.push(pSprites);
  }

  removeSprites(pSprite) {
    var index = this.sprites.indexOf(pSprite);
    if (index > -1) {
      this.sprites.splice(index, 1);
    }
  }

  draw() {
    if (this.bgReady) {
      this.ctx.beginPath();
      this.ctx.drawImage(this.bgImage, 0, 0);
    }
    if (Date.now() < this.lostLifeMessageEndTime) {
      this.ctx.fillStyle = "red";
      this.ctx.textAlign = "center";
      this.ctx.font = "28px callibri";
      this.ctx.fillText("You Lost Life!", 270, 65);
    }

    for (var i = 0; i < this.sprites.length; i++)
      this.sprites[i].draw(this.ctx);

    if (this.endTime != null) {
      if (this.move == "continue") {
        this.minutes = Math.floor(
          (this.endTime - Date.now() + 1000) / (1000 * 60)
        );
        this.seconds = Math.ceil((this.endTime - Date.now()) / 1000) % 60;
      }
      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "top";
      this.ctx.font = "20px Arial";
      this.ctx.fillText(
        "Time Remaining: " +
          this.minutes.toString().padStart(2, "0") +
          ":" +
          this.seconds.toString().padStart(2, "0"),
        260,
        40
      );
      this.ctx.closePath();
    }
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(
      "Score Remaining to win: " + (10 - this.snake.score),
      260,
      15
    );

    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";
    this.ctx.font = "42px Arial";
    this.ctx.fillText(this.lives, 440, 18);

    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.font = "42px Arial";
    this.ctx.fillText(this.snake.score, 30, 18);

    if (this.gameIntro) {
      this.introMessage();
    }

    if (this.won) {
      this.wonMessage();
    }

    if (this.lost) {
      this.lostMessage();
    }
  }

  lostLifeMessage() {
    this.lostLifeMessageEndTime = Date.now() + 1500;
  }

  introMessage() {
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.font = "24px Arial";
    this.ctx.fillText("Welcome to our snake game!", this.canvas.width / 2, 90);
    this.ctx.fillText("Get ready to slither", this.canvas.width / 2, 120);
    this.ctx.fillText(
      "and slide your way to victory.",
      this.canvas.width / 2,
      160
    );
    this.ctx.font = "26px Arial";
    this.ctx.fillText(
      "Avoid hitting the obstacles!!",
      this.canvas.width / 2,
      200
    );
    this.ctx.font = "25px Arial";
    this.ctx.fillText(
      "Press enter when you lose life to move",
      this.canvas.width / 2,
      240
    );
    this.ctx.font = "25px Arial";
    this.ctx.font = "26px Arial";
    this.ctx.fillText("How to Play:", this.canvas.width / 2, 275);
    this.ctx.font = "23px Arial";
    this.ctx.fillText(
      "Right arrow: Right, Left arrow: Left",
      this.canvas.width / 2,
      310
    );
    this.ctx.font = "25px Arial";
    this.ctx.fillText(
      "Up arrow: Up, Down arrow: down",
      this.canvas.width / 2,
      345
    );
    this.ctx.font = "23px Arial";
    this.ctx.fillText(
      "P: Pause, Enter: Resume, R: Restart game",
      this.canvas.width / 2,
      380
    );

    this.ctx.font = "25px Arial";
    this.ctx.fillText(
      "Press Enter to start the game!",
      this.canvas.width / 2,
      430
    );
  }
  wonMessage() {
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.font = "70px Arial";
    this.ctx.fillText(
      "You Won!",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.font = "25px Arial";
    this.ctx.fillText(
      "Press enter to replay.",
      this.canvas.width / 2,
      this.canvas.height / 2 + 100
    );
  }

  lostMessage() {
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.font = "70px Arial";
    this.ctx.fillText(
      "Game Over!",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.font = "28px Arial";
    this.ctx.fillText(
      "Press enter to replay.",
      this.canvas.width / 2,
      this.canvas.height / 2 + 100
    );
  }
}

class Sprite {
  constructor() {}
  update(modifier, canvas) {}
  draw(ctx) {}
}

class Heart extends Sprite {
  constructor() {
    super();
    this.imageReady = false;
    this.image = new Image();
    this.image.onload = () => {
      this.imageReady = true;
    };
    this.image.src = "assets/heart.png";

    this.sy = 0;
    this.sw = 170;
    this.sh = 170;

    this.dx = 435;
    this.dy = -5;

    this.dw = 80;
    this.dh = 70;

    this.frame = 0;
    this.frameTotal = 5;
    this.lastUpdate = Date.now();
    this.timePerFrame = 150;
  }

  update() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.lastUpdate = Date.now();
      if (++this.frame >= this.frameTotal) this.frame = 0;
    }
  }

  draw(ctx) {
    // Draw the new frame of the heart sprite
    ctx.drawImage(
      this.image,
      this.frame * this.sw,
      this.sy,
      this.sw,
      this.sh,
      this.dx,
      this.dy,
      this.dw,
      this.dh
    );
  }
}

class Snake extends Sprite {
  constructor(positionX, positionY, myGame) {
    super();
    this.myGame = myGame;
    this.width = 27;
    this.positionX = positionX;
    this.positionY = positionY;
    this.height = 27;
    this.color = "white";
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.counter = 80;
    this.loses = 0;
    this.snakeParts = [];
    this.jump = new Audio("assets/jump.wav");
    this.bonus = new Audio("assets/bonus.wav");
    this.snakeLength = 1;
  }

  update(modifier, canvas, sprites) {
    this.counter++;
    this.positionX += this.dx;
    this.positionY += this.dy;

    if (this.positionY % 27 == 0 && this.positionX % 27 == 0) {
      if (this.snakeParts[0]) {
        this.snakeParts[0].nextDy = this.dy;
        this.snakeParts[0].nextDx = this.dx;
      }
      switch (this.myGame.direction) {
        case "left":
          this.dx = -1;
          this.dy = 0;
          break;
        case "right":
          this.dx = 1;
          this.dy = 0;
          break;
        case "up":
          this.dx = 0;
          this.dy = -1;
          break;
        case "down":
          this.dx = 0;
          this.dy = 1;
          break;
      }
      if (this.counter >= 70) {
        this.myGame.bgMusic.play();
        this.counter = 0;
      }
    }

    // Check collision with obstacles
    const obstacles = this.myGame.sprites.filter(
      (sprite) => sprite instanceof Obstacle
    );

    for (const obstacle of obstacles) {
      if (
        this.positionX >= obstacle.x - this.width &&
        this.positionX <= obstacle.x + obstacle.width &&
        this.positionY >= obstacle.y - this.height &&
        this.positionY <= obstacle.y + obstacle.height
      ) {
        // Calculate the position of the center of the obstacle
        const obstacleCenterX = obstacle.x + obstacle.width / 2;
        const obstacleCenterY = obstacle.y + obstacle.height / 2;

        // Determine which side of the obstacle the snake is approaching from
        const approachingFromLeft =
          this.positionX < obstacleCenterX && this.dx > 0;
        const approachingFromRight =
          this.positionX > obstacleCenterX && this.dx < 0;
        const approachingFromTop =
          this.positionY < obstacleCenterY && this.dy > 0;
        const approachingFromBottom =
          this.positionY > obstacleCenterY && this.dy < 0;

        // Change the snake direction opposite to the obstacle
        if (approachingFromLeft) {
          this.myGame.direction = "left";
          this.dx = -1;
          this.dy = 0;
        } else if (approachingFromRight) {
          this.myGame.direction = "right";
          this.dx = 1;
          this.dy = 0;
        } else if (approachingFromTop) {
          this.myGame.direction = "up";
          this.dx = 0;
          this.dy = -1;
        } else if (approachingFromBottom) {
          this.myGame.direction = "down";
          this.dx = 0;
          this.dy = 1;
        }

        // Reset the game score and snake body parts
        this.score = 0;
        this.snakeParts = [];
      }
    }

    //Colliding with the apple
    if (
      this.positionX == sprites[1].centerX &&
      this.positionY == sprites[1].centerY
    ) {
      this.bonus.play();
      this.score++;
      sprites[1].reset();
      this.snakeLength++;

      this.color = this.getRandomColor();

      // add new snake part
      const lastPart = this.snakeParts[this.snakeParts.length - 1];
      var newX, newY, dx, dy;
      if (!lastPart) {
        switch (this.myGame.direction) {
          case "left":
            newX = this.positionX + this.width;
            newY = this.positionY;
            dx = -1;
            dy = 0;
            break;
          case "right":
            newX = this.positionX - this.width;
            newY = this.positionY;
            dx = 1;
            dy = 0;
            break;
          case "up":
            newX = this.positionX;
            newY = this.positionY + this.height;
            dx = 0;
            dy = -1;
            break;
          case "down":
            newX = this.positionX;
            newY = this.positionY - this.height;
            dx = 0;
            dy = 1;
            break;
        }
      } else {
        if (lastPart.dx == -1 && lastPart.dy == 0) {
          newX = lastPart.positionX + lastPart.width;
          newY = lastPart.positionY;
          dx = -1;
          dy = 0;
        } else if (lastPart.dx == 1 && lastPart.dy == 0) {
          newX = lastPart.positionX - lastPart.width;
          newY = lastPart.positionY;
          dx = 1;
          dy = 0;
        } else if (lastPart.dx == 0 && lastPart.dy == -1) {
          newX = lastPart.positionX;
          newY = lastPart.positionY + lastPart.height;
          dx = 0;
          dy = -1;
        } else if (lastPart.dx == 0 && lastPart.dy == 1) {
          newX = lastPart.positionX;
          newY = lastPart.positionY - lastPart.height;
          dx = 0;
          dy = 1;
        }
      }
      if (this.counter >= 70) {
        this.jump.play();
        this.counter = 0;
      }
      const newPart = new SnakePart(newX, newY, dx, dy, this.myGame);
      if (lastPart) {
        lastPart.nextPart = newPart;
      }
      this.snakeParts.push(newPart);
    }

    for (var i = 0; i < this.snakeParts.length; i++)
      this.snakeParts[i].update(modifier, canvas);

    // Check collision with snake body parts
    if (this.checkCollisionWithBody()) {
      this.score = 0;
      this.snakeParts = [];
      this.myGame.lives--;
    }

    if (
      this.positionX < 27 ||
      this.positionX > 460 ||
      this.positionY < 81 ||
      this.positionY > 460
    ) {
      this.myGame.lostLife = true;
      this.myGame.lostLifeMessage();
      if (this.loses < 3) {
        this.myGame.lives--;
        this.loses++;
        this.myGame.move = "pause";
        this.reset();
      }
    }
  }

  checkCollisionWithBody() {
    for (let i = 0; i < this.snakeParts.length; i++) {
      const part = this.snakeParts[i];
      if (
        part.positionX === this.positionX &&
        part.positionY === this.positionY
      ) {
        return true;
      }
    }
    return false;
  }

  getRandomColor() {
    const letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  reset() {
    this.positionX = Math.round(Math.random() * (460 - 27) + 27);
    this.positionY = Math.round(Math.random() * (400 - 81) + 81);

    this.dx = 0;
    this.dy = 0;

    this.myGame.move = "pause";

    while (this.positionX % 27 != 0) {
      this.positionX -= 1;
    }

    while (this.positionY % 81 != 0) {
      this.positionY -= 1;
    }

    // Check collision with obstacles
    const obstacles = this.myGame.sprites.filter(
      (sprite) => sprite instanceof Obstacle
    );

    for (const obstacle of obstacles) {
      if (
        this.positionX >= obstacle.x - this.width &&
        this.positionX <= obstacle.x + obstacle.width &&
        this.positionY >= obstacle.y - this.height &&
        this.positionY <= obstacle.y + obstacle.height
      ) {
        this.reset();
      }
    }

    // reset the snake body
    this.snakeParts = [];
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.positionX, this.positionY, this.width, this.height);

    for (var part of this.snakeParts) {
      part.draw(ctx);
    }
  }
}

class SnakePart extends Sprite {
  constructor(x, y, dx, dy, myGame) {
    super();
    this.positionX = x;
    this.positionY = y;
    this.width = 27;
    this.height = 27;
    this.color = "white";
    this.myGame = myGame;
    this.dx = dx;
    this.dy = dy;
    this.nextDx = 0;
    this.nextDy = 0;
    this.nextPart = null;
  }

  update(modifier, canvas) {
    this.positionX += this.dx;
    this.positionY += this.dy;
    if (this.positionX % 27 == 0 && this.positionY % 27 == 0) {
      if (this.nextPart) {
        this.nextPart.nextDy = this.dy;
        this.nextPart.nextDx = this.dx;
      }
      this.dx = this.nextDx;
      this.dy = this.nextDy;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.positionX, this.positionY, this.width, this.height);
  }
}

class Apple extends Sprite {
  constructor(canvas, obstacles, snake) {
    super();
    this.canvas = canvas;
    this.obstacles = obstacles;
    this.centerX = Math.round(Math.random() * (460 - 27) + 27);
    this.centerY = Math.round(Math.random() * (400 - 81) + 81);
    this.snake = snake;

    while (this.centerX % 27 !== 0) this.centerX--;
    while (this.centerY % 81 !== 0) this.centerY--;

    this.appleImage = new Image();
    this.appleReady = false;
    this.appleImage.onload = () => {
      this.appleReady = true;
    };
    this.appleImage.src = "assets/apple.png";

    this.width = 29;
    this.height = 29;
    this.yOffset = 0;
    // add color properties
    this.color = "red";
    this.colorCounter = 0;
    this.colorChangeFrequency = 60;
  }

  reset(sprites) {
    let overlappingSnakePart = true;
    while (overlappingSnakePart) {
      this.centerX = Math.round(Math.random() * (460 - 27) + 27);
      this.centerY = Math.round(Math.random() * (400 - 81) + 81);

      while (this.centerX % 27 !== 0) this.centerX--;
      while (this.centerY % 81 !== 0) this.centerY--;

      overlappingSnakePart = false;

      for (var i = 0; i < this.snake.snakeParts.length; i++) {
        const part = this.snake.snakeParts[i];
        if (
          this.centerX + this.width >= part.positionX &&
          this.centerX <= part.positionX + part.width &&
          this.centerY + this.height >= part.positionY &&
          this.centerY <= part.positionY + part.height
        ) {
          overlappingSnakePart = true;
          break;
        }
      }
    }

    for (var i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      if (
        this.centerX + this.width >= obstacle.x &&
        this.centerX <= obstacle.x + obstacle.width &&
        this.centerY + this.height >= obstacle.y &&
        this.centerY <= obstacle.y + obstacle.height
      ) {
        this.reset();
      }
    }
  }

  update(modifier, canvas, sprites) {}

  draw(ctx) {
    if (this.appleReady) {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(
        this.centerX + this.width / 2,
        this.centerY + this.height / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.drawImage(
        this.appleImage,
        this.centerX,
        this.centerY + this.yOffset,
        this.width,
        this.height
      );
    }
  }
}

class Obstacle extends Sprite {
  constructor(x, y, width, height, imageUrl) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.obstacleImage = new Image();
    this.imageReady = false;
    this.obstacleImage.onload = () => {
      this.imageReady = true;
    };
    this.obstacleImage.src = "assets/rockk.png";
  }

  draw(ctx) {
    ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
  }

  update(modifier) {}
}

var obstacle = new Obstacle(150, 136, 54, 25, "green");
var obstacle2 = new Obstacle(370, 244, 54, 25, "green");
var obstacle3 = new Obstacle(315, 352, 54, 25, "green");
var obstacle4 = new Obstacle(115, 352, 54, 25, "green");
var obstacles = [obstacle, obstacle2, obstacle3, obstacle4];
var myGame = new Game();
var snake = new Snake(27, 81, myGame);
var apple = new Apple(myGame.canvas, obstacles, snake);
var heart = new Heart();

myGame.addSprites(snake);
myGame.addSprites(apple);
myGame.addSprites(obstacle);
myGame.addSprites(obstacle2);
myGame.addSprites(obstacle3);
myGame.addSprites(obstacle4);
myGame.addSprites(heart);

var requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

var then = Date.now();
function gameEngineLoop() {
  var now = Date.now();
  var delta = now - then;

  myGame.update(delta / 1000);
  myGame.draw();
  then = now;
  requestAnimFrame(gameEngineLoop);
}
gameEngineLoop();
