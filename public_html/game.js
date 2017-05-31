var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * Template
 */
var IHateCoffee;
(function (IHateCoffee) {
    /*
     * Boot state for only loading the loading screen
     */
    var BootState = (function (_super) {
        __extends(BootState, _super);
        function BootState() {
            return _super.call(this) || this;
        }
        BootState.prototype.init = function () {
            // Set scale using ScaleManager
            // Set background color
        };
        BootState.prototype.preload = function () {
            // Load loading screen image
        };
        BootState.prototype.create = function () {
            // Start true loading state
            this.game.state.start("PreloadState");
        };
        return BootState;
    }(Phaser.State));
    IHateCoffee.BootState = BootState;
    /*
     * Preload state for actually loading assets
     */
    var PreloadState = (function (_super) {
        __extends(PreloadState, _super);
        function PreloadState() {
            return _super.call(this) || this;
        }
        PreloadState.prototype.preload = function () {
            // Display the loading screen image
            // Load assets
        };
        PreloadState.prototype.create = function () {
            this.game.state.start("GameState");
        };
        return PreloadState;
    }(Phaser.State));
    IHateCoffee.PreloadState = PreloadState;
    // used for controlling player's movement
    var Direction;
    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Right"] = 1] = "Right";
    })(Direction = IHateCoffee.Direction || (IHateCoffee.Direction = {}));
    /*
     * The main game running state
     */
    var GameState = (function (_super) {
        __extends(GameState, _super);
        function GameState() {
            var _this = _super.call(this) || this;
            // input
            _this.isAcceptingMovementInput = true; // if the player dies, for example
            _this.numberOfLives = 5;
            return _this;
        }
        GameState.prototype.create = function () {
            var _this = this;
            // use arcade physics
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.gravity.y = 250;
            // create ground
            var groundBitMapData = this.game.add.bitmapData(this.game.width, 32);
            groundBitMapData.rect(0, 0, groundBitMapData.width, groundBitMapData.height, "rgb(70, 73, 72)");
            this.game.cache.addBitmapData("ground", groundBitMapData);
            this.ground = this.game.add.sprite(0, this.game.height - groundBitMapData.height, this.game.cache.getBitmapData("ground"));
            // change ground's properties to be an arcade physics object
            this.game.physics.arcade.enable(this.ground);
            this.ground.body.immovable = true;
            this.ground.body.allowGravity = false;
            // create player sprite
            var playerBitMapData = this.game.add.bitmapData(32, 64);
            playerBitMapData.rect(0, 0, playerBitMapData.width, playerBitMapData.height, "rgb(255, 255, 255");
            this.game.cache.addBitmapData("player", playerBitMapData);
            this.player = this.game.add.sprite(10, 10, this.game.cache.getBitmapData("player"));
            // add physics body to player
            this.game.physics.arcade.enable(this.player);
            this.player.body.collideWorldBounds = true;
            // create coffee sprite
            var coffeeBitMapData = this.game.add.bitmapData(32, 32);
            coffeeBitMapData.rect(0, 0, coffeeBitMapData.width, coffeeBitMapData.height, "rgb(80, 44, 10");
            this.game.cache.addBitmapData("coffee", coffeeBitMapData);
            // create group for coffees for collision
            this.coffeeGroup = this.game.add.group();
            // timer for spawning falling coffees
            var timer = this.game.time.create(false);
            timer.loop(400, function () {
                var coffee = _this.game.add.sprite(_this.game.rnd.integerInRange(0, _this.game.width - 32), 0, _this.game.cache.getBitmapData("coffee"));
                // add physics body to coffee sprite
                _this.game.physics.arcade.enable(coffee);
                // add coffee to its coffeeGroup
                _this.coffeeGroup.add(coffee);
                // create a second timer that will destory the sprite after its lifetime
                var destoryTimer = _this.game.time.create(true);
                destoryTimer.loop(2700, function () { return coffee.destroy(); }, _this);
                destoryTimer.start();
            }, this);
            timer.start();
            // create hearts to represent health
            // first, use a red placeholder sprite
            var heartBitMapData = this.game.add.bitmapData(32, 32);
            heartBitMapData.circle(16, 16, 16, "rgb(236, 11, 25");
            this.game.cache.addBitmapData("heart", heartBitMapData);
            // testing
            //let heart = this.game.add.sprite(32, 32, this.game.cache.getBitmapData("heart"));
            // display hearts based on number of lives available initially
            this.livesGroup = this.game.add.group();
            for (var i = 0; i < this.numberOfLives; i++) {
                this.livesGroup.create((i + 40) * i, 32, this.game.cache.getBitmapData("heart"));
            }
            // add WASD controls
            this.controlKeys = this.game.input.keyboard.addKeys({ "left": Phaser.KeyCode.A, "right": Phaser.KeyCode.D });
        };
        /*
         * used for controlling the player's movement, left or right
         */
        GameState.prototype.controlPlayer = function (direction) {
            // if the player is dead or if switching to another state, then don't accept keypress
            if (!this.isAcceptingMovementInput) {
                return;
            }
            if (direction === IHateCoffee.Direction.Left) {
                this.player.body.velocity.x = -GameState.MOVEMENT_VELOCITY;
            }
            else if (direction === IHateCoffee.Direction.Right) {
                this.player.body.velocity.x = GameState.MOVEMENT_VELOCITY;
            }
        };
        /*
         * we'll just poll for keyboard input to control the player using the keys object
         */
        GameState.prototype.pollControllInput = function () {
            if (this.controlKeys.left.isDown) {
                this.controlPlayer(IHateCoffee.Direction.Left);
            }
            else if (this.controlKeys.right.isDown) {
                this.controlPlayer(IHateCoffee.Direction.Right);
            }
        };
        GameState.prototype.coffeePlayerCollisionCallback = function (player, coffee) {
            // for now, just do a little tween and decrement hearts
            var tween = this.game.add.tween(coffee.scale).to({ x: 0, y: 0 }, 1400, "Linear", true, 0, -1);
            tween.yoyo(true);
            // disable coffe's body
            coffee.body.enable = false;
            // remove a heart
            if (this.livesGroup.getFirstAlive()) {
                this.livesGroup.getFirstAlive().kill();
            }
        };
        GameState.prototype.update = function () {
            // collisions
            this.game.physics.arcade.collide(this.player, this.ground);
            this.game.physics.arcade.collide(this.player, this.coffeeGroup, this.coffeePlayerCollisionCallback, null, this);
            // stop the player's horizontal movement
            this.player.body.velocity.x = 0;
            // poll for the player's input
            this.pollControllInput();
        };
        return GameState;
    }(Phaser.State));
    GameState.MOVEMENT_VELOCITY = 350;
    IHateCoffee.GameState = GameState;
    var Game = (function () {
        function Game() {
            this.game = new Phaser.Game(550, 550, Phaser.AUTO, "phaser");
            /* The boot state will contain an init() for the scale manager and will load the loading screen,
             * while the preloader will display the loading screen and load assets and then start the main game state.
             */
            this.game.state.add("BootState", BootState, true);
            this.game.state.add("PreloadState", PreloadState);
            this.game.state.add("GameState", GameState);
        }
        return Game;
    }());
    IHateCoffee.Game = Game;
})(IHateCoffee || (IHateCoffee = {}));
window.onload = function () {
    var game = new IHateCoffee.Game();
};
