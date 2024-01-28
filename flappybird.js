////////////////////////////////////////////////////////////////
// Bronnen code:
// Inspiratie voor flappy bird game (p5.js) : https://www.youtube.com/watch?v=cXgA1d_E-jY&t=286s
// Inpiratie voor geluid activatie (p5.js): https://www.youtube.com/watch?v=aKiyCeIuwn4&t=640s
// een bron voor vanilla javscript flappybird: https://www.youtube.com/watch?v=3SsYZDJdeXk&t=230s
// en natuurlijk MDN voor overige informatie.
// ook hulp met bugs en code van chatGPT
// 
// Bronnen visuals/effects:
// Bird asset: https://www.hiclipart.com/free-transparent-background-png-clipart-ppaww
// Assets voor de pipes van: https://github.com/NNBnh/flappybirdart
// Sounds van: https://bitbucket.org/EdwardAngeles/godot-engine-tutorial-flappy-bird/downloads/
// Highscore geinspireerd van: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
////////////////////////////////////////////////////////////////


// Toggle slider voor audio modes
const toggleSlider = document.querySelector('.toggle-slider input');
let thresholdJump = true;
toggleSlider.addEventListener('change', function() {
  
  // Threshold jump mode
  if (this.checked) {
    thresholdJump = true;
    document.querySelector(".level-visualizer").classList.remove('left-position');
    document.querySelector(".Microphone").classList.remove('left-microphone');
    document.querySelector(":root").style.setProperty('--display-slider', 'block');
    localStorage.setItem('checkboxState', 'checked');
  } 
    // Audio bar height  
    else {
    thresholdJump = false;
    document.querySelector(".level-visualizer").classList.add('left-position');
    document.querySelector(".Microphone").classList.add('left-microphone');
    document.querySelector(":root").style.setProperty('--display-slider', 'none');
    localStorage.setItem('checkboxState', '');
  }
});

// De state van de 2 modes slider onthouden in de localStorage
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


// Button fix audio voor als de audio het niet doet bij de eerste start
document.querySelector('.audio-button').addEventListener('click', () => {
  location.reload()
});



//////////////////////////// Set up audio ////////////////////////////

// Audio context maken
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Microfoon input krijgen
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const source = audioContext.createMediaStreamSource(stream);

    // Analyser maken voor de audio data
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    // Buffer maken om de audio data op te slaan
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // JumpEnabled variable (voor de threshold jump mode)
    let jumpEnabled = true;
    
    // Microfoon level checken met een interval van 100ms
    setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      
      // inputLevel is het geluidsniveau wat de microfoon oppakt
      let inputLevel = dataArray.reduce((acc, val) => acc + val) / bufferLength; 

      // Threshold values ophalen van de slider values
      let thresholdValueLower = document.querySelector('.ThresholdLower').value;  
      let thresholdValueUpper = document.querySelector(".ThresholdUpper").value;   
  
      // Als threshold mode aan staat
      if (thresholdJump == true) {
          if (inputLevel > thresholdValueUpper && jumpEnabled == true) { // Als input level boven de threshold komt en jumpEnabled is true
            birdJumpSpeed = -6; // Laat de bird jumpen met een hoogte/velocity van 6
            gameStarted = true; // Variable om de game te starten met de eerste jump
            jumpEnabled = false; // Werkt als een reset voor de jump, zonder dit zou de vogel continu omhoog stijgen als de inputLevel boven de threshold is
            jumpSound.play();
          }

          // Als microfoon niveau onder de threshold komt dan wordt de jump variable gereset
          if (inputLevel < thresholdValueLower) {
            jumpEnabled = true;
      }} 
      // Als de audio bar mode aanstaat, dan krijgt de vogel de hoogte op basis van het geluidsniveau met deze simpele formule
      else {
        birdY = (canvas.height - characterHeight) * (1 - inputLevel / 100)
      }

      
      /////////// Visualizers ///////////
      
      document.querySelector(':root').style.setProperty('--visualiser-bar', inputLevel + "%") // hoogte van geluidsbar aanpassen op basis van inputLevel
      if (thresholdJump == false) {
        document.querySelector(':root').style.setProperty('--display-slider-none', 'none') // HTML slider hiden als de mode op audio bar staat
      }else {
        // Threshold values in de audio bar tonen
        document.querySelector(':root').style.setProperty('--upper-hr-bottom', thresholdValueUpper + "%")
        document.querySelector(':root').style.setProperty('--lower-hr-bottom', thresholdValueLower + "%")
        document.querySelector(':root').style.setProperty('--display-slider-none', 'block') // HTML sliders "aanzetten" / laten zien
      }
    }, 100);
  })
  .catch(err => console.error(err));




//////////////////////////// Set up variables ////////////////////////////

// Game entities
const canvas = document.querySelector(".canvas"); // De game wordt gedisplayed om een html canvas
const context = canvas.getContext("2d");
let birdX = 50;
let birdY = canvas.height / 2;
let birdJumpSpeed = 0;
let gravity = 0.2;
let pipes = []; //array voor de pipes
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
  // Run de game functions pas als de game niet gameover is
  updateGameState();
  renderGraphics();
  requestAnimationFrame(gameLoop)
}

