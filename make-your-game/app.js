document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", control);
    document.addEventListener("keyup", controlRotate);
    let main = document.querySelector(".main");
    const scoreElem = document.getElementById("score");
    const levelElem = document.getElementById("level");
    const nextTetroElem = document.getElementById("next-tetro");
    const btnStart = document.getElementById("start");
    const btnPause = document.getElementById("pause");
    const btnRestart = document.getElementById("restart");
    const btnGameOverRestart = document.getElementById("game-over-restart");
    const gameOver = document.getElementById("game-over");
    const lifeLost = document.getElementById("life-lost");
    const btnLifeLostContinue = document.getElementById("life-lost-continue");
    const livesElem = document.getElementById("lives");
    const timeElement = document.getElementById('time');
    let playfield = Array.from({ length: 20 }, () => Array(10).fill(0));
    let score = 0;
    let currentLevel = 1;
    let isPaused = true;
    let pausedTime = 0;
    let pauseStart;
    let startTime;
    let lives = 3
    let possibleLevels = {
      1: {
        scorePerLine: 10,
        nextLevelScore: 100,
      },
      2: {
        scorePerLine: 15,
        nextLevelScore: 200,
      },
      3: {
        scorePerLine: 20,
        nextLevelScore: 500,
      },
      4: {
        scorePerLine: 30,
        nextLevelScore: 1000,
      },
      5: {
        scorePerLine: 40,
        nextLevelScore: 2000,
      },
      6: {
        scorePerLine: 50,
        nextLevelScore: 5000,
      },
      7: {
        scorePerLine: 60,
        nextLevelScore: Infinity,
      },
    };
    // Tetromino logic
    const oTetromino = [
      [1, 1],
      [1, 1],
    ];
    const iTetromino = [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const sTetromino = [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ];
    const zTetromino = [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ];
    const lTetromino = [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ];
    const jTetromino = [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ];
    const tTetromino = [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ];
    const theTetrominoes = [
      oTetromino,
      iTetromino,
      sTetromino,
      zTetromino,
      lTetromino,
      jTetromino,
      tTetromino,
    ];
    // Tetromino colors
    const colors = [
      "oTetromino",
      "iTetromino",
      "sTetromino",
      "zTetromino",
      "lTetromino",
      "jTetromino",
      "tTetromino",
    ];
    // Request animation frame settings
    let gameOverFlag = false;
    let animationId = null;
    let lastTime = 0; // Initialize lastTime
    let dropInterval = 1000; // Initial drop interval in milliseconds
    // Init tetros
    let activeTetro = getNewTetro();
    let nextTetro = getNewTetro();
    function draw() {
      let mainInnerHTML = "";
      for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
          if (playfield[y][x] === 1) {
            mainInnerHTML += `<div class="cell ${activeTetro.color}"></div>`;
            // Stuck
          } else if (playfield[y][x] === 2) {
            mainInnerHTML += `<div class="cell fixedCell"></div>`;
            // Cleaner
          } else {
            mainInnerHTML += '<div class="cell"></div>';
          }
        } pause
      }
      main.innerHTML = mainInnerHTML;
    }
    function drawNextTetro() {
      let nextTetroInnerHTML = "";
      for (let y = 0; y < nextTetro.shape.length; y++) {
        for (let x = 0; x < nextTetro.shape[y].length; x++) {
          if (nextTetro.shape[y][x]) {
            nextTetroInnerHTML += `<div class="cell movingCell ${nextTetro.color}"></div>`;
          } else {
            nextTetroInnerHTML += '<div class="cell"></div>';
          }
        }
        nextTetroInnerHTML += "<br/>";
      }
      if (nextTetroElem.style.display == "none") {
        nextTetroElem.style.display = ""
      }
      nextTetroElem.innerHTML = nextTetroInnerHTML;
    }
    function removePrevActiveTetro() {
      for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
          if (playfield[y][x] === 1) {
            playfield[y][x] = 0;
          }
        }
      }
    }
    function addActiveTetro() {
      if (activeTetro.shape === undefined) return;
      removePrevActiveTetro();
      for (let y = 0; y < activeTetro.shape.length; y++) {
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
          if (activeTetro.shape[y][x] === 1) {
            playfield[activeTetro.y + y][activeTetro.x + x] =
              activeTetro.shape[y][x];
          }
        }
      }
    }
    function rotateTetro() {
      const prevTetroState = activeTetro.shape;
      activeTetro.shape = activeTetro.shape[0].map((val, index) =>
        activeTetro.shape.map((row) => row[index]).reverse()
      );
      if (hasCollisions()) {
        activeTetro.shape = prevTetroState;
      }
    }
    function hasCollisions() {
      if (activeTetro.shape === undefined) return;
      for (let y = 0; y < activeTetro.shape.length; y++) {
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
          if (
            activeTetro.shape[y][x] &&
            (playfield[activeTetro.y + y] === undefined ||
              playfield[activeTetro.y + y][activeTetro.x + x] === undefined ||
              playfield[activeTetro.y + y][activeTetro.x + x] === 2)
          ) {
            return true;
          }
        }
      }
      return false;
    }
    function removeFullLines() {
      let canRemoveLine = true,
        filledLines = 0;
      for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
          if (playfield[y][x] !== 2) {
            canRemoveLine = false;
            break;
          }
        }
        if (canRemoveLine) {
          playfield.splice(y, 1);
          playfield.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
          filledLines += 1;
        }
        canRemoveLine = true;
      }
      switch (filledLines) {
        case 1:
          score += possibleLevels[currentLevel].scorePerLine;
          break;
        case 2:
          score += possibleLevels[currentLevel].scorePerLine * 3;
          break;
        case 3:
          score += possibleLevels[currentLevel].scorePerLine * 6;
          break;
        case 4:
          score += possibleLevels[currentLevel].scorePerLine * 12;
          break;
      }
      scoreElem.innerHTML = score;
      if (score >= possibleLevels[currentLevel].nextLevelScore) {
        currentLevel++;
        if (dropInterval > 500) {
          dropInterval -= 200;
        } else {
          dropInterval = dropInterval * 0.5;
        }
        levelElem.innerHTML = currentLevel;
      }
    }
    function getNewTetro() {
      const rand = Math.floor(Math.random() * 7);
      const newTetro = theTetrominoes[rand];
      const colorTetro = colors[rand];
      if (newTetro === undefined) return;
      return {
        x: Math.floor((10 - newTetro[0].length) / 2),
        y: 0,
        shape: newTetro,
        color: colorTetro,
      };
    }
    function fixTetro() {
      for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
          if (playfield[y][x] === 1) {
            playfield[y][x] = 2;
          }
        }
      }
    }
    function moveTetroDown() {
      activeTetro.y += 1;
      if (hasCollisions()) {
        activeTetro.y -= 1;
        fixTetro();
        removeFullLines();
        activeTetro = nextTetro;
        if (hasCollisions()) {
          reset();
        }
        nextTetro = getNewTetro();
      }
    }
    function reset() {
      isPaused = true;
      cancelAnimationFrame(animationId);
      if (lives <= 1) {
        gameOver.style.display = "";
      } else {
        playfield = Array.from({ length: 20 }, () => Array(10).fill(0));
        lives -= 1;
        livesElem.innerHTML = lives
        lifeLost.style.display = "";
        pauseStart = Date.now();
        btnPause.innerHTML = "Continue";
      }
      draw();
    }
    function dropTetro() {
      for (let y = activeTetro.y; y < playfield.length; y++) {
        activeTetro.y += 1;
        if (hasCollisions()) {
          activeTetro.y -= 1;
          break;
        }
      }
    }
    function update() {
      if (!isPaused) {
        addActiveTetro();
        draw();
        drawNextTetro();
      }
    }
    function control(e) {
      if (isPaused) return;
      if (e.keyCode === 37) {
        activeTetro.x -= 1;
        if (hasCollisions()) {
          activeTetro.x += 1;
        }
      } else if (e.keyCode === 39) {
        activeTetro.x += 1;
        if (hasCollisions()) {
          activeTetro.x -= 1;
        }
      } else if (e.keyCode === 40) {
        moveTetroDown();
      } else if (e.keyCode === 32) {
        dropTetro();
      }
      update();
    }
    function controlRotate(e) {
      if (isPaused) return;
      if (e.keyCode === 38) {
        rotateTetro();
      }
      update();
    }
    function updateTime() {
      const gameTime = (Date.now() - startTime - pausedTime);
      const seconds = Math.floor(gameTime / 1000) - Math.floor(gameTime / 60000) * 60;
      const minutes = Math.floor(gameTime / 60000) - Math.floor(gameTime / 3600000) * 60;
      const hours = Math.floor(gameTime / 3600000);
      const formattedTime = hours.toString().padStart(2, '0') + ":" +
        minutes.toString().padStart(2, '0') + ":" +
        seconds.toString().padStart(2, '0');
      timeElement.textContent = formattedTime;
    }
    btnPause.addEventListener("click", (e) => {
      if (e.target.innerHTML === "Pause") {
        pauseStart = Date.now();
        e.target.innerHTML = "Continue";
        cancelAnimationFrame(animationId);
      } else {
        pausedTime = pausedTime + Date.now() - pauseStart;
        e.target.innerHTML = "Pause";
        animationId = requestAnimationFrame(startGame);
      }
      isPaused = !isPaused;
    });
    btnStart.addEventListener("click", (e) => {
      btnStart.style.display = 'none';
      btnRestart.style.display = '';
      btnPause.style.display = '';
      startTime = Date.now();
      isPaused = false;
      animationId = requestAnimationFrame(startGame);
      gameOver.style.display = "none";
    });
    btnRestart.addEventListener("click", (e) => {
      location.reload();
    });
    btnGameOverRestart.addEventListener("click", (e) => {
      location.reload();
    });
    btnLifeLostContinue.addEventListener("click", (e) => {
      pausedTime = pausedTime + Date.now() - pauseStart;
      btnPause.innerHTML = "Pause";
      animationId = requestAnimationFrame(startGame);
      isPaused = !isPaused;
      lifeLost.style.display = "none"
    })
    scoreElem.innerHTML = score;
    levelElem.innerHTML = currentLevel;
    livesElem.innerHTML = lives
    draw();
    function startGame(timestamp) {
      if (!lastTime) {
        lastTime = timestamp;
      }
      const deltaTime = timestamp - lastTime;
      if (!isPaused) {
        if (deltaTime >= dropInterval) {
          moveTetroDown();
          lastTime = timestamp;
        }
        update();
        animationId = requestAnimationFrame(startGame);
        updateTime();
      }
    }
  });
  