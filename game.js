score = 0;
immunity = 100;

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  heigth: 1000,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false,
    },
  }
};

game = new Phaser.Game(config);

function preload() { 
    
  // Loading all the images    

  this.load.image('background', 'assets/images/background.png');
  this.load.image('spike', 'assets/images/spike.png');
  this.load.image("fullscreen", "assets/images/fullsc.png");
  this.load.image("corona","assets/images/v2.png");
  this.load.image("jem","assets/images/jem.png");
  this.load.image("river","assets/images/river.png");
  this.load.image("gameover","assets/images/gameover.jpg");
  this.load.image("vaccine","assets/images/vaccine.png");
  this.load.image("win","assets/images/win.jpg");
    
  // Loading Audios    
    
  this.load.audio("jemEat", "assets/audio/jemAudio.mp3");
  this.load.audio("gameoveraudio", "assets/audio/gameover.mp3");
    
  // Loading our player
    
  this.load.atlas('player', 'assets/images/kenney_player.png','assets/images/kenney_player_atlas.json');
    
  // Loading tilesheet and JSON file  
    
  this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
  this.load.tilemapTiledJSON('map', 'assets/tilemaps/level4.json');

}

function create() { 
    
    // Creating audio objects
    
    this.fx = this.sound.add('jemEat');
    this.gameoveraudio = this.sound.add('gameoveraudio');
    
    // Creating game background assets using tilemap
    
    const backgroundImage = this.add.image(0, 0,'background').setOrigin(0, 0);
    backgroundImage.setScale(8, 0.8);
    map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('kenny_simple_platformer', 'tiles');
    const platforms = map.createStaticLayer('Platforms', tileset, 0, 0);
    platforms.setCollisionByExclusion(-1, true);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // Creating our player
    
    this.player = this.physics.add.sprite(50, 300, 'player');
    this.player.setBounce(0.1);
    this.player.body.setSize(55, 75).setOffset(20,25);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);
    
    // Creating animation in our player
    
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {
            prefix: 'robo_player_',
            start: 2,
            end: 3,
        }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'player', frame: 'robo_player_0' }],
        frameRate: 10,
    });
    
    this.anims.create({
        key: 'jump',
        frames: [{ key: 'player', frame: 'robo_player_1' }],
        frameRate: 10,
    });
    
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Creating spikes in our game world
    
    this.spikes = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });
    const spikeObjects = map.getObjectLayer('spikes')['objects'];
    spikeObjects.forEach(spikeObject => {
        const spike = this.spikes.create(spikeObject.x, spikeObject.y - 60, 'spike').setOrigin(0, 0);
        spike.body.setSize(spike.width, spike.height - 20).setOffset(0, 20);
    });
    // Adding collision between player and spikes
    this.physics.add.collider(this.player, this.spikes, playerHit, null, this);
    
    
    
    // Creating jems in our game world
    this.jems = this.physics.add.group({
        allowGravity: false,
    });
    jemObjects = map.getObjectLayer('jems')['objects'];
    jemObjects.forEach(jemObject => {
         jem = this.jems.create(jemObject.x, jemObject.y - 50, 'jem').setOrigin(0, 0);
    });
    // Adding collision between player and jems
    this.physics.add.collider(this.player, this.jems, point, null, this);
    
    // Creating rivers in our game world
    
    this.rivers = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });
    riverObjects = map.getObjectLayer('river')['objects'];
    riverObjects.forEach(riverObject => {
         river = this.rivers.create(riverObject.x, riverObject.y - 50, 'river').setOrigin(0, 0);
    });
    // Adding collision between player and rivers
    this.physics.add.collider(this.player, this.rivers, playerHit, null, this);
    
    // Creating corona virus objects
    
     this.coronas = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });
    coronaObjects = map.getObjectLayer('corona')['objects'];
    coronaObjects.forEach(coronaObject => {
         corona = this.coronas.create(coronaObject.x, coronaObject.y - 50, 'corona').setOrigin(0, 0);
        corona.setScale(0.1,0.1);
        corona.setBounce(1);
        corona.setVelocityY(100);
        corona.setCollideWorldBounds(true);
    });
    // Adding collision between player and corona object
    this.physics.add.collider(this.player, this.coronas, immunityLoss, null, this);
    
    
    // Text space for score
    
    this.scoreText = this.add.text(16, 16, 'Score: '+score, { fontSize: '32px', fill: '#FF0000' });
    this.scoreText.setScrollFactor(0);
    
    
    // Text space for immunity
    this.immunityText = this.add.text(16, 50, 'Immunity: '+immunity, { fontSize: '32px', fill: '#FF0000' });
    this.immunityText.setScrollFactor(0);
    
    // Creating vaccine
    
    this.vaccine = this.physics.add.sprite(6300, 300, 'vaccine');
    this.vaccine.body.allowGravity = false;
    this.vaccine.setScale(0.15,0.15);
    this.physics.add.collider(this.player, this.vaccine, win, null, this);
    
    // Creating camera to follow the player

    this.cameras.main.startFollow(this.player, true, true);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // Button for full screen mode
    
    var button = this.add.image(780, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();
    button.setScale(0.1,0.1);
    button.setScrollFactor(0);
    
    button.on('pointerup', function () {

            if (this.scale.isFullscreen)
            {
                this.scale.stopFullscreen();
            }
            else
            {
                button.setFrame(1);
                this.scale.startFullscreen();
            }

        }, this);
    }


