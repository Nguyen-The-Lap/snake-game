const canvas = document.getElementById("gameCanvas");
const scoreDiv = document.getElementById("score");
const gameOverDiv = document.getElementById("gameOver");
const globalMaxDiv = document.getElementById("globalMaxScore");
const helpButton = document.getElementById("helpButton");
const helpModal = document.getElementById("helpModal");
const helpCloseButton = document.getElementById("helpCloseButton");
const startGameButton = document.getElementById("startGameButton");
const mainMenu = document.getElementById("mainMenu");
const gameContainer = document.getElementById("gameContainer");
const pauseMenu = document.getElementById("pauseMenu");
const resumeButton = document.getElementById("resumeButton");
const quitButton = document.getElementById("quitButton");
const shopButton = document.getElementById("shopButton");
const shopModal = document.getElementById("shopModal");
const shopCloseButton = document.getElementById("shopCloseButton");
const equipButtons = document.querySelectorAll(".equipButton");

/*---------------------------
  Lớp quản lý game Snake
----------------------------*/
class SnakeGame {
  constructor({ canvas, scoreDiv, gameOverDiv, globalMaxDiv, mainMenu, gameContainer, pauseMenu }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scoreDiv = scoreDiv;
    this.gameOverDiv = gameOverDiv;
    this.globalMaxDiv = globalMaxDiv;
    this.mainMenu = mainMenu;
    this.gameContainer = gameContainer;
    this.pauseMenu = pauseMenu;

    this.gridSize = 20;
    this.tileCount = canvas.width / this.gridSize;
    this.snake = [];
    this.food = {};
    this.direction = { x: 1, y: 0 };
    this.gameInterval = null;
    this.score = 0;
    this.globalMaxScore = 0;
    this.gameSpeed = 100;
    this.paused = false;
    this.snakeColor = "#0f0";
  }

  init() {
    this.snake = [];
    const initialX = Math.floor(this.tileCount / 2);
    const initialY = Math.floor(this.tileCount / 2);
    for (let i = 0; i < 5; i++) {
      this.snake.push({ x: initialX - i, y: initialY });
    }
    this.direction = { x: 1, y: 0 };
    this.score = 0;
    this.paused = false;
    this.updateScore();
    this.gameOverDiv.classList.remove("visible");
    this.pauseMenu.classList.remove("visible");
    this.placeFood();

    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => this.gameLoop(), this.gameSpeed);
  }

  gameLoop() {
    this.updateGame();
    this.drawGame();
  }

  updateGame() {
    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    if (
      newHead.x < 0 ||
      newHead.x >= this.tileCount ||
      newHead.y < 0 ||
      newHead.y >= this.tileCount
    ) {
      this.endGame();
      return;
    }

    if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      this.endGame();
      return;
    }

    this.snake.unshift(newHead);

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score++;
      this.updateScore();
      if (this.score > this.globalMaxScore) {
        this.globalMaxScore = this.score;
        this.updateGlobalMax();
      }
      this.placeFood();
    } else {
      this.snake.pop();
    }
  }

  drawGame() {
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = this.snakeColor;
    this.snake.forEach(segment => {
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });

    this.ctx.fillStyle = "#f00";
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }

  updateScore() {
    this.scoreDiv.textContent = "Score: " + this.score;
  }

  updateGlobalMax() {
    this.globalMaxDiv.textContent = "Max Score: " + this.globalMaxScore;
  }

  placeFood() {
    let valid = false;
    while (!valid) {
      const newFood = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
      valid = !this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (valid) this.food = newFood;
    }
  }

  endGame() {
    clearInterval(this.gameInterval);
    this.gameOverDiv.classList.add("visible");
  }

  pauseGame() {
    if (this.paused) return;
    this.paused = true;
    clearInterval(this.gameInterval);
    this.pauseMenu.classList.add("visible");
  }

  resumeGame() {
    if (!this.paused) return;
    this.paused = false;
    this.pauseMenu.classList.remove("visible");
    this.gameInterval = setInterval(() => this.gameLoop(), this.gameSpeed);
  }

  quitGame() {
    this.paused = false;
    clearInterval(this.gameInterval);
    this.pauseMenu.classList.remove("visible");
    this.gameContainer.style.display = "none";
    this.mainMenu.style.display = "flex";
  }
}

const snakeGame = new SnakeGame({
  canvas,
  scoreDiv,
  gameOverDiv,
  globalMaxDiv,
  mainMenu,
  gameContainer,
  pauseMenu
});

document.addEventListener("keydown", event => {
  if (gameOverDiv.classList.contains("visible")) {
    snakeGame.init();
    return;
  }
  
  if (event.key === "Escape") {
    if (!snakeGame.paused) {
      snakeGame.pauseGame();
    } else {
      snakeGame.resumeGame();
    }
    return;
  }
  
  if (snakeGame.paused) return;
  
  const key = event.key.toLowerCase();
  switch (key) {
    case "arrowup":
    case "w":
      if (snakeGame.direction.y === 1) break;
      snakeGame.direction = { x: 0, y: -1 };
      break;
    case "arrowdown":
    case "s":
      if (snakeGame.direction.y === -1) break;
      snakeGame.direction = { x: 0, y: 1 };
      break;
    case "arrowleft":
    case "a":
      if (snakeGame.direction.x === 1) break;
      snakeGame.direction = { x: -1, y: 0 };
      break;
    case "arrowright":
    case "d":
      if (snakeGame.direction.x === -1) break;
      snakeGame.direction = { x: 1, y: 0 };
      break;
    default:
      break;
  }
});

function setupModal(modal, closeButton) {
  closeButton.addEventListener("click", () => modal.classList.remove("visible"));
  modal.addEventListener("click", event => {
    if (event.target === modal) modal.classList.remove("visible");
  });
}

setupModal(helpModal, helpCloseButton);
setupModal(shopModal, shopCloseButton);

helpButton.addEventListener("click", () => {
  helpModal.classList.add("visible");
});

shopButton.addEventListener("click", () => {
  shopModal.classList.add("visible");
});

startGameButton.addEventListener("click", () => {
  const difficulty = document.getElementById("difficultySelect").value;
  switch (difficulty) {
    case "easy":
      snakeGame.gameSpeed = 150;
      break;
    case "normal":
      snakeGame.gameSpeed = 100;
      break;
    case "hard":
      snakeGame.gameSpeed = 70;
      break;
    case "extreme":
      snakeGame.gameSpeed = 50;
      break;
    default:
      snakeGame.gameSpeed = 100;
  }
  mainMenu.style.display = "none";
  gameContainer.style.display = "block";
  snakeGame.init();
});

resumeButton.addEventListener("click", () => snakeGame.resumeGame());
quitButton.addEventListener("click", () => snakeGame.quitGame());

equipButtons.forEach(button => {
  button.addEventListener("click", () => {
    const newColor = button.getAttribute("data-color");
    snakeGame.snakeColor = newColor;
    shopModal.classList.remove("visible");
  });
});