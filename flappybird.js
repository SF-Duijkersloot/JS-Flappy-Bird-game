////////////////////////////////////////////////////////////////
// Bronnen code:
// Inspiratie voor flappy bird game (p5.js) : https://www.youtube.com/watch?v=cXgA1d_E-jY&t=286s
// Inpiratie voor geluid activatie (p5.js): https://www.youtube.com/watch?v=aKiyCeIuwn4&t=640s
// een bron voor vanilla javscript flappybird: https://www.youtube.com/watch?v=3SsYZDJdeXk&t=230s
// en natuurlijk MDN voor overige informatie :)
// 
// Bronnen visuals/effects:
// Bird asset: https://www.hiclipart.com/free-transparent-background-png-clipart-ppaww
// Foto van Janno: http://www.bloktech.nl/project-tech
// Assets voor de pipes van: https://github.com/NNBnh/flappybirdart
// Sounds van: https://bitbucket.org/EdwardAngeles/godot-engine-tutorial-flappy-bird/downloads/
// Highscore geinspireerd van: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
////////////////////////////////////////////////////////////////


// Toggle slider voor audio modes
const toggleSlider = document.querySelector('.toggle-slider input');
let thresholdJump = true;
toggleSlider.addEventListener('change', function() {
  if (this.checked) {
    thresholdJump = true;
    document.querySelector(".level-visualizer").classList.remove('left-position');
    document.querySelector(".Microphone").classList.remove('left-microphone');
    document.querySelector(":root").style.setProperty('--display-slider', 'block');
    localStorage.setItem('checkboxState', 'checked');
  } else {
    thresholdJump = false;
    document.querySelector(".level-visualizer").classList.add('left-position');
    document.querySelector(".Microphone").classList.add('left-microphone');
    document.querySelector(":root").style.setProperty('--display-slider', 'none');
    localStorage.setItem('checkboxState', '');
  }
});

// Retrieve checkbox state from localStorage
const checkboxState = localStorage.getItem('checkboxState');
if (checkboxState === 'checked') {
  toggleSlider.checked = true;
  thresholdJump = true;
  document.querySelector(".level-visualizer").classList.remove('left-position');
  document.querySelector(".Microphone").classList.remove('left-microphone');
  document.querySelector(":root").style.setProperty('--display-slider', 'block');
} else {
  toggleSlider.checked = false;
  thresholdJump = false;
  document.querySelector(".level-visualizer").classList.add('left-position');
  document.querySelector(".Microphone").classList.add('left-microphone');
  document.querySelector(":root").style.setProperty('--display-slider', 'none');
}


// Button fix audio
document.querySelector('.audio-button').addEventListener('click', () => {
  location.reload()
});
  
//////////////////////////// Set up audio ////////////////////////////
// Create an audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Get the microphone input
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const source = audioContext.createMediaStreamSource(stream);

    // Create an analyser to get the audio data
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    // Create a buffer to store the audio data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // JumpEnabled variable
    let jumpEnabled = true;
    
    // Check the microphone input level periodically
    setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      let inputLevel = dataArray.reduce((acc, val) => acc + val) / bufferLength;


      let thresholdValueLower = document.querySelector('.ThresholdLower').value;  
      let thresholdValueUpper = document.querySelector(".ThresholdUpper").value;   
  
      
      if (thresholdJump == true) {
          if (inputLevel > thresholdValueUpper && jumpEnabled == true) {
            birdJumpSpeed = -6;
            gameStarted = true; 
            jumpEnabled = false;
            jumpSound.play();
          }
          if (inputLevel < thresholdValueLower) {
            jumpEnabled = true;
      }} else {
        birdY = (canvas.height - characterHeight) * (1 - inputLevel / 100)
      }

      // Visualizers
      document.querySelector(':root').style.setProperty('--visualiser-bar', inputLevel + "%")
      if (thresholdJump == false) {
        
        document.querySelector(':root').style.setProperty('--display-slider-none', 'none')
      }else {
        document.querySelector(':root').style.setProperty('--upper-hr-bottom', thresholdValueUpper + "%")
        document.querySelector(':root').style.setProperty('--lower-hr-bottom', thresholdValueLower + "%")
        document.querySelector(':root').style.setProperty('--display-slider-none', 'block')
      }
    }, 100);
  })
  .catch(err => console.error(err));


  
//////////////////////////// Set up variables ////////////////////////////
// Define game entities
const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
let birdX = 50;
let birdY = canvas.height / 2;
let birdJumpSpeed = 0;
let gravity = 0.2;
let pipes = [];
let score = 0;
let frameCount = 0;
let gameStarted = false;
let gameOver = false;
let characterHeight = 40;
let characterWidth = 48;

// Adjustable variables
const gapSize = 120;
const pipeWidth = 52;
const minPipeHeight = 50;
const maxPipeHeight = canvas.height - gapSize - minPipeHeight;

// Sfx aanmaken
jumpSound = new Audio('./Sounds/sfx_wing.wav');
pointSound = new Audio('./Sounds/sfx_point.wav');
dieSound = new Audio('./Sounds/sfx_hit.wav');

//////////////////////////// Start game logic ////////////////////////////
// Main game loop
function gameLoop() {
  if (gameOver === true) {
    return;
  }
  updateGameState();
  renderGraphics();
  requestAnimationFrame(gameLoop)
}

