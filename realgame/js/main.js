/* eslint-env browser*/
/* jslint browser*/

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Helper/shortcut functions
----------------------------------------------------------*/
var imageSrcArrayReference = [      //reference for filenames for all images to be loaded
    "rock.png",
    "background_mines.png"
];
    

var Preloader = function () {                       //object that holds and loads assets and resources
    this.loadingstatus = 0;                         //trigger a function once loaded
    this.loadingdone = 0;                           //counts assets that have been queued up to load
    this.assetstoload = 0;                          //counts the assets to be loaded
    this.domain = "";                               //domain for assets.  will append filename of image in function
    this.imageSrcArray = [];                        //array that will contain strings of domain(filepath)+filename
    this.imageArray = [];                           //array that will contain actual Image() objects to be used by HTML
    
    //define variables first before calling this function!
    this.loadAssets = function () {                 //call this function that will produce filled imageArray with loaded images
        var i;
        var progress = this.imageSrcArray.length;   //images are done loading when this is 0
        for (i = 0; i < this.imageSrcArray.length; i += 1) {
            var assetImage = new Image();
            assetImage.onload = function () {
                progress -= 1;
                if (progress <= 0) {
                    this.loadingstatus();           //trigger loading status
                    this.loadingdone = 1;           //declare loading is done
                }
            };
            assetImage.src = this.domain + this.imageSrcArray[i];       //define src and alt text for images
            assetImage.alt = this.imageSrcArray[i];
            this.imageArray.push(assetImage);                           //push the image into the actual imageArray to be referenced to
        }
    }
}

var getImage = function (string_filename) {                                          //function that will return the Image() file src from preloaded array when needed
    var e;
    e = Main.Preloader.imageSrcArray.indexOf(Main.Preloader.domain + string_filename);     //find the index of the image you are looking for by filename
    return Main.Preloader.imageArray[e];
}

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Game begins here
----------------------------------------------------------*/
var Main = {};              //define main game object

Main.pipeline = function () {         //this function contains the entire game and is called to start the game
    "use strict";
    Main.ready = 0;                    //declare the game not ready to go
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to preload the game
    ----------------------------------------------------------*/
    Main.preload = function () {
        Main.Preloader = new Preloader();                 //create object to load assets and resources
        Main.Preloader.domain = "res/images/";              //tell the object where the asset folder is located
        Main.Preloader.loadingstatus = Main.Init;           //define the callback trigger to the init function.  when it turns 1, it'll activate the init function
        Main.Preloader.LoadAssets(imageSrcArrayReference);  //provide image source array containing string filepath+filenames
    }
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to initialize the game
    ----------------------------------------------------------*/
    Main.Init = function () {         //this function initializes the game.
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        VARIABLES AND FUNCTIONS
        ----------------------------------------------------------*/
        /* timers */
        Main.tickEngine = 0;         //tick-count for game engine frames
        Main.tickRender = 0;         //tick-count for draw frames
        Main.tickLoop = 0;           //tick-count for main game loop  
        Main.framerate = 60;         //define the FPS of the game
        
        /* game state tracking */
        Main.stateMenu = 0;          //what screen is the game on. 0 = mining
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Mining and shit
        ----------------------------------------------------------*/
        //lowest level currency
        Main.ore = 0;                //this is what you are playing the game for!
        Main.money = 0;                 //sell shit, get money, buy more shit
        
        //second level currency
        Main.material_ore_iron = 0;
        Main.material_refined_iron = 0;
        Main.material_ore_copper = 0;
        Main.material_refined_copper = 0;
        
        //player's click
        Main.player_mine_tier = 0;          //tier of mining ability (determines what ores can be mined)
        Main.player_mine_strength = 0;      //strength of mining ability (determines how many "mines" per in-game click)
        Main.player_mine_amount = 0;        //amount of cursors (determines how many in-game clicks per real-life click)
        
        //functions to receive input///////////////////////////////////
        
        
        //functions to process input///////////////////////////////////
        Main.mineOre = function (tier, strength, amount) {                       //the method for clicking ONCE
            var e1, chance_iron, chance_copper;
            e1 = Math.random();                                     //roll a random decimal between 0-1
            if (tier == 1) {                                        //determine possible ore and probability based on tier of player/miner
                chance_iron = e1 < .25; 
                chance_copper = e1 >= .25;    
                if (chance_iron) {                             //if dice roll wins iron
                    Main.material_ore_iron += strength * amount;
                }
                else if (chance_copper) {                         //if dice roll wins copper
                    Main.material_ore_copper += strength * amount;
                }
            }
            update_material_vars();
        }

        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        GRAPHICS
        ----------------------------------------------------------*/
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        COMPLETE INITIALIZATION
        ----------------------------------------------------------*/
        Main.ready = 1;             //declare the game ready to go
        //Main.Loop();               //start the main game loop
        //Main.Render();             //start the rendering loop
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to receive and process input
    ----------------------------------------------------------*/
    Main.Engine = function () {     //this function listens for input and then processes it to change variables
        // listen for input
        // call functions to change variables based on inputs
        // reset inputs
        Main.TickEngine += 1;       //add to tick count
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to render the game
    ----------------------------------------------------------*/
    Main.Render = function () {     //this function renders the game
        // do rendering functions
        // Main.drawbackgrounds()
        Main.TickRender += 1;        // add to tick count
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method for running one frame of the actual game
    ----------------------------------------------------------*/
    Main.Loop = function () {       //this function runs the engine (and draw, if needed) in relation to Timer
        Main.Engine();              //run engine
        //add time compensation methods if needed
        Main.TickLoop += 1;         //add to tick count
        setTimeout(Main.Loop, 1000 / Main.Framerate);     //declare the loop to repeat, at interval equal to length of one game frame (inverse of framerate)
    };
};

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Game is called here!
----------------------------------------------------------*/
Main.Pipeline();                    //boot that shit up

window.onload = function () {
    if (!Main.ready) {
        Main.Preload;
    }
}