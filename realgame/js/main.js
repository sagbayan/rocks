//"use strict";
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
    console.log("Preload object called");
    //define variables first before calling this function!
    this.loadAssets = function (temp) {                 //call this function that will produce filled imageArray with loaded images
        console.log("loadassets called");
        var i, progress, assetImage;
        this.imageSrcArray = temp;
        progress = this.imageSrcArray.length;   //images are done loading when this is 0
        for (i = 0; i < this.imageSrcArray.length; i += 1) {
            assetImage = new Image();
            assetImage.onload = function () {
                progress -= 1;
                if (progress <= 0) {
                    this.loadingstatus;           //trigger loading status
                    this.loadingdone = 1;           //declare loading is done
                }
            };
            assetImage.src = this.domain + this.imageSrcArray[i];       //define src and alt text for images
            assetImage.alt = this.imageSrcArray[i];
            this.imageArray.push(assetImage);                           //push the image into the actual imageArray to be referenced to
            console.log("imagearray = " + Main.Preloader.imageArray);
        }
    };
};

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Game begins here
----------------------------------------------------------*/
var Main = {};              //define main game object

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
helper functions within Main class
----------------------------------------------------------*/
var getImage = function (preloaderobject, string_name) {                                          //function that will return the Image() file src from preloaded array when needed
    var e1, e2, e3;
    e1 = preloaderobject;
    e2 = preloaderobject.imageSrcArray;
    e3 = e2.indexOf(string_name);     //find the index of the image you are looking for by filename
    console.log(e1.imageArray[e3]);
    return e1.imageArray[e3];
};

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Define the main flow of the game!
----------------------------------------------------------*/
Main.pipeline = function () {         //this function contains the entire game and is called to start the game
    console.log("pipeline called");
    Main.ready = 0;                    //declare the game not ready to go
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to preload the game
    ----------------------------------------------------------*/
    Main.preload = function () {
        console.log("preload running");
        Main.Preloader = new Preloader();                 //create object to load assets and resources
        Main.Preloader.domain = "res/images/";              //tell the object where the asset folder is located
        Main.Preloader.loadAssets(imageSrcArrayReference);  //provide image source array containing string filepath+filenames
        Main.Preloader.loadingstatus = Main.Init();           //define the callback trigger to the init function.  when it turns 1, it'll activate the init function
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to initialize the game
    ----------------------------------------------------------*/
    Main.Init = function () {         //this function initializes the game.
        console.log("init called");
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
        Main.menuInitialized = 0;    //tells if the menu is initialized or not.  starts at 0.
        Main.menuObjectArray = [];   //array that holds all the objects in a menu
        
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
        
        //define objects to be used in the game
        Main.Object = function (str_name, str_canvasParentid, str_imagename) {
            this.name = str_name;                          //identifying class name of object (from CSS)
            this.canvasIndex = 0;                    //will assign index #.
            this.initialized = 0;                    //state that tells if the object has been initialized yet.  starts at 0
            this.canvasParentid = str_canvasParentid;//parent element of the canvas.  tells where canvas should be on html
            this.imagename = str_imagename;                     //filename of image of object
            this.image = 0;                          //actual image from getImage function
            
            while (this.initialized != 1) {
                var e1;                                                      //create the canvas          
                e1 = document.createElement("canvas");
                e1.className = this.name;
                document.getElementById(this.canvasParentid).appendChild(e1);       //appendChild canvas to the parent you gave
                this.canvas = e1;
                this.image = getImage(Main.Preloader, this.imagename);                              //define the image
                this.initialized = 1;
                console.log(this.name," has been initialized");
            }
            if (this.initialized === 1) {                                 //if object is initialized...
                console.log("reeeee");
                this.draw = function () {
                    var ctx = this.canvas.getContext("2d");
                    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
                };
            }
        };
        
        //functions to process input///////////////////////////////////
        Main.mineOre = function (tier, strength, amount) {                       //the method for clicking ONCE
            var e1, chance_iron, chance_copper;
            e1 = Math.random();                                     //roll a random decimal between 0-1
            if (tier === 1) {                                        //determine possible ore and probability based on tier of player/miner
                chance_iron = e1 < 0.25;
                chance_copper = e1 >= 0.25;
                if (chance_iron) {                             //if dice roll wins iron
                    Main.material_ore_iron += strength * amount;
                } else if (chance_copper) {                         //if dice roll wins copper
                    Main.material_ore_copper += strength * amount;
                }
            }
        };
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Menu initialization functions
        ----------------------------------------------------------*/
        Main.buildMenu = function (statemenu) {             //function to initialize objects for a menu.  Only call if menuinitialized = 0
            Main.menuTotalObjects = 0;                       //total amount of objects needed to be loaded on a given menu
            Main.menuObjectArray = [];                      //clear the menu object array
            if (statemenu === 0) {                              //if requested to initialize mining menu...
                Main.menuTotalObjects = 1;                  //number of objects that need to be loaded for this specific menu
                var e1 = new Main.Object("rock", "StageRight_1", "rock.png");       //assign each variable to a different object
                if (e1.initialized) {
                    Main.menuObjectArray.push(e1);          //put the object into the menuobject array
                }
                if (Main.menuObjectArray.length === Main.menuTotalObjects) {    //if all necessary objects are loaded into array
                    Main.menuInitialized = 1;               //declare menu is initialized    
                }
                
            }
        };
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        COMPLETE INITIALIZATION
        ----------------------------------------------------------*/
        Main.ready = 1;             //declare the game ready to go
        Main.Loop();               //start the main game loop
        Main.Render();             //start the rendering loop
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to receive and process input
    ----------------------------------------------------------*/
    Main.Engine = function () {     //this function listens for input and then processes it to change variables
        // listen for inputs
        
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
        //Draw object canvases
        if (Main.stateMenu === 0) {         //game is on the mining screen
            if (!Main.menuInitialized) {            //if menu is not initialize, initialize it
                Main.buildMenu(0);
            } else {                                //if it is, then perform the draw function on all objects
                var i;
                for (i = 0; i < Main.menuObjectArray.length; i += 1) {
                    Main.menuObjectArray[i].draw();
                }
            }
        }
        //console.log(Main.menuObjectArray[0].draw);
        Main.tickRender += 1;        // add to tick count
        window.requestAnimationFrame(Main.Render);
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method for running one frame of the actual game
    ----------------------------------------------------------*/
    Main.Loop = function () {       //this function runs the engine (and draw, if needed) in relation to Timer
        Main.Engine();              //run engine
        //add time compensation methods if needed
        Main.TickLoop += 1;         //add to tick count
        setTimeout(Main.Loop, 1000 / Main.framerate);     //declare the loop to repeat, at interval equal to length of one game frame (inverse of framerate)
    };
};

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Game is called here!
----------------------------------------------------------*/
Main.pipeline();                    //boot that shit up
console.log("started");

window.onload = function () {
    console.log("window.onload called");
    if (!Main.ready) {
        Main.preload();
        console.log("preload called", Main.ready);
    }
};