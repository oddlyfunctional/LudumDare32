var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

    //////////////////////////
    // Idéias para compactar o arquivo:
    // - enviar apenas uma string, com as palavras separadas por vírgula, e montar a estrutura aqui
    // - gzip
    game.load.json("words", "/data/words.json")
    //////////////////////////
}

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 2000;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
    //////////////////////////
    words = game.cache.getJSON('words');

    for (var keyCode = Phaser.Keyboard.A; keyCode <= Phaser.Keyboard.Z; keyCode++) {
      var key = game.input.keyboard.addKey(keyCode);
      key.onDown.add(addLetter, this);
    }

    var enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    enter.onDown.add(enterWord, this);

    var backspace = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
    backspace.onDown.add(deleteLetter, this);
    //////////////////////////
}

var words;
var letters = [];
//var score = 0;
var currentFirstLetter = 'H';

// Mudanças drásticas:
// - Estilo scrabble, o jogador ganha algumas letras e tem que formar palavras (difícil de implementar a seleção das letras)
// - (*** Curti!) Energia para usar as letras (ganha-se energia acertando inimigos ou com o tempo, então gastar uma palavra grande é um desperdício considerável)

// Idéias para desafios:
// - Acertar palavra com o número dado de letras
// - Três palavras seguidas com o mesmo número de letras (ou com uma letra de diferença entre cada uma, etc)
// - Chefão que joga palavras também (devem ser derrotadas com palavras iguais ou maiores)

// Ideias para bônus:
// - Apagar o backlog de palavras usadas (ou apenas as últimas X palavras)
// - Vida?
// - Energia?

function addLetter(key) {
  var letter = String.fromCharCode(key.keyCode);
  letters.push(letter);
}

function enterWord() {
  var word = letters.join('');
  var wordState = words[word];
  console.log(word);
  console.log(wordState);

  if (!word.startsWith(currentFirstLetter)) {
    console.log("Should start with a '" + currentFirstLetter + "'!");
  } else if (wordState == undefined) {
    console.log("Word doesn't exist!");
  } else if (!wordState) {
    words[word] = true;
    score += word.length;
    console.log("Score: "+ score);
    // Fire word!
  } else {
    console.log("Word already used!");
  }
  letters = [];
}

function deleteLetter() {
  letters.pop();
}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -800;
    }
}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}
