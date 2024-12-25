import { Scene } from 'phaser';

export class Main extends Scene {
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  score: number;
  scoreText: Phaser.GameObjects.Text | null = null;
  stars: Phaser.Physics.Arcade.Group | null = null;
  bombs: Phaser.Physics.Arcade.Group | null = null;
  gameOver: boolean = false;

  constructor() {
    super('Main');
    this.score = 0;
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add.image(400, 300, 'sky');

    const platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'dude');

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.physics.add.collider(this.player, platforms);

    this.cursor = this.input.keyboard?.createCursorKeys();

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.stars.children.iterate(function (child: any) {
      return child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    this.physics.add.collider(this.stars, platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this
    );

    this.scoreText = this.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      // fill: '#000',
    });

    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, platforms);
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      undefined,
      this
    );
  }

  update() {
    if (!this.cursor || !this.player) {
      return;
    }

    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play('left', true);
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursor.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectStar(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    star: any
  ) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText?.setText(`Score: ${this.score}`);

    if (this.stars?.countActive(true) === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.stars.children.iterate(function (child: any) {
        return child.enableBody(true, child.x, 0, true, true);
      });

      const x =
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb = this.bombs?.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  hitBomb(player: any, _bomb: any) {
    this.physics.pause();
    player.setTint(0xff0000);

    player.anims.play('turn');
    this.gameOver = true;
  }
}
