/**
 * @file  "Herding Cats", a simple in-browser game.
 *      Objective: Use dog sprite to herd cats into a box
 *      while avoiding the traps. 
 *      Level Progression: Positive points are awarded for
 *      cats reaching the box, and points are taken 
 *      away for cats being trapped. When all cats have 
 *      been herded or trapped, the playing field is 
 *      reset with additional traps.
 *      End State: The game ends when the player has negative
 *      points. The final score is the highest level 
 *      reached by the player. 
 * @author Eira Stone <stone.eira@gmail.com>
 */

//GLOBAL VARIABLES

/**
 * <div> that holds all elements.
 * @type {div}
 */
var container;
/**
 * Displays score in document.
 * @type {string}
 */
var scoreText;  
/**
 * Size in px of play area.
 * @type {int}
 */
var gameSize;   
/**
 * Proximity in px cats will react
 * @type {int}
 */
var prox;
/**
 * Visible marker for playable area.
 * @type {div}
 */
var border;     
/**
 * Player's score, how many successfully caught cats.
 * @type {int}
 */
var score;      
/**
 * How many cats have been removed from play, by box or trap.
 * @type {int}
 */
var goneCats;   
/**
 * How many traps this level spawns.
 * @type {int}
 */
var difficulty; 

/**
 * User's controllable sprite.
 * @type {sprite}
 */
var player;
/**
 * Array of spawned AI cats
 * @type {sprite[]}
 */
var AIcats;
/**
 * Array of spawned traps
 * @type {item[]}
 */
var traps;
/**
 * Goal for cats to reach
 * @type {item[]}
 */
var goalBox;   

/**
 * On load, set up empty playing field.
 * @function
 */
window.onload = function(){
    //VARIABLES
     container = document.getElementById('container');
     scoreText = document.getElementById('scorebox');

     //Create playing field
     goneCats = 0;
     /**
      * Can be changed so long as container is also changed.
      */
     gameSize = 600;

     /**
      * @todo Address placement of caught cats outside playing field so they 
      *     no longer react to a dog within proximity once caught. After this fix,
      *     proximity can be increased along with traps per level for more difficulty.
      */
     prox = 75;

     //Visible border
     border = document.createElement('div');
        border.style.width = gameSize + "px";
        border.style.height = gameSize + "px";
        border.style.border = "5px solid";
        border.style.position = "absolute";
        border.style.backgroundImage= "url(\"images/grassBG.png\")";
        container.appendChild(border);

    //Score automatically set to 0 on game start
     score = 0;
    /**
     * Popup message for player before game starts.
     */
     if(window.confirm("Oh no! The cats are loose in a dangerous area!"+ 
                        "\nUse arrow keys to move. Herd cats into the box to teleport them to safety." +
                        "\nStart game?")){
        difficulty = 1;
        gameStart(difficulty);
     }

}

/**
 * Clears board of player, cats, and traps and starts new game
 * @function
 */
function clearBoard(){
    //Remove Player
    container.removeChild(this.player.canvas);
    this.player = null;

    //Remove Cats
    for(i = 0; i < this.AIcats.length; i++){
        container.removeChild(this.AIcats[i].canvas);
    }
    this.AIcats = null;
    goneCats = 0;

    //Remove Traps
    for(i = 0; i < this.traps.length; i++){
        container.removeChild(this.traps[i].img);
    }
    this.traps = null;

    //Remove goal
    container.removeChild(this.goalBox.img);
    this.goalBox = null;

    //Reset game or progress to new level depending on score
    /*TODO: Add end screen for user to see if they choose not
    to play again or progress their level. */
    if(score < 0){
        score = 0;
        if(window.confirm("Game Over!"+ 
        " Highest level: " + difficulty +
        "\nPlay again?")){
            gameStart();
        }
    }
    else{
        if(window.confirm("Good Job!"+ 
        "\nNext Level?")){
            difficulty += 2;
            gameStart(difficulty);
        }
    }
}

/**
 * Set up sprites and game functions.
 * @function
 * @param {int} diff - Difficulty of level.
 */
