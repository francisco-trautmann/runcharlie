import Player from './Player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minObstacleSeparation = 1000;
const maxSpeed = 40; // Vitesse Max

let score = 0;
let highScore = 0;
let speed = 7; // Vitesse de base
let gameRunning = true;
let obstacles = [];

// Animation +10 points
let showPlusTen = false;
let plusTenTimer = 0;
let plusTenPosition = { x: 0, y: 0 };

// Chargement des images du personnage
const skaterImages = [];
for (let i = 1; i <= 4; i++) {
    let img = new Image();
    img.src = `../assets/images/${i}.png`; // Assurez-vous que les images sont nommées 1.png, 2.png, etc.
    skaterImages.push(img);
}

const skaterJumpingImage = new Image();
skaterJumpingImage.src = '../assets/images/2.png'; // Image Personnage 2

// Chargement des images des obstacles
const cocaImage = new Image();
cocaImage.src = '../assets/images/coca.png';
const catImage = new Image();
catImage.src = '../assets/images/cat.png';
const bushImage = new Image();
bushImage.src = '../assets/images/bush.png';

// Taille des obstacles
const obstacleConfig = {
    coca: { width: 50, height: 90 },
    cat: { width: 90, height: 90 },
    bush: { width: 90, height: 90 },
};

// Pour s'assurer que les images se chargent avant le jeu
let imagesLoaded = 0;
let lastObstacleX = -minObstacleSeparation;

