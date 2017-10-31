/* eslint-env browser, es6*/
/* eslint-disable no-console*/
/*jshint
    browser: true,
    esversion: 6,
    -W097,
    -W083,
    -W117
*/
"use strict";


/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Helper/shortcut functions
----------------------------------------------------------*/
var imageSrcArrayReference = [      //reference for filenames for all images to be loaded
    "rock.png",
    "background_mines.png",
    "refinery_1.png",
    "button_mines.png",
    "button_refinery.png",
    "cancel.png",
    "icon_refinery_ore1a.png",
    "icon_refinery_ore1b.png",
    "icon_refinery_all.png",
    "icon_refinery_refill.png"
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
                    this.loadingstatus;           /* jshint ignore:line */ //trigger loading status
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
        Main.tickRate = 1000 / Main.framerate;  //tick-rate of the game; how long in miliseconds one tick is
        Main.timerTracker = "start"  //labels for where in game loop we are
        
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
        Main.refineryObjectArray = [];      //array that holds refinery objects.  updated on every tick, on every screen
        Main.player_refinery_tier = 1;      //tier of refinery.  determines what ore can be smelted
        Main.player_refinery_rate = 1;      //rate per sec that ore is smelted
        Main.player_refinery_slotcount = 1; //number of smelting slots player can have
        Main.player_refinery_initialized = 0;   //determines if the refineryObjectArray is ready. starts at 0.
        
        //define objects to be used in the game
        Main.Object = function (objecttype, str_name, str_parentid, str_imagename, function_logic, function_draw) {
            this.objecttype = objecttype;               //determines type of object.  0 for image, 1 for text
            this.name = str_name;                          //identifying class name of object (from CSS)
            this.initialized = 0;                    //state that tells if the object has been initialized yet.  starts at 0
            this.parentid = str_parentid;   //parent element.  tells where new element should be on html
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
        Main.player_refinery_initialization = function () {     //function to initialize the refinery function so logic can be called
            var e, newslotindex;
            if (!Main.player_refinery_initialized) {     //if refinery is not initialized...
                while (Main.refineryObjectArray.length < Main.player_refinery_slotcount) {      //refinery array hasn't been populated yet completely.  so populate it.
                    newslotindex = Main.refineryObjectArray.length;  //(works, because it starts at 0)
                    e = new Main.objectauto_refiner();      //create new refiner object
                    e.slotindex = newslotindex;
                    e.logic = Main.objectauto_refiner_logic(e);
                    e.initialized = 1;
                    if (e.initialized === 1) {                //declare object is initialized
                        Main.refineryObjectArray.push(e);       //push it into refinery object array
                    }
                }
                if (Main.refineryObjectArray.length === Main.player_refinery_slotcount) {   //if the array is equal to slot count entitled to player
                    Main.player_refinery_initialized = 1;        //declare the refinery array initialized
                    console.log("player_refinery initialized!!!");
                    console.log(e);
                }
            }
        };
        
        Main.objectauto_refiner = function () {
            this.tier = Main.player_refinery_tier;      //what ore can be chosen for smelting in this slot
            this.rate = Main.player_refinery_rate;      //how fast this slot can refine ore
            this.state = 0;                             //used for menu states
            this.initialized = 0;                       //tells if the object is initialized (menu set up, etc).
            this.current_queue = 0;                     //tells how many ore is queued up
            this.current_ore = undefined;                       //tells which ore is being/going to be smelted
            this.smeltingactive = 0;                            //tells if slot is currently smelting something
            this.lasttime = Main.time.getTime();        //define time this was last on page (for updating)
            this.slotindex = 0;
        };

        Main.objectauto_refiner_logic = function (objectauto_refiner) {
            var e, difference;
            e = objectauto_refiner;     //define the object refiner that will be updated with this function
            if (e.initialized) {        //if object is initialized...
                //state 1: container will define current_ore
                //state 2: container define current_queue
                //state 3: smelt ore based on current_ore and current_queue.
                //state 4: smelt ore based on current_ore and current_queue. container will add to current_queue
                if (e.state === 0) {         //Empty menu, defaults all values
                    e.current_queue = 0;
                    e.current_ore = undefined;
                    e.smeltingactive = 0;
                }
                if (e.state === 3 || e.state === 4) {     //if there is an ore chosen and ores queued up, then turn on the furnace
                    e.smeltingactive = 1;
                    e.current_queue -= e.rate;        //remove an amount from the queue
                    if (e.current_queue >= 0) {          //if that did not make the queue negative, perform mining operation
                        if (e.current_ore === "1a") {
                            Main.material_ore_1_a -= e.rate;     //smelt an ore from the player's stock
                            Main.material_refined_1_a += e.rate;     //add it to the player's refined stock               //rate = ore/sec
                        } else if (e.current_ore === "1b") {
                            Main.material_ore_1_b -= e.rate;     //smelt an ore from the player's stock
                            Main.material_refined_1_b += e.rate;     //add it to the player's refined stock     //rate = ore/sec
                        }
                    } else if (e.current_queue < 0) {    //if this makes queue negative
                        difference = e.current_queue + e.rate;        //calculate negative queue PLUS the rate
                        if (difference > 0) {       //if this results in a positive number, then there is still ore to smelt
                            if (e.current_ore === "1a") {
                                Main.material_ore_1_a -= difference;    //this should make it 0
                                Main.material_ore_1_a += difference;
                            } else if (e.current_ore === "1b") {
                                Main.material_ore_1_b -= difference;    //this should make it 0
                                Main.material_ore_1_b += difference;
                            }
                        } else {    //if the difference is 0 or less, then you have nothing to smelt!
                            e.state = 0;         //reset state to 0
                        }
                    }
                }
            }
        };
        
        Main.object_menurefinerycontainer_logic = function () {
            var refineryObjectArray, element_menurefinerycontainer, j, e, parentdiv,
                div0, div0_span,
                div1, div1_imginput_ore1a, div1_imginput_ore1b, div1_imgcancel,
                div2, div2_imgore, div2_input, div2_imgall, div2_imgcancel,
                div3, div3_span1, div3_span2, div3_imgrefill, div3_imgcancel,
                div4, div4_imgore, div4_input, div4_imgall, div4_imgcancel;
            element_menurefinerycontainer = document.getElementsByClassName("menurefinerycontainer");
            refineryObjectArray = Main.refineryObjectArray;
            if (!element_menurefinerycontainer[0].logicInitialized) {       //if refinery container is not initialized (just a blank div)
                if (Main.player_refinery_initialized) {     //only begin initialization if the refinery array is initialized
                    for (let i = 0; i < refineryObjectArray.length; i += 1) {      //for every refinery object in array...
                        parentdiv = document.createElement("div");      //create empty div
                        parentdiv.className = "refineryslotClass";      //define class type for div
                        parentdiv.id = "refineryslot_" + i;               //define id for specific div based on which refiner it is
                        //populate subdivs with content
                        //state = 0
                        div0 = document.createElement("div");        //create div0 for state 0 menu
                        div0.className = "refineryslot_div0";
                        div0.id = "refineryslot_div0_" + i;
                        div0_span = document.createElement("span");    //create "empty" span text
                        div0_span.innerHTML = "Empty.";
                        div0.addEventListener("click", function () {    //create event listener for click
                            console.log("BUBURBSR i = ", i);
                            refineryObjectArray[i].state = 1;
                        });
                        div0.appendChild(div0_span);    //append span to div0
                        parentdiv.appendChild(div0);    //append div0 to parentdiv
                        
                        //state = 1
                        div1 = document.createElement("div");   //create div1 for state 1 menu
                        div1.className = "refineryslot_div1";
                        div1.id = "refineryslot_div1_" + i;
                        div1_imginput_ore1a = document.createElement("canvas");     //create canvas elements for available ores
                        div1_imginput_ore1a.id = "refineryslot_div1_imginput_ore1a_" + i;
                        div1_imginput_ore1a.className = "refineryslot_div1_imginput_ore";
                        div1_imginput_ore1a.width = 50;
                        div1_imginput_ore1a.height = 50;
                        div1_imginput_ore1a.addEventListener("click", function () {
                            refineryObjectArray[i].current_ore = "1a";
                            refineryObjectArray[i].state = 2;
                        });
                        div1_imginput_ore1b = document.createElement("canvas");     //create canvas elements for available ores
                        div1_imginput_ore1b.id = "refineryslot_div1_imginput_ore1b_" + i;
                        div1_imginput_ore1b.className = "refineryslot_div1_imginput_ore";
                        div1_imginput_ore1b.width = 50;
                        div1_imginput_ore1b.height = 50;
                        div1_imginput_ore1b.addEventListener("click", function () {
                            refineryObjectArray[i].current_ore = "1b";
                            refineryObjectArray[i].state = 2;
                        });
                        div1_imgcancel = document.createElement("canvas");    //create canvas elements for Cancel button
                        div1_imgcancel.id = "refineryslot_div1_imgcancel_" + i;
                        div1_imgcancel.className = "refineryslot_cancelbutton";
                        div1_imgcancel.width = 15;
                        div1_imgcancel.height = 15;
                        console.log(div1_imgcancel);
                        div1_imgcancel.addEventListener("click", function () {
                            console.log(refineryObjectArray[0].state, i);
                            refineryObjectArray[i].state = 0;
                        });        //create event listener for click -> go back to state 0
                        div1.appendChild(div1_imginput_ore1a);    //append input box, img element to div1
                        div1.appendChild(div1_imginput_ore1b);
                        div1.appendChild(div1_imgcancel);
                        parentdiv.appendChild(div1);    //append div1 to parentdiv
                        
                        //state = 2
                        div2 = document.createElement("div");   //create div2 for state 2 menu
                        div2.className = "refineryslot_div2";
                        div2.id = "refineryslot_div2_" + i;
                        div2_imgore = document.createElement("canvas");    //create img element for ore chosen previously
                        div2_imgore.id = "refineryslot_div2_imgore_" + i;
                        div2_imgore.className = "refineryslot_div2_imgore";
                        div2_imgore.width = 50;
                        div2_imgore.height = 50;
                        div2_input = document.createElement("input");    //create input box for adding to queue from previously chosen ore
                        div2_input.className = "refineryslot_div2_input";
                        div2_input.id = "refineryslot_div2_input_" + i;
                        div2_input.type = "number";
                        div2_input.addEventListener("submit", function () {
                            if (refineryObjectArray[i].current_ore === "1a") {
                                if (div2_input.value <= Main.material_ore_1_a) {
                                    refineryObjectArray[i].current_queue = div2_input.value;
                                    refineryObjectArray[i].state = 3;
                                }
                            }
                            if (refineryObjectArray[i].current_ore === "1b") {
                                if (div2_input.value <= Main.material_ore_1_b) {
                                    refineryObjectArray[i].current_queue = div2_input.value;
                                    refineryObjectArray[i].state = 3;
                                }
                            }
                        });
                        div2_imgall = document.createElement("canvas");    //create button to add all available qty from previously chosen ore
                        div2_imgall.id = "refineryslot_div2_imgall_" + i;
                        div2_imgall.className = "refineryslot_div2_imgall";
                        div2_imgall.width = 50;
                        div2_imgall.height = 25;
                        div2_imgall.addEventListener("click", function () {
                            if (refineryObjectArray[i].current_ore === "1a") {
                                if (div2_input.value <= Main.material_ore_1_a) {
                                    refineryObjectArray[i].current_queue = Main.material_ore_1_a;
                                    refineryObjectArray[i].state = 3;
                                }
                            }
                            if (refineryObjectArray[i].current_ore === "1b") {
                                if (div2_input.value <= Main.material_ore_1_b) {
                                    refineryObjectArray[i].current_queue = Main.material_ore_1_b;
                                    refineryObjectArray[i].state = 3;
                                }
                            }
                        });
                        div2_imgcancel = document.createElement("canvas");    //create img element for Cancel button
                        div2_imgcancel.className = "refineryslot_cancelbutton";
                        div2_imgcancel.id = "refineryslot_div2_imgcancel_" + i;
                        div2_imgcancel.width = 15;
                        div2_imgcancel.height = 15;
                        div2_imgcancel.addEventListener("click", function () {
                            refineryObjectArray[i].state = 0;
                        });        //create event listener for click -> go back to state 0
                        div2.appendChild(div2_imgcancel);    //append img, input box, button, and cancel to div2
                        div2.appendChild(div2_input);
                        div2.appendChild(div2_imgore);
                        div2.appendChild(div2_imgall);
                        parentdiv.appendChild(div2);    //append div2 to parentdiv
                        
                        //state = 3
                        div3 = document.createElement("div");   //create div3 for state 3 menu
                        div3.className = "refineryslot_div3";
                        div3.id = "refineryslot_div3_" + i;
                        div3_span1 = document.createElement("span");    //create span1 for what is being smelted
                        div3_span1.id = "refineryslot_div3_span1_" + i;
                        div3_span1.className = "refineryslot_div3_span1";
                        div3_span2 = document.createElement("span");    //create span2 for how many are left
                        div3_span2.id = "refineryslot_div3_span2_" + i;
                        div3_span2.className = "refineryslot_div3_span2";
                        div3_imgrefill = getImage(Main.Preloader, "icon_refinery_refill.png");    //create img1 element for refill button
                        div3_imgrefill.addEventListener("click", function () {
                            refineryObjectArray[i].state = 4;
                        });
                        div3_imgcancel = new getImage(Main.Preloader, "cancel.png");    //create img2 element for Cancel button
                        div3_imgcancel.addEventListener("click", function () {
                            refineryObjectArray[i].state = 0;
                        });        //create event listener for click -> go back to state 0
                        div3.appendChild(div3_span1);    //append span1, span2, img1, img2 to div3
                        div3.appendChild(div3_span2);
                        div3.appendChild(div3_imgrefill);
                        div3.appendChild(div3_imgcancel);
                        parentdiv.appendChild(div3);    //append div3 to parentdiv
                        
                        //state = 4
                        div4 = document.createElement("div");   //create div4 for state 4 menu
                        div4.className = "refineryslot_div4";
                        div4.id = "refineryslot_div4_" + i;
                        div4_imgore = getImage(Main.Preloader, "icon_refinery_ore1a.png");    //create img1 element for ore chosen previously
                        div4_imgore.className = "refineryslot_div4_imgore";
                        div4_input = document.createElement("input");    //create input box for adding to queue from previously chosen ore
                        div4_input.setAttribute("type", "number");
                        div4_input.className = "refineryslot_div4_input";
                        div4_imgall = getImage(Main.Preloader, "icon_refinery_all.png");    //create button to add all available qty from previously chosen ore
                        div4_imgall.className = "refineryslot_div4_imgall";
                        div4_imgcancel = getImage(Main.Preloader, "cancel.png");    //create img2 element for Cancel button
                        div4_imgcancel.addEventListener("click", function () {
                            refineryObjectArray[i].state = 3;
                        });         //create event listener for click -> go back to state 3
                        div4.appendChild(div4_imgore);    //append img1, input box, button, img2 to div4
                        div4.appendChild(div4_imgall);
                        div4.appendChild(div4_input);
                        div4.appendChild(div4_imgcancel);
                        parentdiv.appendChild(div4);    //append div4 to parentdiv
                        
                        element_menurefinerycontainer[0].appendChild(parentdiv);    //append parentdiv to the container
                    }
                    element_menurefinerycontainer[0].logicInitialized = 1;  //divs and elements have been created and assigned to an object by ID, it is initialized
                }
            } else {            //if initialized
                for (j = 0; j < refineryObjectArray.length; j += 1) {       //for every refinery slot....
                    e = refineryObjectArray[j];
                    div0 = document.getElementById("refineryslot_div0_" + j);
                    
                    div1 = document.getElementById("refineryslot_div1_" + j);
                    div1_imginput_ore1a = document.getElementById("refineryslot_div1_imginput_ore1a_" + j);
                    div1_imginput_ore1b = document.getElementById("refineryslot_div1_imginput_ore1b_" + j);
                    
                    div2 = document.getElementById("refineryslot_div2_" + j);
                    div3 = document.getElementById("refineryslot_div3_" + j);
                    div3_span1 = document.getElementById("refineryslot_div3_span1_" + j);
                    div3_span2 = document.getElementById("refineryslot_div3_span2_" + j);
                    div4 = document.getElementById("refineryslot_div4_" + j);
                    //if state 0
                        //show div 0
                        //hide div 1,2,3,4
                    //if state 1
                        //show div 0
                        //hide div 1,2,3,4
                    if (e.state === 0) {
                        div0.style.display = "block";
                        div1.style.display = "none";
                        div2.style.display = "none";
                        div3.style.display = "none";
                        div4.style.display = "none";
                        //recalibrate everything to default: clear all options and variables, etc. from the other divs
                    }
                    if (e.state === 1) {
                        div0.style.display = "none";
                        div1.style.display = "block";
                        div2.style.display = "none";
                        div3.style.display = "none";
                        div4.style.display = "none";
                        if (Main.material_ore_1_a <= 0) {
                            div1_imginput_ore1a.style.display = "none";
                        } else {
                            div1_imginput_ore1a.style.display = "block";
                        }
                        if (Main.material_ore_1_b <= 0) {
                            div1_imginput_ore1b.style.display = "none";
                        } else {
                            div1_imginput_ore1b.style.display = "block";
                        }
                    }
                    if (e.state === 2) {
                        div0.style.display = "none";
                        div1.style.display = "none";
                        div2.style.display = "block";
                        div3.style.display = "none";
                        div4.style.display = "none";
                    }
                    if (e.state === 3) {
                        div0.style.display = "none";
                        div1.style.display = "none";
                        div2.style.display = "none";
                        div3.style.display = "block";
                        div4.style.display = "none";
                        div3_span1.innerHTML = "smelting: " + e.current_ore;
                        div3_span2.innerHTML = "left: " + e.current_queue;
                    }
                }
            }
        };
        
        Main.object_menurefinerycontainer_draw = function () {
            var e, i, ctx, img,
                div1_imgcancel, div1_imginput_ore1a, div1_imginput_ore1b,
                div2_imgore, div2_imgall, div2_imgcancel, menurefinerycontainer;
            e = Main.refineryObjectArray;
            menurefinerycontainer = document.getElementsByClassName("menurefinerycontainer");
            for (i = 0; i < e.length; i += 1) {
                if (menurefinerycontainer[i].logicInitialized) {
                    if (e[i].state === 1) {
                        div1_imginput_ore1a = menurefinerycontainer[i].querySelector("#refineryslot_div1_imginput_ore1a_" + i);
                        div1_imginput_ore1b = menurefinerycontainer[i].querySelector("#refineryslot_div1_imginput_ore1b_" + i);
                        div1_imgcancel = menurefinerycontainer[i].querySelector("#refineryslot_div1_imgcancel_" + i);
                        ctx = div1_imgcancel.getContext("2d");
                        img = getImage(Main.Preloader, "cancel.png");
                        ctx.drawImage(img, 0, 0);
                        if (div1_imginput_ore1a.style.display !== "none") {
                            ctx = div1_imginput_ore1a.getContext("2d");
                            img = getImage(Main.Preloader, "icon_refinery_ore1a.png");
                            ctx.drawImage(img, 0, 0);
                        }
                        if (div1_imginput_ore1b.style.display !== "none") {
                            ctx = div1_imginput_ore1b.getContext("2d");
                            img = getImage(Main.Preloader, "icon_refinery_ore1b.png");
                            ctx.drawImage(img, 0, 0);
                        }
                    }
                    if (e[i].state === 2) {
                        div2_imgore = document.getElementById("refineryslot_div2_imgore_" + i);
                        div2_imgall = document.getElementById("refineryslot_div2_imgall_" + i);
                        div2_imgcancel = document.getElementById("refineryslot_div2_imgcancel_" + i);
                        ctx = div2_imgore.getContext("2d");
                        if (e[i].current_ore === "1a") {
                            img = getImage(Main.Preloader, "icon_refinery_ore1a.png");
                        }
                        if (e[i].current_ore === "1b") {
                            img = getImage(Main.Preloader, "icon_refinery_ore1b.png");
                        }
                        ctx.drawImage(img, 0, 0);
                        ctx = div2_imgall.getContext("2d");
                        img = getImage(Main.Preloader, "icon_refinery_all.png");
                        ctx.drawImage(img, 0, 0);
                        ctx = div2_imgcancel.getContext("2d");
                        img = getImage(Main.Preloader, "cancel.png");
                        ctx.drawImage(img, 0, 0);
                    }
                }
            }
            //if state 0
            //if state 1
                //draw canvases
            //if state 2
                //draw canvases
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
                Main.menuObjectInitialize(new Main.Object(2, "menurefinerycontainer", "StageLeft_1", "no_image", Main.object_menurefinerycontainer_logic, Main.object_menurefinerycontainer_draw));
                
                while (!Main.menuInitialized) {
                    if (Main.menuObjectArray.length === Main.menuTotalObjects) {    //if all necessary objects are loaded into array
                        Main.menuInitialized = 1;               //declare menu is initialized    
                    }
                }
            }
            console.log("obj array length ", Main.menuObjectArray.length);
        };
        
        Main.clearMenu = function () {          //function to clear the menu (before switching menu)
            var i, j, k, target, parent, children, props;
            for (i = 0; i < Main.menuObjectArray.length; i += 1) {      //loop through every object in the object array and delete the elements
                target = Main.menuObjectArray[i];                           //set the target object
                parent = document.getElementById(target.parentid);          //get the parent element from target object
                children = document.getElementsByClassName(target.name);    //find the children (array) by class name
                for (j = 0; j < children.length; j += 1) {              //loop through all children
                    props = Object.keys(children[j]);
                    for (k = 0; k < props.length; k += 1) {
                        delete children[j][props[i]];
                    }
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
        var i;
        Main.timerTracker = "engine start";
        // listen for inputs
                                    //tell objects to listen
        // call functions to change variables based on inputs
        if (!Main.stateMenuChanging) {              //if menu is not currently going through change...
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
        //update auto units
        if (!Main.player_refinery_initialized) {        //if the refinery is not initialized...
            Main.player_refinery_initialization();          //initialize it
        } else {                                        //if it is initialized...
            if (Main.refineryObjectArray.length < Main.player_refinery_slotcount) {
                Main.player_refinery_initialized = 0;       //if player gets a new slot, declare not initialized
            }
            for (i = 0; i < Main.refineryObjectArray.length; i += 1) {  //loop through the refinery object array and update the miners
                if (Main.tickEngine % Math.floor(Main.framerate / Main.refineryObjectArray[i].rate) === 0) {
                    Main.objectauto_refiner_logic(Main.refineryObjectArray[i]);
                //TODO: FIX THE LOGIC REFERENCE
                //Main.refineryObjectArray[i].logic;        // jshint ignore:line
                }
            }
        }
        
        // reset inputs
        Main.tickEngine += 1;       //add to tick count
        Main.timerTracker = "engine complete";
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method to render the game
    ----------------------------------------------------------*/
    Main.Render = function () {     //this function renders the game
        // do rendering functions
        if (Main.timerTracker === "engine complete") {      //only call the render once the engine has done its job
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
        }
    };
    
    /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Define the method for running one frame of the actual game
    ----------------------------------------------------------*/
    Main.Loop = function () {       //this function runs the engine (and draw, if needed) in relation to Timer
        Main.Engine();              //run engine
        //add time compensation methods if needed
        Main.TickLoop += 1;         //add to tick count
        setTimeout(Main.Loop, Main.tickRate);     //declare the loop to repeat, at interval equal to length of one game frame (inverse of framerate)
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