//Arcade setup for basic Phaser game
    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: true
            
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config);

    var gameOver = false;
    var cursors;
    var gun;
    var score = 0;
    var scoreText;
    var level = 1;
    var mineFrequency = 700;
    

function preload () 
{
    this.load.image('mine', 'assets/mine.png');
    this.load.spritesheet('enemy', 'assets/enemy.png',{ frameWidth: 102.5, frameHeight: 48});
    this.load.image('ship', 'https://opengameart.org/sites/default/files/ship_14.png');
    this.load.image('space', 'assets/space.png');
    this.load.image('gun', 'assets/gun.png');
}

function create ()
{
    this.space = this.add.tileSprite(0, 0, 800, 600, 'space').setOrigin(0, 0);

    cursors = this.input.keyboard.createCursorKeys();

    player = this.physics.add.image(400, 500, 'ship').setScale(0.3);
    player.setCollideWorldBounds(true);

    scoreText = this.add.text(16, 16, `score: ${score}`, { fontSize: '32px', fill: '#090' });

    //Why is this animation not working?
    this.anims.create(
        {
        key: 'flap',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
        frameRate: 13,
        repeat: -1
        });

    //making a physics group for guns
    guns = this.physics.add.group()

    //making a function that can be called to shoot
    function shoot () {
        gun = guns.create(player.x, player.y, 'gun').setScale(.6);
        gun.setVelocityY(-300);
  }
    //making a time loop for shooting
    const shootingLoop = this.time.addEvent({
        delay: 500,
        callback: shoot,
        callbackScope: this,
        loop: true,
    }); 

    //Generate Enemies
    enemies = this.physics.add.group();
    genEnemies();

    //destroying enemies
    this.physics.add.collider(guns, enemies, function (gun, enemy) {
        gun.destroy();
        enemy.destroy();
        score = score + 10;
        scoreText.setText(`score: ${score}`);
        if (enemies.countActive(true) === 0) {
            level++
            for(let i = 0; i<level; i++) {
                genEnemies();
            }
            mineFrequency += 150;
        }
    })
    
    mines = this.physics.add.group()

    const dropMine = () => {
        let randomEnemy = Phaser.Utils.Array.GetRandom(enemies.getChildren());
        mines.create(randomEnemy.x, randomEnemy.y, 'mine').setScale(0.05).setGravityY(250);
    }

    //making a time loop for bombing
    const mineLoop = this.time.addEvent({
        delay: mineFrequency,
        callback: dropMine,
        callbackScope: this,
        loop: true,
    });

    this.physics.add.collider(player, mines, () => {
        gameOver = true;
        this.physics.pause();
        this.add.text(300, 400, `GAME OVER`, { fontSize: '42px', fill: '#090' });
        mineLoop.destroy();
        player.setTint(0xff0000);
    })
}

function update () 
{        
    //scroll through the background of stars
    if (gameOver) 
    {
        this.space.tilePositionY -=3;
    } else 
    {
        //Move the Ship
        player.setVelocity(0);
        var speed = 200;
        
        if (cursors.left.isDown)
        {
            player.setVelocityX(-speed);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(speed);
        }
        if (cursors.up.isDown)
        {
            player.setVelocityY(-speed);
        }
        else if (cursors.down.isDown)
        {
            player.setVelocityY(speed);
        }
        this.space.tilePositionY -=3;
        return;
    }

}

function genEnemies() {
    for (let i = 1; i<=10; i++) {
        let enemyHeight = Phaser.Math.FloatBetween(70, 200);
        var enemy = enemies.create(40 + (i*70), enemyHeight, 'enemy').setScale(.5).play('flap');
        let enemySpeed = Phaser.Math.FloatBetween(-100, 100);
        enemy.setVelocityX(enemySpeed);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1);
        enemy.setTint(Phaser.Math.FloatBetween(100000,1000000000000000));
        }
}