function onImageLoad() {
    imagesLoaded++;
    if (imagesLoaded === skaterImages.length + 3) {
        // Toutes les images sont chargées pour commencer le jeu
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let player = new Player(ctx, canvas.height, skaterImages, skaterJumpingImage);

        window.addEventListener('keydown', function(event) { // Lorsque l'on clique sur espace, le personnage saute
            if (event.code === 'Space') {
                if (gameRunning) {
                    player.jump();
                } else {
                    restartGame(); // Ou le jeu recommence si le jeu est finis
                }
            }
        });

        function addObstacle() {
            const nextObstacleX = Math.max(
                canvas.width,
                lastObstacleX + minObstacleSeparation + Math.random() * minObstacleSeparation
            );

            const obstacleImages = [cocaImage, catImage, bushImage];
            const image = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];

            let obstacleY;
            let obstacleWidth;
            let obstacleHeight;

            if (image === cocaImage) {
                obstacleY = canvas.height / 2 + 60; // Placement obstacle
                obstacleWidth = obstacleConfig.coca.width;
                obstacleHeight = obstacleConfig.coca.height;
            } else if (image === catImage) {
                obstacleY = canvas.height / 2 + 60; // Placement obstacle
                obstacleWidth = obstacleConfig.cat.width;
                obstacleHeight = obstacleConfig.cat.height;
            } else if (image === bushImage) {
                obstacleY = canvas.height / 2 + 60; // Placement obstacle
                obstacleWidth = obstacleConfig.bush.width;
                obstacleHeight = obstacleConfig.bush.height;
            }

            const obstacle = {
                x: nextObstacleX,
                y: obstacleY,
                width: obstacleWidth,
                height: obstacleHeight,
                image: image
            };

            obstacles.push(obstacle);
            scheduleNextObstacle();
        }

        function drawRoad() {
            const roadY = canvas.height / 2 + 145; // Placement en Y du sol
            const roadHeight = 250; // Hauteur du sol ?

            // Création du dégradé
            const gradient = ctx.createLinearGradient(0, roadY, 0, roadY + roadHeight);
            gradient.addColorStop(0, '#c8ff8c'); // Couleur de départ
            gradient.addColorStop(1, '#07b465'); // Couleur de fin

            // Application du dégradé
            ctx.fillStyle = gradient;
            ctx.fillRect(0, roadY, canvas.width, roadHeight);
        }

        function scheduleNextObstacle() { // Intervalle des obstacles
            const minInterval = 1000; // Minimum de temps en milisecondes
            const maxInterval = 3000; // Maximum de temps en milisecondes
            const interval = Math.random() * (maxInterval - minInterval) + minInterval; // Formule pour générer l'intervalle
            setTimeout(addObstacle, interval); 
        }

        function drawObstacles() {
            obstacles.forEach(obstacle => {
                ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            });
        }

        function updateObstacles() {
            
            for (let i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].x -= speed;
                
                // Fonction pour augmenter le score à chaque obstacle

                if (!obstacles[i].passed && player.x + player.width > obstacles[i].x) {
                    score++;
                    obstacles[i].passed = true;
                    updateScore(1); // Augmente le score de 1
                    
                    // Jouer le son jumpSound2 lorsque le joueur passe un obstacle
                    jumpSound2.currentTime = 0;
                    jumpSound2.play();
                }
        
                if (obstacles[i].x + obstacles[i].width < 0) {
                    obstacles.splice(i, 1);
                }
        
                if (obstacles[i].x + obstacles[i].width < 0) {
                    obstacles.splice(i, 1);
                }
            }

        }

        function checkCollision(player, obstacle) {
            const hitboxPadding = 30; // Réduit la hitbox de 30px de chaque côté
            return (
                player.x < obstacle.x + obstacle.width - hitboxPadding &&
                player.x + player.width > obstacle.x + hitboxPadding &&
                player.y < obstacle.y + obstacle.height - hitboxPadding &&
                player.y + player.height > obstacle.y + hitboxPadding
            );
        }

        function drawScore() { // Affiche le score
            ctx.fillStyle = 'black'; // Couleur du score
            ctx.font = '24px Arial'; // Taille, Typo
            ctx.fillText('Score: ' + score, canvas.width / 2 - 140 , 60); // Placement du score (x,y)
            ctx.fillText('High Score: ' + highScore, canvas.width / 2 , 60); // Placement High Score (x,y)
        }

        function updateScore(newPoints) {
            // Fonction pour augmenter le score tout les 10 points
            if (score % 10 === 0 && newPoints > 0) { 
                pointsSound.currentTime = 0; 
                pointsSound.play();
                showPlusTen = true;
                plusTenTimer = 120; // 2 secondes ?
                plusTenPosition.x = canvas.width / 2 - 45; // Position X
                plusTenPosition.y = 120; // Position Y
            }
        }

        function drawPlusTen() { // Fonction affichage +10
            if (showPlusTen) {
                ctx.fillStyle = '#505F32'; // Couleur du texte
                ctx.font = '40px Arial'; // Taille, Typo
                ctx.fillText('+10', plusTenPosition.x, plusTenPosition.y);
                plusTenTimer--;
                if (plusTenTimer <= 0) {
                    showPlusTen = false;
                }
            }
        }

        function gameOver() { // Fonction affichage Game Over
            ctx.fillStyle = 'black'; // Couleur
            ctx.font = '40px Arial'; // Taille, Typo
            ctx.fillText('Game Over', canvas.width / 2 -100, canvas.height / 2 -100);

            // Affiche le bouton Restart
            const restartButton = document.getElementById('restartButton'); //Relie au HTML
            restartButton.style.display = 'block';
        }

        function restartGame() { // Recommence le jeu
            score = 0;
            gameRunning = true;
            obstacles.length = 0; // Efface les obstacles existants
            player = new Player(ctx, canvas.height, skaterImages, skaterJumpingImage); // ?

            // Enlève le bouton Restart
            const restartButton = document.getElementById('restartButton');
            restartButton.style.display = 'none';

            // Relance la boucle
            requestAnimationFrame(gameLoop);
        }

        // Instructions
        function drawTapToJumpText() {
            const text = "Press 'Spacebar' to jump"; // Texte
            ctx.fillStyle = 'white'; // Couleur
            ctx.font = '20px Arial'; // Taille, Typo
            const textWidth = ctx.measureText(text).width;
            const xPosition = (canvas.width - textWidth) / 2; // Position X (Centrer au milieu)
            const yPosition = canvas.height - 150; // Position Y 
            ctx.fillText(text, xPosition, yPosition);
        }

        document.getElementById('restartButton').addEventListener('click', function() {
            restartGame(); // Fonction Restart quand on clique sur le bouton
        });

        function gameLoop() {
            if (!gameRunning) {
                if (score > highScore) {
                    highScore = score;
                }
                gameOver();
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawRoad();
            drawObstacles();
            drawPlusTen();
            player.update();
            updateObstacles();
            drawTapToJumpText();

            for (let obstacle of obstacles) {
                if (checkCollision(player, obstacle)) {
                    looseSound.currentTime = 0; 
                    looseSound.play(); // Joue le son 1 lors de la mort

                    looseSound2.currentTime = 0; 
                    looseSound2.play(); // Joue le son 2 lors de la mort
                    gameRunning = false;
                    break;
                }
            }

            drawScore();
            requestAnimationFrame(gameLoop);
        }

        scheduleNextObstacle();
        gameLoop();
    }
}

// Charger les images de course et de saut
skaterImages.forEach(img => img.onload = onImageLoad);
skaterJumpingImage.onload = onImageLoad;
cocaImage.onload = onImageLoad;
catImage.onload = onImageLoad;
bushImage.onload = onImageLoad;
