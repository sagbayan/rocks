"use strict";
/* eslint-env browser*/
/* eslint-disable no-console */
/* jslint browser*/

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Helper/shortcut functions
----------------------------------------------------------*/
var imageSrcArrayReference = [      //reference for filenames for all images to be loaded
    "rock.png",
    "background_mines.png",
    "refinery_1.png",
    "button_mines.png",
    "button_refinery.png"
];
    

var Preloader = function () {                       //object that holds and loads assets and resources
    this.loadingstatus = function () {};                         //trigger a function once loaded
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
    //console.log(e1.imageArray[e3]);
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
        Main.time = new Date();      //date object
        Main.tickEngine = 0;         //tick-count for game engine frames
        Main.tickRender = 0;         //tick-count for draw frames
        Main.tickLoop = 0;           //tick-count for main game loop  
        Main.framerate = 60;         //define the FPS of the game
        
        /* game state tracking */
        Main.stateMenu = 0;          //what screen is the game on. 0 = mining
        Main.menuInitialized = 0;    //tells if the menu is initialized or not.  starts at 0.
        Main.menuObjectArray = [];   //array that holds all the objects in a menu
        Main.stateMenuChanging = 0;  //tells if the menu is currently being changed.
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Mining and shit
        ----------------------------------------------------------*/
        //lowest level currency
        Main.ore = 0;                //this is what you are playing the game for!
        Main.money = 0;                 //sell shit, get money, buy more shit
        
        //second level currency
        Main.material_ore_1_a = 0;
        Main.material_refined_1_a = 0;
        Main.material_ore_1_b = 0;
        Main.material_refined_1_b = 0;
        
        //player's click
        Main.player_mine_tier = 1;          //tier of mining ability (determines what ores can be mined)
        Main.player_mine_strength = 1;      //strength of mining ability (determines how many "mines" per in-game click)
        Main.player_mine_amount = 1;        //amount of cursors (determines how many in-game clicks per real-life click)
        
        //refinery
        Main.player_refinery_tier = 1;      //tier of refinery.  determines what ore can be smelted
        Main.player_refinery_rate = 1;      //rate per sec that ore is smelted
        Main.player_refinery_slotcount = 1; //number of smelting slots player can have
        Main.player_refinery_slotsArray = [];     //slots for smelting. object array holding slots
        
        
        //define objects to be used in the game
        Main.Object = function (objecttype, str_name, str_parentid, str_imagename, function_logic, function_draw) {
            this.objecttype = objecttype;               //determines type of object.  0 for image, 1 for text
            this.name = str_name;                          //identifying class name of object (from CSS)
            this.initialized = 0;                    //state that tells if the object has been initialized yet.  starts at 0
            this.parentid = str_parentid;//parent element of the canvas.  tells where canvas should be on html
            this.imagename = str_imagename;                     //filename of image of object
            this.image = 0;                          //actual image from getImage function
            this.logic = function_logic;                //function that will be performed every engine tick.  For image objects, this needs to update this.image!  For text, this just changes the value to go into text
            
            if (typeof this.logic === "undefined") {     //if they don't give a function for logic
                this.logic = function () {};
            }
            
            while (this.initialized !== 1) {
                var e1, e2;
                if (this.objecttype === 0) {    //if image       
                    e1 = document.createElement("canvas");
                    e1.className = this.name;
                    document.getElementById(this.parentid).appendChild(e1);       //appendChild canvas to the parent you gave
                    this.canvas = e1;
                    this.image = getImage(Main.Preloader, this.imagename);                              //define the image
                    this.initialized = 1;
                    console.log(this.name, " has been initialized");
                } else if (this.objecttype === 1) {     //if text
                    e1 = document.createElement("span");
                    e1.className = this.name;
                    e2 = document.createTextNode("<blank>");
                    e1.appendChild(e2);
                    document.getElementById(this.parentid).appendChild(e1);
                    this.textElement = e1;
                    this.textvalue = e1.textContent;
                    this.initialized = 1;
                } else if (this.objecttype === 2) {     //if container element (contains special object)
                    e1 = document.createElement("div");
                    e1.className = this.name;
                    document.getElementById(this.parentid).appendChild(e1);
                    this.initialized = 1;
                }
            }
            if (this.initialized === 1) {                                 //if object is initialized...                                      //perform these functions!
                if (this.objecttype === 0) {                                //if image, clear the canvas and draw this.image
                    this.draw = function () {
                        var ctx = this.canvas.getContext("2d");
                        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
                    };
                } else if (this.objecttype === 1) {
                    this.draw = function () {
                        this.textElement.textContent = this.textElement.textvalue;      //if text, update the text value
                    };
                } else if (this.objecttype === 2) {                     //if special, they must have given custom draw function
                    this.draw = function_draw;
                }
            }
        };
        
        //functions to process input///////////////////////////////////
        Main.mineOre = function (tier, strength, amount) {                       //the method for clicking ONCE
            var e1, chance_1_b, chance_1_a;
            e1 = Math.random();                                     //roll a random decimal between 0-1
            if (tier === 1) {                                        //determine possible ore and probability based on tier of player/miner
                chance_1_b = e1 < 0.25;
                chance_1_a = e1 >= 0.25;
                if (chance_1_b) {                             //if dice roll wins iron
                    Main.material_ore_1_b += strength * amount;
                } else if (chance_1_a) {                         //if dice roll wins copper
                    Main.material_ore_1_a += strength * amount;
                }
            }
        };
        
        /*
        coding scheme for Main.object_blank_logic = function (){
            //define variables
            //check if initialized
                //if not
                    //if interactable object
                        //check for listeners
                            //if they don't have them, add them
                            //set to initialized
                //if it is
                    //recalculate values controlled by listeners
        }
        */
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Object functions: Mining menu
        ----------------------------------------------------------*/
        
        Main.object_button_mines_logic = function () {
            var i, element_button;
            element_button = document.getElementsByClassName("button_mines");
            for (i = 0; i < element_button.length; i += 1) {
                if (!element_button[i].logicInitialized) {
                    if (!element_button[i].hasListener) {
                        element_button[i].addEventListener("click", function () {
                            Main.changeToMenu(0);
                        });
                        element_button[i].hasListener = 1;
                        element_button[i].logicInitialized = 1;
                    }
                }
            }
        };
        
        Main.object_button_refinery_logic = function () {
            var i, element_button;
            element_button = document.getElementsByClassName("button_refinery");
            for (i = 0; i < element_button.length; i += 1) {
                if (!element_button[i].logicInitialized) {
                    if (!element_button[i].hasListener) {
                        element_button[i].addEventListener("click", function () {
                            Main.changeToMenu(1);
                        });
                        element_button[i].hasListener = 1;
                        element_button[i].logicInitialized = 1;
                    }
                }
            }
        };
        
        Main.object_rock_logic = function () {
            var i, element_rock;
            element_rock = document.getElementsByClassName("rock");
            for (i = 0; i < element_rock.length; i += 1) {
                if (!element_rock[i].logicInitialized) {
                    if (!element_rock[i].hasListener) {
                        element_rock[i].addEventListener("click", function () {
                            Main.mineOre(Main.player_mine_tier, Main.player_mine_strength, Main.player_mine_amount);
                            console.log(Main.material_ore_1_a);
                        });
                        element_rock[i].hasListener = 1;
                        element_rock[i].logicInitialized = 1;
                    }
                }
            }
        };
        
        //refinery, refinery slots
        Main.object_refineryslot_logic = function (target_object_refineryslot) {
            var target, parentdiv, div0, div1, div2, div3, div4, div0_span;
            target = target_object_refineryslot;             //define the target refineryslot object (it's a Main.object_refineryslot)
            parentdiv = document.getElementById("refineryslot_"+target.slotindex);      //define the parent div element holding the refinery slot
            if (!target.initialized) {
                div0 = document.createElement("div");
                div0.className = "refineryslot_state0_div";
                div0_span = document.createElement("span");
                div0_span.className = "refineryslot_state0_span";
                div0.appendChild(div0_span);
                div0.addEventListener("click", function () {target.state = 1})
                parentdiv.appendChild(div0);
                
                div1 = document.createElement("div");
                div1.className = "refineryslot_state1_div";
            }
            //check if initialized
                //if not, parent div is currently empty.
                    //create the subdivs (5, for each state 0-4)
                    //populate subdivs with content
                        //state 0
                            //create "empty" span text
                            //create event listener for click
                        //state 1
                            //create input box to select ore
                            //create img element for Cancel button
                                //create event listener for click -> go back to state 0
                        //state 2
                            //create img element for ore chosen previously
                            //create input box for adding to queue from previously chosen ore
                            //create button to add all available qty from previously chosen ore
                            //create img element for Cancel button
                                //create event listener for click -> go back to state 0
                        //state 3
                            //create span for what is being smelted
                            //create span for how many are left
                            //create img element for refill button
                            //create img element for Cancel button
                                //create event listener for click -> go back to state 0
                        //state 4
                            //create img element for ore chosen previously
                            //create input box for adding to queue from previously chosen ore
                            //create button to add all available qty from previously chosen ore
                            //create img element for Cancel button
                                //create event listener for click -> go back to state 3
                    //declare initialized
                //if it is, perform the logic function
                    //
            
        };
        
        Main.object_refineryslot = function (function_logic) {
            this.tier = Main.player_refinery_tier;      //what ore can be chosen for smelting in this slot
            this.rate = Main.player_refinery_rate;      //how fast this slot can refine ore
            this.state = 0;                             //what stage the submenu is on.  starts at zero
            this.initialized = 0;                       //tells if the object is initialized (menu set up, etc).
            this.current_queue = 0;                     //tells how many ore is queued up
            this.current_ore = 0;                       //tells which ore is being/going to be smelted
            this.smeltingactive = 0;                            //tells if slot is currently smelting something
            this.lasttime = Main.time.getTime();        //define time this was last on page (for updating)
            this.logic = function_logic;                //define the logic function callback
            this.slotindex = 0;
            /*
            if (!this.current_queue) {                   //if nothing is in queue, then slot is empty. reset values
                this.state = 0;
                this.current_ore = 0;
                this.smeltingactive = 0;
            }
            if (this.state === 0) {                     
                
            }*/
        };
        
        Main.object_refineryslotscontainer_logic = function () {
            var element_refineryslotscontainer, i, e;
            element_refineryslotscontainer = document.getElementsByClassName("refineryslotscontainer");
            if (!element_refineryslotscontainer[0].logicInitialized) {   //if not initialized (just a blank div with nothing in it)
                //initialize the div
                    //check if slotsarray length is equal to player slot's count
                        //if it isn't, create slot objects and push them into the array until it is
                        //if it is, do nothing
                    //for every slot the player has, create a div and append it to this one
                    //initialize these subdivs
                        //assign a slot object to a div
                if (!Main.player_refinery_slotsArray.length === Main.player_refinery_slotcount) {           //check if slots have already been loaded into the slotsarray
                    for (i = 0; i < Main.player_refinery_slotcount; i += 1) {           //if not, load them based on player's slot count
                        e = new Main.object_refineryslot();                                 //create new slot object
                        e.slotindex = i;                                                    //assign it to a div by number
                        Main.player_refinery_slotsArray.push(e);                            //push it into array
                    }
                } else {        //if slotsarray is loaded
                    for (i = 0; i < Main.player_refinery_slotsArray.length; i += 1) {   //for every slot the player has...
                        e = document.createElement("div");      //create a div
                        e.className = "refineryslotClass";
                        e.id = "refineryslot_"+i;                        //give it a string that tells what slot it's for (index number in array)
                        element_refineryslotscontainer[0].appendChild(e);   //append the div to the container
                    }
                    element_refineryslotscontainer[0].logicInitialized = 1;     //declare the container initialized (it is now a div containing empty divs assigned to a slot)
                }
            } else {            //if initialized
                //loop through every div element containing a slot
                //perform the slot's logic function
                for (i = 0; i < Main.player_refinery_slotsArray.length; i += 1) {       //loop through all slots
                    Main.player_refinery_slotsArray[i].logic();     //perform the logic function to update the slots
                }
            }
        };
        
        Main.object_refineryslotscontainer_draw = function () {
            
        };
        
        //logic for orecount text objects
        Main.object_oreCount_logic = function () {
            var i, element_oreCount;
            element_oreCount = document.getElementsByClassName("oreCountTotal");
            //console.log(element_oreCount.length);
            for (i = 0; i < element_oreCount.length; i += 1) {
                element_oreCount[i].textvalue = Main.material_ore_1_a + Main.material_ore_1_b + " ores";
            }
        };
        Main.object_oreCount1_a_logic = function () {
            var i, element_oreCount1_a;
            element_oreCount1_a = document.getElementsByClassName("oreCount1_a");
            //console.log(element_oreCount.length);
            for (i = 0; i < element_oreCount1_a.length; i += 1) {
                element_oreCount1_a[i].textvalue = Main.material_ore_1_a;
            }
        };
        Main.object_oreCount1_b_logic = function () {
            var i, element_oreCount1_b;
            element_oreCount1_b = document.getElementsByClassName("oreCount1_b");
            //console.log(element_oreCount.length);
            for (i = 0; i < element_oreCount1_b.length; i += 1) {
                element_oreCount1_b[i].textvalue = Main.material_ore_1_b;
            }
        };
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Menu initialization functions
        ----------------------------------------------------------*/
        Main.menuObjectInitialize = function (object) {
            if (object.initialized) {
                console.log("adding ", object.name);
                Main.menuObjectArray.push(object);
            }
        };
        
        Main.buildMenu = function (statemenu) {             //function to initialize objects for a menu.  Only call if menuinitialized = 0
            Main.menuTotalObjects = 0;                       //total amount of objects needed to be loaded on a given menu
            Main.menuObjectArray = [];                      //clear the menu object array
            console.log("obj array length ", Main.menuObjectArray.length);
            if (statemenu === 0) {                              //if requested to initialize mining menu...
                Main.menuTotalObjects = 6;                  //number of objects that need to be loaded for this specific menu
                Main.menuObjectInitialize(new Main.Object(0, "button_mines", "StageLeft_1", "button_mines.png", Main.object_button_mines_logic));
                Main.menuObjectInitialize(new Main.Object(0, "button_refinery", "StageLeft_1", "button_refinery.png", Main.object_button_refinery_logic));
                Main.menuObjectInitialize(new Main.Object(1, "oreCountTotal", "statistics_topholder", "no image", Main.object_oreCount_logic));
                Main.menuObjectInitialize(new Main.Object(1, "oreCount1_a", "statistics_bottomholder", "no image", Main.object_oreCount1_a_logic));
                Main.menuObjectInitialize(new Main.Object(1, "oreCount1_b", "statistics_bottomholder", "no image", Main.object_oreCount1_b_logic));
                
                Main.menuObjectInitialize(new Main.Object(0, "rock", "StageLeft_1", "rock.png", Main.object_rock_logic));
                
                while (!Main.menuInitialized) {
                    if (Main.menuObjectArray.length === Main.menuTotalObjects) {    //if all necessary objects are loaded into array
                        Main.menuInitialized = 1;               //declare menu is initialized    
                    }
                }
            }
            if (statemenu === 1) {                              //if requested to initialize mining menu...
                Main.menuTotalObjects = 7;                  //number of objects that need to be loaded for this specific menu
                Main.menuObjectInitialize(new Main.Object(0, "button_mines", "StageLeft_1", "button_mines.png", Main.object_button_mines_logic));
                Main.menuObjectInitialize(new Main.Object(0, "button_refinery", "StageLeft_1", "button_refinery.png", Main.object_button_refinery_logic));
                Main.menuObjectInitialize(new Main.Object(1, "oreCountTotal", "statistics_topholder", "no image", Main.object_oreCount_logic));
                Main.menuObjectInitialize(new Main.Object(1, "oreCount1_a", "statistics_bottomholder", "no image", Main.object_oreCount1_a_logic));
                Main.menuObjectInitialize(new Main.Object(1, "oreCount1_b", "statistics_bottomholder", "no image", Main.object_oreCount1_b_logic));
                
                Main.menuObjectInitialize(new Main.Object(0, "refinery_1", "StageLeft_1", "refinery_1.png", Main.object_rock_logic));
                Main.menuObjectInitialize(new Main.Object(2, "refineryslotscontainer", "StageLeft_1", "no image", Main.object_refineryslotscontainer_logic, Main.object_refineryslotscontainer_draw));
                
                while (!Main.menuInitialized) {
                    if (Main.menuObjectArray.length === Main.menuTotalObjects) {    //if all necessary objects are loaded into array
                        Main.menuInitialized = 1;               //declare menu is initialized    
                    }
                }
            }
            console.log("obj array length ", Main.menuObjectArray.length);
        };
        
        Main.clearMenu = function () {          //function to clear the menu (before switching menu)
            var i, j, target, parent, children;
            for (i = 0; i < Main.menuObjectArray.length; i += 1) {      //loop through every object in the object array and delete the elements
                target = Main.menuObjectArray[i];                           //set the target object
                parent = document.getElementById(target.parentid);          //get the parent element from target object
                children = document.getElementsByClassName(target.name);    //find the children (array) by class name
                for (j = 0; j < children.length; j += 1) {              //loop through all children
                    console.log("deleting ", children[j]);
                    parent.removeChild(children[j]);                        //KILL THEM ALL, JOHNNY
                }
            }
            Main.menuInitialized = 0;                                   //declare the menu not initialized
        };
        
        Main.changeToMenu = function (statemenu_next) {
            Main.stateMenuChanging = 1;             //declare that the menu is currently being changed
            Main.clearMenu();                       //clear menu of all objects and elements specific to menu
            if (Main.menuInitialized === 0) {
                Main.stateMenu = statemenu_next;
                Main.stateMenuChanging = 0;              //declare changing is done and engine can rebuild the menu again
            }
        };
        
        //draw backgrounds
        Main.drawBackgrounds = function () {
            var canvas_stageleft, ctx_stageleft, image_stageleft;
            canvas_stageleft = document.getElementsByClassName("StageLeftCanvas");
            if (Main.stateMenu === 0) {
                image_stageleft = getImage(Main.Preloader, "background_mines.png");
            }
            if (Main.stateMenu === 1) {
                image_stageleft = getImage(Main.Preloader, "background_mines.png");
            }
            ctx_stageleft = canvas_stageleft[0].getContext("2d");
            ctx_stageleft.imageSmoothingEnabled = 0;
            ctx_stageleft.clearRect(0, 0, canvas_stageleft[0].width, canvas_stageleft[0].height);
            ctx_stageleft.drawImage(image_stageleft, 0, 0, image_stageleft.width, image_stageleft.height);
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
                                    //tell objects to listen
        // call functions to change variables based on inputs
        if (!Main.stateMenuChanging) {              //if menu is not currently going through change...
            var i;
            if (Main.stateMenu === 0) {         //game is on the mining screen
                if (!Main.menuInitialized) {            //if menu is not initialized, initialize it
                    Main.buildMenu(0);
                } else {                                //if it is, then perform the logic function on all objects
                    for (i = 0; i < Main.menuObjectArray.length; i += 1) {
                        Main.menuObjectArray[i].logic();
                    }
                }
            }
            if (Main.stateMenu === 1) {         //game is on the mining screen
                if (!Main.menuInitialized) {            //if menu is not initialized, initialize it
                    Main.buildMenu(1);
                } else {                                //if it is, then perform the logic function on all objects
                    for (i = 0; i < Main.menuObjectArray.length; i += 1) {
                        Main.menuObjectArray[i].logic();
                    }
                }
            }
        }
        // reset inputs
        Main.TickEngine += 1;       //add to tick count
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to render the game
    ----------------------------------------------------------*/
    Main.Render = function () {     //this function renders the game
        // do rendering functions
        Main.drawBackgrounds();
        //Draw object canvases
        if (Main.menuInitialized) {                               //if menu initialized, draw all objects in array
            var i;
            for (i = 0; i < Main.menuObjectArray.length; i += 1) {
                Main.menuObjectArray[i].draw();
            }
        }
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