function update() {
    
    // Checking condition for game to over
    if(immunity == 0){
        game.destroy();
        gameoverImage = this.add.image(0, 0,'gameover').setOrigin(0, 0);
        gameoverImage.setScrollFactor(0);
        gameoverImage.setScale(0.82,0.92);
        gameoverText = this.add.text(170, 500, 'You have lost the battle against corona', { fontSize: '20px', fill: '#FFFFFF' });
        gameoverText.setScrollFactor(0);
        finalScore = this.add.text(230, 530, 'Final Score: '+score, { fontSize: '40px', fill: '#FFFFFF' });
        finalScore.setScrollFactor(0);
    }
    
    // Checking for input by player
    if (this.cursors.left.isDown){
        this.player.setVelocityX(-200);
        
        if (this.player.body.onFloor()) {
            this.player.play('walk', true);
        }
    } 
    
    else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
        
        if (this.player.body.onFloor()) {
            this.player.play('walk', true);
        }
    } 
    
    else {
        this.player.setVelocityX(0);
        
        if (this.player.body.onFloor()) {
            this.player.play('idle', true);
        }
    }


    if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
        this.player.setVelocityY(-600);
        this.player.play('jump', true);
    }
    if ((this.cursors.down.isDown) && !this.player.body.onFloor()) {
        this.player.setVelocityY(200);
        this.player.play('jump', true);
    }
    
    if (this.player.body.velocity.x > 0) {
        this.player.setFlipX(false);
    } 
    
    else if (this.player.body.velocity.x < 0) {
        this.player.setFlipX(true);
    }
}

// Function when there is a hit between player and river or player and spikes

function playerHit(player, spike) {
    this.gameoveraudio.play();
    this.scoreText.setText("Score: "+score);
    
    score -= 10;
    player.setVelocity(0, 0);
    player.setX(player.x - 1000);
    player.setY(300);
    player.play('idle', true);
    player.setAlpha(0);
    let tw = this.tweens.add({
        targets: player,
        alpha: 1,
        duration: 100,
        ease: 'Linear',
        repeat: 5,
    });
}

// Function called when a jem is collected

function point(player, jem){
    this.fx.play();
    jem.disableBody(true, true);
    score+=10;
    this.scoreText.setText("Score: "+score);
}

// Function called when player collides with corona object

function immunityLoss(player, corona){
    corona.disableBody(true, true);
    immunity-=10;
    this.immunityText.setText("Immunity: "+immunity);
    player.setVelocity(0, 0);
    player.play('idle', true);
    player.setAlpha(0);
    let tw = this.tweens.add({
        targets: player,
        alpha: 1,
        duration: 100,
        ease: 'Linear',
        repeat: 5,
    });
}

// Function called when the player gets the vaccine

function win(player, vaccine){
        game.destroy();
        win = this.add.image(0, 0, 'win').setOrigin(0, 0);
        //win.body.allowGravity = false;
        win.setScale(1.3,1.1 );
        winText = this.add.text(250, 70, 'WINNER....!', { fontSize: '70px', fill: '#FF6347' });
        winText.setScrollFactor(0);
        winText2 = this.add.text(250, 150, 'You have found the vaccine', { fontSize: '20px', fill: '#FFFFFF' });
        winText2.setScrollFactor(0);
}