// Update game state
function updateGameState() {
  if (!gameStarted) {
    return;
  }

  // Update bird positie and speed
  if (thresholdJump == true) {
  birdY += birdJumpSpeed;
  birdJumpSpeed += gravity;
  }

  // Bird stoppen bij de border van het canvas
  if (birdY + characterHeight > canvas.height) {
    birdY = canvas.height - characterHeight;
    birdJumpSpeed = 0;
  }
  if (birdY < 0) {
    birdY = 0;
    birdJumpSpeed = 0;
  }

  // Nieuwe pipe generaten om de 200 frames
  if (frameCount % 200 === 0) {
    // hoogte bepalen van de bovenste pipe
    let topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight); 

    // Hoogte bepalen van de onderste pipe
    let bottomPipeY = topPipeHeight + gapSize;

    // Voegt de objecten toe aan de pipes array
    pipes.push({
      x: canvas.width,
      y: topPipeHeight,
      gapSize: gapSize,
      pipeWidth: pipeWidth,
      bottomPipeY: bottomPipeY,
    });
  }

  
  ///////// Collision check met de bird /////////
  
  pipes.forEach(function(pipe) {
  // check collision met de bird en top pipe
  if (
    birdX + characterWidth > pipe.x &&
    birdX < pipe.x + pipeWidth &&
    (birdY < pipe.y - pipe.gapSize / 2 || birdY + characterHeight > pipe.bottomPipeY)
  ) {
    endGame(); // Als er een collision is => end game
  } else if (
    // check collision met de bird en bottom pipe
    birdX + characterWidth > pipe.x &&
    birdX < pipe.x + pipeWidth &&
    birdY + characterHeight >= pipe.bottomPipeY
  ) {
    endGame(); // Als er een collision is => end game
  }

  // Check voor de bewegende pipes
  if (pipe.x + pipeWidth == birdX) {
    // Als de bird voorbij de x-value van een pipe is wordt de score ++
    score++
    pointSound.play(); // Sfx
    // console.log('point added')
  }

  // Pipes bewegen naar links
  pipe.x -= 2;

  // Optimization: pipes weghalen als ze uit het scherm zijn.
  if (pipes.length > 0 && pipes[0].x < -50) {
    pipes.shift();
  }
});

// Huidige highscore ophalen van de localstorage
let highscore = localStorage.getItem('highscore') || 0;

// Highscore updaten
if (score > highscore) {
  highscore = score;
  localStorage.setItem('highscore', highscore);
  document.querySelector(':root').style.setProperty('--display-new-none', 'block') // Als de score hoger dan de highscore is komt er "NEW" naast te staan
}
  // Frame count bijhouden voor de updateGameState() loop
  frameCount++; 
}



//////////////////////////// Canvas graphic section ////////////////////////////

// Objects een image geven
const bottomPipeImage = new Image();
bottomPipeImage.src = "./Images/bottomPipe.jpg";
const topPipeImage = new Image();
topPipeImage.src = "./Images/topPipe.jpg";
const spriteCharacter = new Image();
spriteCharacter.src = './Images/bird-asset2.png'


// Graphics renderen
function renderGraphics() {
  // canvas clearen
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Juiste font geven
  let font = new FontFace("PressStrat2P", "url(./Fonts/PressStart2P-Regular.ttf)");

  // "then" wordt gebruikt om code uit te voeren wanneer het lettertype is geladen
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
  const highscore = localStorage.getItem('highscore') || 0; // als er geen highscore is dan is de default 0
  document.querySelector('.best-score').textContent = highscore;

  // Draw start game prompt
  if (!gameStarted && thresholdJump == true) { // de prompt voor de threshold jump mode
    context.font = "15px PressStrat2P"
    context.fillStyle = "#000";
    context.fillText("Press SPACE to start", 40, canvas.height / 2 - 50);
    context.fillText("Or make a LOUD noise", 40, canvas.height / 2 - 25);
  }
  else if (!gameStarted) { // prompt voor de audio bar height mode
    context.font = "15px PressStrat2P"
    context.fillStyle = "#000";
    context.fillText("Press SPACE to start and", 40, canvas.height / 2 - 50);
    context.fillText("SCREAM as hard as you want", 40, canvas.height / 2 - 25);
  }
}

// Jump event listener
document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    if (!gameStarted) {
      // als de game nog niet is gestart => start de game als space is gedrukt
      gameStarted = true;
    }
    // Jump velocity code
    birdJumpSpeed = -6; // Laat de bird jumpen met een hoogte/velocity van 6
    jumpSound.play(); // Sfx
  }
});


/////////// Game over design elements ///////////

const medalImage = document.querySelector('.medal-image'); 
const gameoverMessage = document.querySelector('.gameover-message');

// Game over function
function endGame() {
  dieSound.play();
  gameOver = true;
  document.querySelector(".restartButton").addEventListener('click', () => {location.reload()}) // Restart button
  document.querySelector(".current-score").textContent = score; // Score updaten
  gameoverMessage.classList.add('gameover-show'); // Laat de game-over box zien

  // Juiste medal geven op basis van de score
  if (score >= 5) { medalImage.src = './Images/medal_bronze.png'; document.querySelector(':root').style.setProperty('--medal-opacity', '100%') }
  if (score >= 15) { medalImage.src = './Images/medal_silver.png';  document.querySelector(':root').style.setProperty('--medal-opacity', '100%')}
  if (score >= 25) { medalImage.src = './Images/medal_gold.png';  document.querySelector(':root').style.setProperty('--medal-opacity', '100%')}
  if (score >= 50) { medalImage.src = './Images/medal_platinum.png';  document.querySelector(':root').style.setProperty('--medal-opacity', '100%')}
}




// Game loop roepen
gameLoop();