function gameStart(diff) {

    /**
     * Generates the player with a dog sprite in the upper left hand corner.
     */
    player = new sprite("dogB", 15, 0, 6, 0, 0, 1000); 
    AIcats = [];                                      
    traps = [];
    /**
     * Generates the goal box at a random position on the field. 
     */                                       
    goalBox = new item("box", randPos(), randPos());
     
    /**
     * @todo Add additional input options, including mobile friendly,
     *      as well as ability to move diagonally across game board.
     */
    document.onkeydown = movePlayer;              //Keyboard control

    /**
     * @todo Add different amount of cats per difficulty.
     */
    generateCats(5);
    generateTraps(diff);

    //CONSTRUCTORS

    /**
     * Returns random value within bounds of game field.
     */
    function randPos(){
        return Math.floor(Math.random() * ((gameSize - 64) - 64)) + 64;
    }

    /**
     * Sprite Constructor.
     * @constructor 
     * @param {string} animal - Determines sprite (dog, cat, or fox).
     * @param {int} xPos - How many px left the sprite is.
     * @param {int} yPos - How many px down the sprite is.
     * @param {int} speed - How many px the sprite moves per step.
     * @param {int} direc - Which coordinates of the spritesheet to use for animation.
     * @param {int} idNum - Identifying number.
     * @param {int} zIndex - CSS z-index.
     */
    function sprite(animal, xPos, yPos, speed, direc, idNum, zIndex) {
        this.animal =   animal;
        this.xPos =     xPos; 
        this.yPos =     yPos; 
        this.speed =    speed; 
        this.direc =    direc; 
        this.idNum =    idNum;
        this.count =    0;
        this.img = document.createElement("img");
        this.img.src = "images/" + this.animal + "SpriteSheet.png";

        //Create sprite canvas
        this.canvas =                   document.createElement('canvas');
        this.canvas.width =             gameSize + 150;
        this.canvas.height =            gameSize;
        this.canvas.style.position =    "absolute";
        this.canvas.style.zIndex =      zIndex;
        this.canvas.id =                this.animal + idNum;
        container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
       
        drawSprite(this);
    }
    
    /**
     * 
     * @param {int} number - How many cats to spawn.
     */
    function generateCats(number){
        for (i = 0; i < number; i++){
            AIcats[i] = new sprite("cat", randPos(), randPos(), 7, 256, i, "auto");
        }
    }
    
    /**
     * @param {*} number - How many traps to spawn.
     */
    function generateTraps(number){
        for (k = 0; k < number; k++){
            traps[k] = new item("spikes", randPos(), randPos());
        }
    }

    /**
     * Constructor for traps and goal box.
     * @constructor
     * @param {string} itemType - Box or trap, determines image. 
     * @param {int} xPos - How many px left the item is.
     * @param {int} yPos - How many px down the item is.
     */
    function item(itemType, xPos, yPos)
    {
        //Variables
        this.xPos =     xPos;
        this.yPos =     yPos;
        this.itemType = itemType;
        this.img =      document.createElement("img");
        this.img.src =  "images/" + this.itemType + ".gif";

        //Spawn
        this.img.style.position = "absolute";
        container.appendChild(this.img);
        this.img.style.top = this.xPos;
        this.img.style.left = this.yPos;

    }

    //ANIMATION

    /**
     * Animates the sprite onto the page using the spritesheet.
     * @function
     * @param {sprite} guy - The sprite to animate.
     */
    function drawSprite(guy){
        setInterval(function() {
            /**
             * Clears the sprite's canvas so the next frame can be drawn.
             */
            guy.ctx.clearRect(0, 0, guy.canvas.width, guy.canvas.height);
            /**
             * Draws the next frame of the sprite onto the canvas in the correct location.
             */
			guy.ctx.drawImage(guy.img,
            guy.count * 64, guy.direc, 
            64, 64, 
			guy.xPos, guy.yPos, 64, 64);
            guy.count = (guy.count + 1) % 4;
		}, 120);
    }

    // MOVEMENT
    /**
     * Identify keypress and move player in appropriate direction.
     * @param {*} e 
     */
    function movePlayer(e) {
		switch(e.keyCode){
			//Left arrow is being pushed
			case 37:
				runLeft(player);
				break;
			//Right arrow is being pushed
			case 39:
				runRight(player);
				break;
			//Up arrow is being pushed
			case 38:
				runUp(player);
				break;
			//Down arrow is being pushed
			case 40:
				runDown(player);
				break;
        }
        
        //Every movement, check for cats
        for(j = 0; j < AIcats.length; j++)
            checkProximity(player, AIcats[j]);
    }

    /**
     * Move the sprite left.
     * @param {sprite} sprite 
     */
    function runLeft(sprite){
        sprite.direc = 192;
        sprite.xPos -= sprite.speed;
        if(sprite.xPos <= 0){
            sprite.xPos = 0;
            //Prevent cats from becoming inaccesible
            if(sprite.animal == "cat")
                sprite.xPos += 32;
        }
    }
    /**
     * Moves the sprite right. 
     * @param {sprite} sprite 
     */
    function runRight(sprite){
        sprite.direc = 64;
        sprite.xPos += sprite.speed;
		if(sprite.xPos >= (gameSize - 64)){
            sprite.xPos = gameSize - 64;
            //Prevent cats from becoming inaccesible
            if(sprite.animal == "cat")
                sprite.xPos -= 32;
        }
    }
    /**
     * Moves the sprite up
     * @param {sprite} sprite 
     */
    function runUp(sprite){
        sprite.yPos -= sprite.speed;
        sprite.direc = 128;
        if(sprite.yPos <= 0){
            sprite.yPos = 0;
            //Prevent cats from becoming inaccesible
            if(sprite.animal == "cat")
                sprite.yPos += 32;
        }
    }
    /**
     * Moves the sprite down.
     * @param {sprite} sprite 
     */
    function runDown(sprite){
        sprite.yPos += sprite.speed;
        sprite.direc = 0;
		if(sprite.yPos >= (sprite.canvas.offsetHeight - 64)){
            sprite.yPos = sprite.canvas.offsetHeight - 64;
            //Prevent cats from becoming inaccesible
            if(sprite.animal == "cat")
                sprite.yPos -= 32;
        }
    }
    
    //AI Behavior

    /**
     * Determines if two sprites are close to one another and tells the
     *      prey sprite how to run away, if necessary.  
     * @param {sprite} pred 
     * @param {sprite} prey - The sprite that wants to be at least a certain distance away from the other.
     */
    function checkProximity(pred, prey){
        var xDiff = pred.xPos - prey.xPos;
        var yDiff = pred.yPos - prey.yPos;
        //If two sprites are within the defined proximity, 
        //the "prey" sprite runs away unpredictably 
        if((xDiff > -prox && xDiff < prox)&&(yDiff > -prox && yDiff < prox)){
            //Prey more likely to run away on the X-axis
            //if they are closer on the X-axis
            if(Math.abs(xDiff) < Math.abs(yDiff)){
                if (Math.random() > 0.7) 
                    xDiff > 1 ? runLeft(prey) : runRight(prey);
                else
                    yDiff > 1 ? runUp(prey) : runDown(prey);
            }
            else{
                if (Math.random() > 0.7) 
                    yDiff > 1 ? runUp(prey) : runDown(prey);    
                else
                    xDiff > 1 ? runLeft(prey) : runRight(prey);
            }
            //Check for collisions
            if(collision(prey, goalBox)){
                score += 2;
                captured(prey);
            }
            for(n = 0; n < traps.length; n++)
            {
                if(collision(prey, traps[n])){
                    score--;
                    if(score < 0)
                        clearBoard();
                    prey.canvas.style.display= "none";
                    captured(prey);
                    break;
                }
            }
        }
        else
            //Resting animation
            prey.direc = 256;
    }
    /**
     * The cat is captured by the box, increasing the score and removing the cat from play.
     * @param {sprite} guy - Captured cat.
     */
    function captured(guy){
        guy.xPos = gameSize + 30;
        guy.yPos = 100 + 50 * guy.idNum;
        scoreText.innerHTML = "SCORE: " + score;
        goneCats++;
        //If there are no more cats, start next level. 
        if(goneCats == AIcats.length)
            clearBoard();

    }
    /**
     * Checks if a sprite is intersecting with an item.
     * @param {sprite} guy 
     * @param {item} item 
     */
    function collision(guy, item){
            if(((item.xPos - 42) < (guy.yPos + 11)) && ((guy.yPos + 11) < (item.xPos + item.img.width))
            && ((item.yPos - 42) < (guy.xPos + 11)) && ((guy.xPos + 11) < (item.yPos + item.img.height))){
                return true;
            }
            else if(((item.xPos - 30) > (guy.yPos + 11)) && ((guy.yPos + 11) > (item.xPos + item.img.width))
            && ((item.yPos - 30) > (guy.xPos + 11)) && ((guy.xPos + 11) > (item.yPos + item.img.height))){
                return true;
            }
            else
             return false;
    }
}
