import "./style.css";
import Phaser from "phaser";

let game;

const sizes = {
	width: 500,
	height: 500,
};

const speedDown = 300;

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
		this.playerSpeed = speedDown + 50;
		this.apple;
		this.points = 0;
		this.textScore;
		this.textTime;
		this.timedEvent;
		this.remainingTime;
		this.coinMusic;
		this.bgMusic;
		this.emitter;
		this.poisonApple;
	}

	preload() {
		this.load.image("bg", "assets/bg.png");
		this.load.image("basket", "assets/basket.png");
		this.load.image("apple", "assets/apple.png");
		this.load.image("poisonApple", "assets/poisonApple.png");
		this.load.image("money", "assets/money.png");
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
		this.apple.setMaxVelocity(0, speedDown);

		this.poisonApple = this.physics.add
			.image(100, 0, "poisonApple")
			.setOrigin(0, 0);
		this.poisonApple.setMaxVelocity(0, speedDown);

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
			gravityY: speedDown - 200,
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

		this.emitter.stop();
	}

	update() {
		this.remainingTime = this.timedEvent.getRemainingSeconds();
		this.textTime.setText(
			`Remaining Time: ${Math.round(this.remainingTime).toString()}`
		);

		if (this.apple.y >= sizes.height) {
			this.apple.setY(0);
			this.apple.setX(this.getRandomX());
		}

		if (this.poisonApple.y >= sizes.height) {
			this.poisonApple.setY(0);
			this.poisonApple.setX(this.getRandomX());
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
		this.points++;
		this.textScore.setText(`Score: ${this.points}`);
	}

	poisonHit() {
		this.poisonApple.setY(0);
		this.poisonApple.setX(this.getRandomX());
		if (this.points > 0) {
			this.points--;
		} else {
			this.points = 0;
			this.gameOver();
		}
		this.textScore.setText(`Score: ${this.points}`);
	}

	gameOver() {
		this.sys.game.destroy(true);
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
			gravity: { y: speedDown },
			debug: false,
		},
	},
	scene: [GameScene],
};

function startPhaserGame() {
	game = new Phaser.Game(config);
	game.scene.start("scene-game");
}

startPhaserGame();

gameStartBtn.addEventListener("click", () => {
	gameStartDiv.style.display = "none";
	game.scene.resume("scene-game");
});

playAgainBtn.addEventListener("click", () => {
	gameEndDiv.style.display = "none";
	game.destroy(true);
	startPhaserGame();
});