// Update game state
function updateGameState() {
  if (!gameStarted) {
    return;
  }

  // Update bird position and speed
  if (thresholdJump == true) {
  birdY += birdJumpSpeed;
  birdJumpSpeed += gravity;
  }

  // Stop from going out of borders
  if (birdY + characterHeight > canvas.height) {
    birdY = canvas.height - characterHeight;
    birdJumpSpeed = 0;
  }
  if (birdY < 0) {
    birdY = 0;
    birdJumpSpeed = 0;
  }

  // Generate new pipe every 200 frames
  if (frameCount % 200 === 0) {
    let topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight);
    let bottomPipeY = topPipeHeight + gapSize;
    
    pipes.push({
      x: canvas.width,
      y: topPipeHeight,
      gapSize: gapSize,
      pipeWidth: pipeWidth,
      bottomPipeY: bottomPipeY,
    });
  }
  
  // Check for collision with bird
  pipes.forEach(function(pipe) {
  // Check for collision with top pipe
  if (
    birdX + characterWidth > pipe.x &&
    birdX < pipe.x + pipeWidth &&
    (birdY < pipe.y - pipe.gapSize / 2 || birdY + characterHeight > pipe.bottomPipeY)
  ) {
    endGame();
  } else if (
    // Check for collision with bottom pipe
    birdX + characterWidth > pipe.x &&
    birdX < pipe.x + pipeWidth &&
    birdY + characterHeight >= pipe.bottomPipeY
  ) {
    endGame();
  }

  // Check for passing pipe
  if (pipe.x + pipeWidth == birdX) {
    score++
    pointSound.play();
    console.log('score')
  }

  // Move pipes to the left
  pipe.x -= 2;

  // Remove pipes that are off the screen
  if (pipes.length > 0 && pipes[0].x < -50) {
    pipes.shift();
  }
});

// Get the current highscore from localstorage
let highscore = localStorage.getItem('highscore') || 0;

// Update the highscore
if (score > highscore) {
  highscore = score;
  localStorage.setItem('highscore', highscore);
  document.querySelector(':root').style.setProperty('--display-new-none', 'block')
}

  // Increase frame count
  frameCount++;
}

const bottomPipeImage = new Image();
bottomPipeImage.src = "./Images/bottomPipe.jpg";
const topPipeImage = new Image();
topPipeImage.src = "./Images/topPipe.jpg";
const spriteCharacter = new Image();
spriteCharacter.src = './Images/bird-asset2.png'


// Render graphics
function renderGraphics() {
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Set font
  let font = new FontFace("PressStrat2P", "url(./Fonts/PressStart2P-Regular.ttf)");
  font.load().then((font) => {
    document.fonts.add(font);
    context.font = "15px PressStrat2P"
  });
  
  // Draw bird
  context.fillStyle = "#000";
  context.drawImage(spriteCharacter, birdX, birdY, characterWidth, 48)

  // Draw pipes
  context.fillStyle = "#71aa34";
  pipes.forEach(function (pipe) {
    let topPipeBottomY = pipe.y - pipe.gapSize / 2;

    // Draw top pipe
    context.drawImage(topPipeImage, pipe.x, 0, pipe.pipeWidth, topPipeBottomY);

    // Draw bottom pipe
    context.drawImage(bottomPipeImage, pipe.x, pipe.bottomPipeY, pipe.pipeWidth, canvas.height - pipe.bottomPipeY);

  });

  // Draw score
  context.fillStyle = "#334760";
  context.font = "35px PressStrat2P"
  context.fillText(score, canvas.width / 2, 50)


  // Draw highscore
  const highscore = localStorage.getItem('highscore') || 0;
  document.querySelector('.best-score').textContent = highscore;

  // Draw message to start game
  if (!gameStarted && thresholdJump == true) {
    context.font = "15px PressStrat2P"
    context.fillStyle = "#000";
    context.fillText("Press SPACE to start", 40, canvas.height / 2 - 50);
    context.fillText("Or make a LOUD noise", 40, canvas.height / 2 - 25);
  }
  else if (!gameStarted) {
    context.font = "15px PressStrat2P"
    context.fillStyle = "#000";
    context.fillText("Press SPACE to start and", 40, canvas.height / 2 - 50);
    context.fillText("SCREAM as hard as you want", 40, canvas.height / 2 - 25);
  }
}

// Event listeners
document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    if (!gameStarted) {
      gameStarted = true;
    }
    birdJumpSpeed = -6;
    jumpSound.play();
  }
});


const medalImage = document.querySelector('.medal-image'); 
const gameoverMessage = document.querySelector('.gameover-message');
// Utility functions
function endGame() {
  dieSound.play();
  gameOver = true;
  document.querySelector(".restartButton").addEventListener('click', () => {location.reload()}) 
  document.querySelector(".current-score").textContent = score;
  // document.querySelector(':root').style.setProperty('--display-none', 'grid', '10');
  gameoverMessage.classList.add('gameover-show');
  if (score >= 5) { medalImage.src = './Images/medal_bronze.png'; document.querySelector(':root').style.setProperty('--medal-opacity', '100%') }
  if (score >= 15) { medalImage.src = './Images/medal_silver.png';  document.querySelector(':root').style.setProperty('--medal-opacity', '100%')}
  if (score >= 25) { medalImage.src = './Images/medal_gold.png';  document.querySelector(':root').style.setProperty('--medal-opacity', '100%')}
  if (score >= 50) { medalImage.src = './Images/medal_platinum.png';  document.querySelector(':root').style.setProperty('--medal-opacity', '100%')}
}

// Start game loop
gameLoop();