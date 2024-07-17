class Player {
    constructor(ctx, canvasHeight, skaterImages, skaterJumpingImage) {
        this.ctx = ctx;
        this.canvasHeight = canvasHeight;
        this.x = 100; // Position X
        this.y = (this.canvasHeight / 2 + 48); 
        this.width = 180; // Taille Personnage (Largeur)
        this.height = 120; // Taille Personnage (Hauteur)
        this.velocityY = 0; // ?
        this.gravity = 0.8; // Gravité 
        this.lift = -20; // Force du saut
        this.isJumping = false; // Statut Saut
        this.images = skaterImages; // Tableau d'images de course
        this.jumpingImage = skaterJumpingImage; // Image de saut
        this.currentFrame = 0; // Cadre actuel de l'animation
        this.frameCounter = 0; // Compteur pour contrôler la vitesse de l'animation
        this.frameSpeed = 5; // Vitesse de changement d'images (plus petit est plus rapide)
    }

    draw() {
        let currentImage = this.isJumping ? this.jumpingImage : this.images[this.currentFrame];
        this.ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.lift;
            this.isJumping = true;
            jumpSound.currentTime = 0; 
            jumpSound.play();
        }
    }

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // S'assurer que le personnage tombe sur le sol
        if (this.y >= this.canvasHeight / 2 + 27) {
            this.y = this.canvasHeight / 2 + 27;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Mettre à jour le cadre actuel de l'animation
        if (!this.isJumping) {
            this.frameCounter++;
            if (this.frameCounter >= this.frameSpeed) {
                this.frameCounter = 0;
                this.currentFrame = (this.currentFrame + 1) % this.images.length;
            }
        }

        this.draw();
    }
}

export default Player;
