import "./style.css";
import Phaser from "phaser";

let game;

const sizes = {
    width: 500,
    height: 500,
};


const gameCanvas = document.querySelector("#gameCanvas");
const gameStartDiv = document.querySelector("#gameStartDiv");
const gameStartBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEndDiv");
const playAgainBtn = document.querySelector("#playAgainBtn");
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan");
const gameEndSpan = document.querySelector("#gameEndSpan");

class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.player;
        this.cursor;
        this.playerSpeed = 300; 
        this.apple;
        this.points = 0;
        this.textScore;
        this.textTime;
        this.timedEvent;
        this.remainingTime;
        this.coinMusic;
        this.bgMusic;
        this.emitter;
        this.pEmitter;
        this.poisonApple;
        this.appleSpeed;  
        this.poisonAppleSpeed; 
    }

    preload() {
        this.load.image("bg", "assets/bg.png");
        this.load.image("basket", "assets/basket.png");
        this.load.image("apple", "assets/apple.png");
        this.load.image("poisonApple", "assets/poisonApple.png");
        this.load.image("money", "assets/money.png");
        this.load.image("poison", "assets/poison.png");
        this.load.audio("coin", "assets/coin.mp3");
        this.load.audio("bgMusic", "assets/bgMusic.mp3");
    }
    create() {
        this.coinMusic = this.sound.add("coin");
        this.bgMusic = this.sound.add("bgMusic", { loop: true });
        this.bgMusic.play();

        this.add.image(0, 0, "bg").setOrigin(0, 0);
        this.player = this.physics.add
            .image(0, sizes.height - 100, "basket")
            .setOrigin(0, 0);
        this.player.setImmovable(true);
        this.player.body.allowGravity = false;
        this.player.setCollideWorldBounds(true);
        this.player
            .setSize(
                this.player.width - this.player.width / 4,
                this.player.height / 6
            )
            .setOffset(
                this.player.width / 10,
                this.player.height - this.player.height / 10
            );

        this.apple = this.physics.add.image(0, 0, "apple").setOrigin(0, 0);
        this.appleSpeed = getRandomNumber(150, 350); 
        this.apple.setMaxVelocity(0, this.appleSpeed);
		this.apple.setVelocityY(this.appleSpeed);

        this.poisonApple = this.physics.add
            .image(100, 0, "poisonApple")
            .setOrigin(0, 0);
        this.poisonAppleSpeed = getRandomNumber(150, 350); 
        this.poisonApple.setMaxVelocity(0, this.poisonAppleSpeed);
		this.poisonApple.setVelocityY(this.poisonAppleSpeed);


        this.physics.add.overlap(
            this.apple,
            this.player,
            this.appleHit,
            null,
            this
        );

        this.physics.add.overlap(
            this.poisonApple,
            this.player,
            this.poisonHit,
            null,
            this
        );

        this.cursor = this.input.keyboard.createCursorKeys();

        this.textScore = this.add.text(sizes.width - 120, 10, "Score:0", {
            font: "25px Arial",
            fill: "#000",
        });

        this.textTime = this.add.text(10, 10, "Remaining Time: 00", {
            font: "25px Arial",
            fill: "#000",
        });

        this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this);

        this.emitter = this.add.particles(0, 0, "money", {
            speed: 100,
            gravityY: 100, 
            scale: 0.04,
            duration: 1000,
            emitting: false,
        });

        this.pEmitter = this.add.particles(0, 0, "poison", {
            speed: 100,
            gravityY: 100,  
            scale: 0.04,
            duration: 1000,
            emitting: false,
        });

        this.emitter.startFollow(
            this.player,
            this.player.width / 2,
            this.player.height / 2,
            true
        );

        this.pEmitter.startFollow(
            this.player,
            this.player.width / 2,
            this.player.height / 2,
            true
        );

        this.emitter.stop();
        this.pEmitter.stop();
    }

    update() {
        this.remainingTime = this.timedEvent.getRemainingSeconds();
        this.textTime.setText(
            `Remaining Time: ${Math.round(this.remainingTime).toString()}`
        );

        if (this.apple.y >= sizes.height) {
            this.apple.setY(0);
            this.apple.setX(this.getRandomX());
            this.appleSpeed = getRandomNumber(150, 350);
            this.apple.setMaxVelocity(0, this.appleSpeed);
        }

        if (this.poisonApple.y >= sizes.height) {
            this.poisonApple.setY(0);
            this.poisonApple.setX(this.getRandomX());
            this.poisonAppleSpeed = getRandomNumber(150, 350); 
            this.poisonApple.setMaxVelocity(0, this.poisonAppleSpeed); 
        }

        const { left, right } = this.cursor;
        if (left.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (right.isDown) {
            this.player.setVelocityX(this.playerSpeed);
        } else {
            this.player.setVelocityX(0);
        }
    }

    getRandomX() {
        return Math.floor(Math.random() * 480);
    }

    appleHit() {
        this.coinMusic.play();
        this.emitter.start();
        this.apple.setY(0);
        this.apple.setX(this.getRandomX());
        this.appleSpeed = getRandomNumber(150, 350); 
        this.apple.setMaxVelocity(0, this.appleSpeed); 
        this.points++;
        this.textScore.setText(`Score: ${this.points}`);
    }

    poisonHit() {
        this.pEmitter.start();
        this.poisonApple.setY(0);
        this.poisonApple.setX(this.getRandomX());
        this.poisonAppleSpeed = getRandomNumber(150, 350);
        this.poisonApple.setMaxVelocity(0, this.poisonAppleSpeed);
        if (this.points > 0) {
            this.points--;
        } else {
            this.points = 0;
            this.gameOver();
        }
        this.textScore.setText(`Score: ${this.points}`);
    }

    gameOver() {
        this.scene.pause("scene-game");
        if (this.points >= 10) {
            gameEndSpan.textContent = this.points;
            gameWinLoseSpan.textContent = "Win!";
        } else {
            gameEndSpan.textContent = this.points;
            gameWinLoseSpan.textContent = "Lose!";
        }
        gameEndDiv.style.display = "flex";
    }
}

const config = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    canvas: gameCanvas,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }, 
            debug: false,
        },
    },
    scene: [GameScene],
};

function startPhaserGame() {
    game = new Phaser.Game(config);
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

startPhaserGame();

gameStartBtn.addEventListener("click", () => {
    gameStartDiv.style.display = "none";
    if (!game.scene.isActive("scene-game")) {
        game.scene.start("scene-game");
    } else {
        game.scene.resume("scene-game");
        const gameScene = game.scene.getScene("scene-game");
        gameScene.points = 0;
        gameScene.textScore.setText("Score: 0");
        gameScene.timedEvent.reset({ delay: 30000, callback: gameScene.gameOver, callbackScope: gameScene, loop: false });
        gameScene.bgMusic.play();
    }
});

playAgainBtn.addEventListener("click", () => {
    gameEndDiv.style.display = "none";
    game.scene.start("scene-game");
    const gameScene = game.scene.getScene("scene-game");
    gameScene.points = 0;
    gameScene.textScore.setText("Score: 0");
    gameScene.timedEvent.reset({ delay: 30000, callback: gameScene.gameOver, callbackScope: gameScene, loop: false });
    gameScene.bgMusic.play();
});
