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
    "icon_refinery_refill.png",
    "icon_upgrade.png",
    "icon_oreCounter_1a.png",
    "icon_oreCounter_1aref.png",
    "icon_oreCounter_1b.png",
    "icon_oreCounter_1bref.png",
    "icon_autominerselect_tier0.png",
    "icon_upgrade_unlockminer1.png"
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
            assetImage.src = this.domain + this.imageSrcArray[i];       //define src and alt text for images
            assetImage.alt = this.imageSrcArray[i];
            this.imageArray.push(assetImage);
            assetImage.onload = function () {
                progress -= 1;
                if (progress <= 0) {
                    this.loadingstatus;           /* jshint ignore:line */ //trigger loading status
                    this.loadingdone = 1;           //declare loading is done
                }
            };
            //assetImage.src = this.domain + this.imageSrcArray[i];       //define src and alt text for images
            //assetImage.alt = this.imageSrcArray[i];
            //this.imageArray.push(assetImage);                           //push the image into the actual imageArray to be referenced to
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
        Main.timerTracker = "start";  //labels for where in game loop we are
        
        /* game state tracking */
        Main.stateMenu = 0;          //what screen is the game on. 0 = mining
        Main.menuInitialized = 0;    //tells if the menu is initialized or not.  starts at 0.
        Main.menuObjectArray = [];   //array that holds all the objects in a menu
        Main.stateMenuChanging = 0;  //tells if the menu is currently being changed.
        
        Main.documentFragment = document.createDocumentFragment();      //used for updating the elements onscreen
        Main.documentFragment.appendChild(document.getElementsByClassName("Wrapper")[0]);      //set up the documentfragment
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Variable for game
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
        
        //oreCounter
        Main.player_oreCountermenu = 0;                //ore counter extended menu.  0 for close, 1 for opened.
        //refinery
        Main.refineryObjectArray = [];      //array that holds refinery objects.  updated on every tick, on every screen
        Main.player_refinery_tier = 1;      //tier of refinery.  determines what ore can be smelted
        Main.player_refinery_rate = 1;      //rate per sec that ore is smelted
        Main.player_refinery_slotcount = 1; //number of smelting slots player can have
        Main.player_refinery_initialized = 0;   //determines if the refineryObjectArray is ready. starts at 0.
        
        //autominer
        Main.autominerArray = [];           //autominer array containing array objects
        Main.autominerArray_typeselected = 0;       //which autominer currently has focus.  determines what info is shown in menu
        
        //upgrade tracker
        Main.upgradesArray = [];            //contains upgrades
        
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
                var parentElement, e1, e2;
                parentElement = Main.documentFragment.querySelectorAll("#"+this.parentid)[0];
                if (this.objecttype === 0) {    //if image       
                    e1 = document.createElement("canvas");
                    e1.className = this.name;
                    parentElement.appendChild(e1);       //appendChild canvas to the parent you gave
                    this.canvas = e1;
                    this.image = getImage(Main.Preloader, this.imagename);                              //define the image
                    this.initialized = 1;
                    console.log(this.name, " has been initialized");
                } else if (this.objecttype === 1) {     //if text
                    e1 = document.createElement("span");
                    e1.className = this.name;
                    e2 = document.createTextNode("<blank>");
                    e1.appendChild(e2);
                    parentElement.appendChild(e1);
                    this.textElement = e1;
                    this.textvalue = e1.textContent;
                    this.initialized = 1;
                } else if (this.objecttype === 2) {     //if container element (contains special object)
                    e1 = document.createElement("div");
                    e1.className = this.name;
                    parentElement.appendChild(e1);
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
        
        coding scheme for Main.
        */
        
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Object functions: Menus
        ----------------------------------------------------------*/
        Main.object_popupmenu = function (type, subtype) {
            var docfrag, i, div_wrapper, div_popupmenu, toplevelwrapper;
            this.type = type;           //string to identify menu type
            this.subtype = subtype;     //string to identify subtype of menu
            toplevelwrapper = document.getElementById("wrapper");
            docfrag = document.createDocumentFragment();
            div_wrapper = document.createElement("div");
            div_wrapper.id = "popupmenu_wrapper";
            if (this.type === "upgrade") {
                var upgradeobject, texttitle, textdescription;
                for (i = 0; i < Main.upgradesArray.length; i += 1) {
                    if (Main.upgradesArray[i].upgradename === this.subtype) {
                        upgradeobject = Main.upgradesArray[i];
                    }
                }
                div_popupmenu = document.createElement("div");
                div_popupmenu.className = "popupmenu_upgrade";
                texttitle = document.createElement("span");
                textdescription = document.createElement("p");
            }
            div_wrapper.appendChild(div_popupmenu);
            docfrag.appendChild(div_wrapper);
            toplevelwrapper.appendChild(docfrag);
        };
        
        Main.researchmenu_logic = function () {
            var element_researchmenu, docfrag, i,
                div_researchmenu_wrapper, span_researchmenu_title, div_researchmenu_select,
                upgrades_countavailable, upgrades_countadded, upgrades_howmany,
                canvas_tobedeleted,
                canvas_upgradeicon;
            upgrades_howmany = 0;       //initialize vars
            element_researchmenu = document.getElementsByClassName("researchMenu");
            if (!element_researchmenu[0].logicInitialized) {
                upgrades_countadded = 0;        //how many icons are currently built
                docfrag = document.createDocumentFragment();
                div_researchmenu_wrapper = document.createElement("div");
                div_researchmenu_wrapper.id = "researchMenu_div_researchmenu_wrapper";
                span_researchmenu_title = document.createElement("span");
                span_researchmenu_title.textContent = "Upgrades below:";
                div_researchmenu_select = document.createElement("div");
                div_researchmenu_select.id = "researchMenu_div_researchmenu_select";
                div_researchmenu_wrapper.appendChild(span_researchmenu_title);
                div_researchmenu_wrapper.appendChild(div_researchmenu_select);
                docfrag.appendChild(div_researchmenu_wrapper);
                element_researchmenu[0].appendChild(docfrag);
                element_researchmenu[0].logicInitialized = 1;
            } else {
                //check upgrade array to see which upgrades should be avaiable
                div_researchmenu_select = document.getElementById("researchMenu_div_researchmenu_select");
                upgrades_countadded = document.getElementsByClassName("researchMenu_canvas_upgradeicon").length;
                upgrades_countavailable = 0;
                //calculate how many objects in upgradesArray are supposed to be available
                for (i = 0; i < Main.upgradesArray.length; i += 1) {     //loop through all upgradesArray objects
                    if (Main.upgradesArray[i].purchased === 0 && Main.upgradesArray[i].available === 1) {        //if the upgrade has not been purchased yet and it should be available to player
                        upgrades_countavailable += 1;
                    }
                }
                if (upgrades_countadded < upgrades_countavailable) {     //if upgrades shown is less than how many are available, add them!
                    docfrag = document.createDocumentFragment();
                    for (i = 0; i < Main.upgradesArray.length; i += 1) {    //loop through all upgradesArray objects
                        if (Main.upgradesArray[i].initialized === 1 && Main.upgradesArray[i].purchased === 0 && Main.upgradesArray[i].available === 1) {      //if initialized state is 1, and upgrade was not purchased, canvas element needs to be built for this upgrade
                            canvas_upgradeicon = document.createElement("canvas");      //build canvas
                            canvas_upgradeicon.width = Main.upgradesArray[i].iconimage.width;
                            canvas_upgradeicon.height = Main.upgradesArray[i].iconimage.height;
                            canvas_upgradeicon.className = "researchMenu_canvas_upgradeicon";
                            canvas_upgradeicon.id = "researchMenu_canvas_upgradeicon_" + Main.upgradesArray[i].upgradename;      //give canvas an identifier by upgrade name
                            //TODO: add event listener
                            docfrag.appendChild(canvas_upgradeicon);    //append it into the icon select list shown to player
                        }
                    }
                    div_researchmenu_select.appendChild(docfrag);       //add any new upgrades to the current list
                }
                if (upgrades_countadded > upgrades_countavailable) {     //if upgrades shown is more, delete the canvases for purchased upgrades
                    console.log("wooow");
                    for (i = 0; i < Main.upgradesArray.length; i += 1) {     //loop through all upgradesArray objects
                        if (Main.upgradesArray[i].purchased === 1) {        //if the upgrade has been purchased, we need to find its canvas and remove it
                            canvas_tobedeleted = document.getElementById("researchMenu_canvas_icon_" + Main.upgradesArray[i].upgradename);      //find the canvas
                            canvas_tobedeleted.parentNode.removeChild(canvas_tobedeleted);      //delete it
                            upgrades_countadded -= 1;       //upgrade the count added number to break the if statement
                        }
                    }
                }
            }
        };
        Main.researchmenu_draw = function () {
            var elements_canvas_upgradeicons, i,
                upgradeicon_image, upgradeicon_ctx;
            //draw canvases for upgradeicons
            elements_canvas_upgradeicons = document.getElementsByClassName("researchMenu_canvas_upgradeicon");
            if (elements_canvas_upgradeicons.length > 0) {      //if not null
                for (i = 0; i < elements_canvas_upgradeicons.length; i += 1) {
                    upgradeicon_ctx = elements_canvas_upgradeicons[i].getContext("2d");
                    upgradeicon_image = getImage(Main.Preloader, "icon_upgrade_unlockminer1.png");
                    upgradeicon_ctx.drawImage(upgradeicon_image, 0, 0);
                }
            }
        };
        
        Main.information_player_logic = function () {
            var element_information, docfrag, table, row, column,
                div_infowrapperplayer, span_playertier, span_playerstrength, canvas_tierupgradebutton, canvas_strengthupgradebutton,
                div_infowrapperauto, span_auto_type, span_auto_count, span_auto_ratetotal, canvas_autocountupgrade, canvas_autorateupgrade,
                div_infowrapperautoblank, span_autoblank, div_infowrapper_select, canvas_autoblankselect_tier0,
                scrollPosition, scrollflipY, infostate, autominertypeselected;
            element_information = document.getElementsByClassName("infoPlayer");
            scrollflipY = 400;      //position in pixelY that the menu flips to auto-mining menu instead of player
            if (!element_information[0].logicInitialized) {
                docfrag = document.createDocumentFragment();
                div_infowrapperplayer = document.createElement("div");
                div_infowrapperplayer.id = "infoPlayer_div_infowrapperplayer";
                span_playertier = document.createElement("span");
                span_playertier.id = "infoPlayer_span_playertier";
                span_playertier.className = "info_spandata";
                span_playerstrength = document.createElement("span");
                span_playerstrength.id = "infoPlayer_span_playerstrength";
                span_playerstrength.className = "info_spandata";
                canvas_tierupgradebutton = document.createElement("canvas");
                canvas_tierupgradebutton.id = "infoPlayer_tierupgradebutton";
                canvas_tierupgradebutton.className = "info_buttonupgrade";
                canvas_tierupgradebutton.width = getImage(Main.Preloader, "icon_upgrade.png").width;
                canvas_tierupgradebutton.height = getImage(Main.Preloader, "icon_upgrade.png").height;
                canvas_strengthupgradebutton = document.createElement("canvas");
                canvas_strengthupgradebutton.id = "infoPlayer_strengthupgradebutton";
                canvas_strengthupgradebutton.className = "info_buttonupgrade";
                canvas_strengthupgradebutton.width = getImage(Main.Preloader, "icon_upgrade.png").width;
                canvas_strengthupgradebutton.height = getImage(Main.Preloader, "icon_upgrade.png").height;
                
                table = document.createElement("table");
                row = document.createElement("tr");
                column = document.createElement("td");
                column.appendChild(canvas_tierupgradebutton);
                row.appendChild(column);
                column = document.createElement("td");
                column.appendChild(span_playertier);
                row.appendChild(column);
                table.appendChild(row);
                row = document.createElement("tr");
                column = document.createElement("td");
                column.appendChild(canvas_strengthupgradebutton);
                row.appendChild(column);
                column = document.createElement("td");
                column.appendChild(span_playerstrength);
                row.appendChild(column);
                table.appendChild(row);
                div_infowrapperplayer.appendChild(table);
                docfrag.appendChild(div_infowrapperplayer);
                
                //div for autominer info
                div_infowrapperauto = document.createElement("div");
                div_infowrapperauto.id = "infoAuto_div_infowrapperauto";
                span_auto_type = document.createElement("span");
                span_auto_type.id = "infoAuto_span_auto_type";
                span_auto_count = document.createElement("span");
                span_auto_count.id = "infoAuto_span_auto_count";
                span_auto_count.className = "info_spandata";
                span_auto_ratetotal = document.createElement("span");
                span_auto_ratetotal.id = "infoAuto_span_auto_ratetotal";
                span_auto_ratetotal.className = "info_spandata";
                canvas_autocountupgrade = document.createElement("canvas");
                canvas_autocountupgrade.id = "infoAuto_canvas_autocountupgrade";
                canvas_autocountupgrade.className = "info_buttonupgrade";
                canvas_autocountupgrade.width = getImage(Main.Preloader, "icon_upgrade.png").width;
                canvas_autocountupgrade.height = getImage(Main.Preloader, "icon_upgrade.png").height;
                canvas_autorateupgrade = document.createElement("canvas");
                canvas_autorateupgrade.id = "infoAuto_canvas_autorateupgrade";
                canvas_autorateupgrade.className = "info_buttonupgrade";
                canvas_autorateupgrade.width = getImage(Main.Preloader, "icon_upgrade.png").width;
                canvas_autorateupgrade.height = getImage(Main.Preloader, "icon_upgrade.png").height;
                
                table = document.createElement("table");
                row = document.createElement("tr");
                column = document.createElement("td");
                column.appendChild(span_auto_type);
                row.appendChild(column);
                table.appendChild(row);
                row = document.createElement("tr");
                column = document.createElement("td");
                column.appendChild(canvas_autocountupgrade);
                row.appendChild(column);
                column = document.createElement("td");
                column.appendChild(span_auto_count);
                row.appendChild(column);
                table.appendChild(row);
                row = document.createElement("tr");
                column = document.createElement("td");
                column.appendChild(canvas_autorateupgrade);
                row.appendChild(column);
                column = document.createElement("td");
                column.appendChild(span_auto_ratetotal);
                row.appendChild(column);
                table.appendChild(row);
                div_infowrapperauto.appendChild(table);
                docfrag.appendChild(div_infowrapperauto);
                
                div_infowrapperautoblank = document.createElement("div");
                div_infowrapperautoblank.id = "infoPlayer_div_infowrapperautoblank";
                span_autoblank = document.createElement("span");
                span_autoblank.id = "infoPlayer_span_autoblank";
                span_autoblank.textContent = "Please select a miner.";
                div_infowrapper_select = document.createElement("div");
                div_infowrapper_select.id = "infoPlayer_div_infowrapper_select";
                canvas_autoblankselect_tier0 = document.createElement("canvas");
                canvas_autoblankselect_tier0.id = "infoPlayer_canvas_autoblankselect_tier0";
                canvas_autoblankselect_tier0.width = getImage(Main.Preloader, "icon_autominerselect_tier0.png").width;
                canvas_autoblankselect_tier0.height = getImage(Main.Preloader, "icon_autominerselect_tier0.png").height;
                canvas_autoblankselect_tier0.addEventListener("click", function () {
                    Main.autominerArray_typeselected = 1;
                });
                div_infowrapper_select.appendChild(canvas_autoblankselect_tier0);
                div_infowrapperautoblank.appendChild(span_autoblank);
                div_infowrapperautoblank.appendChild(div_infowrapper_select);
                docfrag.appendChild(div_infowrapperautoblank);
                
                element_information[0].appendChild(docfrag);
                element_information[0].logicInitialized = 1;
            } else {
                scrollPosition = document.getElementById("StageLeft_1").scrollTop;
                div_infowrapperplayer = document.getElementById("infoPlayer_div_infowrapperplayer");
                div_infowrapperauto = document.getElementById("infoAuto_div_infowrapperauto");
                div_infowrapperautoblank = document.getElementById("infoPlayer_div_infowrapperautoblank");
                if (scrollPosition <= scrollflipY) {    //check which menu should be showing
                    infostate = 0;       //0 if player menu, 1 if automining menu
                } else {
                    infostate = 1;
                }
                if (infostate === 0) {  //make the div visible then do the necessary logic
                    div_infowrapperauto.style.display = "none";
                    div_infowrapperautoblank.style.display = "none";
                    div_infowrapperplayer.style.display = "block";
                    span_playertier = document.getElementById("infoPlayer_span_playertier");
                    span_playerstrength = document.getElementById("infoPlayer_span_playerstrength");
                    span_playertier.textContent = "Hardness rating: " + Main.player_mine_tier;
                    span_playerstrength.textContent = "Mining strength: " + Main.player_mine_strength;   
                }
                if (infostate === 1) {
                    div_infowrapperplayer.style.display = "none";
                    if (Main.autominerArray_typeselected === 0) {       //if no miner selected
                        div_infowrapperautoblank.style.display = "block";
                        div_infowrapperauto.style.display = "none";
                    } else {
                        div_infowrapperautoblank.style.display = "none";
                        div_infowrapperauto.style.display = "block";
                        span_auto_type = document.getElementById("infoAuto_span_auto_type");
                        span_auto_count = document.getElementById("infoAuto_span_auto_count");
                        span_auto_ratetotal = document.getElementById("infoAuto_span_auto_ratetotal");
                        //find the object in the objectautominer array
                        for (var i = 0; i < Main.autominerArray.length; i += 1) {
                            if (Main.autominerArray[i].type === Main.autominerArray_typeselected) {
                                autominertypeselected = Main.autominerArray[i];     //set the object that info will be shown for
                            }
                        }
                        //update span info based on object vars
                        span_auto_type.textContent = "Miner type: " + autominertypeselected.type;
                        span_auto_count.textContent = "Miner count: " + autominertypeselected.count;
                        span_auto_ratetotal.textContent = "Miner rate (total): " + (autominertypeselected.rate * autominertypeselected.count);
                    }
                }
            }
        };
        
        Main.information_player_draw = function () {
            var i, element_information, ctx, img, elements_upgradebutton, div_infowrapperplayer, div_infowrapperauto, div_infowrapperautoblank;
            element_information = document.getElementsByClassName("infoPlayer");
            if (element_information[0].logicInitialized) {
                //draw all the upgrade buttons
                elements_upgradebutton = document.getElementsByClassName("info_buttonupgrade");
                div_infowrapperplayer = document.getElementById("infoPlayer_div_infowrapperplayer");
                div_infowrapperauto = document.getElementById("infoAuto_div_infowrapperauto");
                div_infowrapperautoblank = document.getElementById("infoPlayer_div_infowrapperautoblank");
                if (elements_upgradebutton.length > 0) {
                    for (i = 0; i < elements_upgradebutton.length; i += 1) {
                        ctx = elements_upgradebutton[i].getContext("2d");
                        img = getImage(Main.Preloader, "icon_upgrade.png");
                        ctx.drawImage(img, 0, 0);
                    }
                }
                if (div_infowrapperautoblank !== null) {
                    ctx = document.getElementById("infoPlayer_canvas_autoblankselect_tier0").getContext("2d");
                    img = getImage(Main.Preloader, "icon_autominerselect_tier0.png");
                    ctx.drawImage(img, 0, 0);
                }
            }
        };
        
        //left-side menu buttons
        Main.object_button_mines_logic = function () {
            var element_button;
            element_button = document.getElementsByClassName("button_mines");
            for (let i = 0; i < element_button.length; i += 1) {
                if (!element_button[i].logicInitialized) {
                    //element_button[i].style.opacity = 0.1;
                    if (!element_button[i].hasListener) {
                        element_button[i].addEventListener("mouseover", function () {
                            //element_button[i].style.opacity = 1;
                        });
                        element_button[i].addEventListener("mouseout", function () {
                            //element_button[i].style.opacity = 0.1;
                        });
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
            var element_button, slidestate;
            element_button = document.getElementsByClassName("button_refinery");
            for (let i = 0; i < element_button.length; i += 1) {
                if (!element_button[i].logicInitialized) {
                    slidestate = 0;
                    if (!element_button[i].hasListener) {
                        element_button[i].addEventListener("mouseover", function () {
                            slidestate = 1;
                        });
                        element_button[i].addEventListener("mouseout", function () {
                            slidestate = 0;
                        });
                        element_button[i].addEventListener("click", function () {
                            Main.changeToMenu(1);
                        });
                        element_button[i].hasListener = 1;
                        element_button[i].logicInitialized = 1;
                    }
                } else {
                    if (!slidestate) {
                        if (element_button[i].style.left > -50) {
                            element_button[i].style.left -= 1;
                        }
                    } else {
                        if (element_button[i].style.left < 50) {
                            element_button[i].style.left += 1;
                        }
                    }
                }
            }
        };
        //THE ROCK YOU CLICK ON
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
        //autominer objects
        Main.objectauto_miner = function (type) {
            this.type = type;       //type of miner.  Determines initial stats, look, etc.
            this.count = 1;      //how many of this miner.  Starts initially at 1
            this.currentTick = 0;       //tick timer
            //calculate initial vars
            if (this.type === 1) {
                this.strength = 1;      //how many ore produced per click
                this.tier = 1;          //tier of mining.
                this.rate = 1;          //how many times it clicks per sec (a sec in ticks is the framerate!)
            }
            this.logic = function () {      //engine logic call.
                this.timeoutlength = Main.framerate / this.rate;              //calculate the timeout for this function in ticks
            };
            this.mine = function () {       //mining function.  is called after logic
                this.currentTick += 1;                              //add to tick
                if (this.currentTick >= this.timeoutlength) {        //check if enough ticks have been achieved for it to mine
                    Main.mineOre(this.tier, this.strength, this.count);     //mine ore based on its stats
                    this.currentTick = 0;                           //reset the ticks
                }
            };
        };
        Main.autominerArray.push(new Main.objectauto_miner(1));
        
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
                    } else if (e.current_queue < 0) {    //if this made queue negative
                        difference = e.current_queue + e.rate;        //calculate negative queue PLUS the rate
                        if (difference > 0) {       //if this resulted in a positive number, then there is still ore to smelt
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
            var refineryObjectArray, element_menurefinerycontainer, j, e, parentdiv, docfrag,
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
                        docfrag = document.createDocumentFragment();
                        docfrag.appendChild(parentdiv);
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
                        div2_input.addEventListener("keypress", function (event) {
                            if (event.which === 13) {
                                if (refineryObjectArray[i].current_ore === "1a") {
                                    if (div2_input.value <= Main.material_ore_1_a && div2_input.value > 0) {
                                        refineryObjectArray[i].current_queue = div2_input.value;
                                        div2_input.value = null;
                                        refineryObjectArray[i].state = 3;
                                    }
                                }
                                if (refineryObjectArray[i].current_ore === "1b") {
                                    if (div2_input.value <= Main.material_ore_1_b && div2_input.value > 0) {
                                        refineryObjectArray[i].current_queue = div2_input.value;
                                        div2_input.value = null;
                                        refineryObjectArray[i].state = 3;
                                    }
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
                                refineryObjectArray[i].current_queue = Main.material_ore_1_a;
                                refineryObjectArray[i].state = 3;
                            }
                            if (refineryObjectArray[i].current_ore === "1b") {
                                refineryObjectArray[i].current_queue = Main.material_ore_1_b;
                                refineryObjectArray[i].state = 3;
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
                        div2.appendChild(div2_imgore);
                        div2.appendChild(div2_imgcancel);    //append img, input box, button, and cancel to div2
                        div2.appendChild(div2_input);
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
                        div3_imgrefill = document.createElement("canvas");    //create img1 element for refill button
                        div3_imgrefill.id = "refineryslot_div3_imgrefill_" + i;
                        div3_imgrefill.className = "refineryslot_div3_imgrefill";
                        div3_imgrefill.width = 50;
                        div3_imgrefill.height = 25;
                        div3_imgrefill.addEventListener("click", function () {
                            refineryObjectArray[i].state = 4;
                        });
                        div3_imgcancel = document.createElement("canvas");    //create img element for Cancel button
                        div3_imgcancel.className = "refineryslot_cancelbutton";
                        div3_imgcancel.id = "refineryslot_div3_imgcancel_" + i;
                        div3_imgcancel.width = 15;
                        div3_imgcancel.height = 15;
                        div3_imgcancel.addEventListener("click", function () {
                            refineryObjectArray[i].current_queue = 0;
                        });
                        div3.appendChild(div3_span1);    //append span1, span2, img1, img2 to div3
                        div3.appendChild(div3_span2);
                        div3.appendChild(div3_imgrefill);
                        div3.appendChild(div3_imgcancel);
                        parentdiv.appendChild(div3);    //append div3 to parentdiv
                        
                        //state = 4
                        div4 = document.createElement("div");   //create div4 for state 4 menu
                        div4.className = "refineryslot_div4";
                        div4.id = "refineryslot_div4_" + i;
                        div4_imgore = document.createElement("canvas");    //create img1 element for ore chosen previously
                        div4_imgore.className = "refineryslot_div4_imgore";
                        div4_imgore.id = "refineryslot_div4_imgore_" + i;
                        div4_imgore.width = 50;
                        div4_imgore.height = 50;
                        div4_input = document.createElement("input");    //create input box for adding to queue from previously chosen ore
                        div4_input.setAttribute("type", "number");
                        div4_input.className = "refineryslot_div4_input";
                        div4_input.addEventListener("keypress", function (event) {
                            if (event.which === 13) {
                                if (refineryObjectArray[i].current_ore === "1a") {
                                    if (div4_input.value <= Main.material_ore_1_a && div4_input.value > 0) {
                                        refineryObjectArray[i].current_queue = div4_input.value;
                                        div4_input.value = null;
                                        refineryObjectArray[i].state = 3;
                                    }
                                }
                                if (refineryObjectArray[i].current_ore === "1b") {
                                    if (div4_input.value <= Main.material_ore_1_b && div4_input.value > 0) {
                                        refineryObjectArray[i].current_queue = div2_input.value;
                                        div4_input.value = null;
                                        refineryObjectArray[i].state = 3;
                                    }
                                }
                            }
                        });
                        div4_imgall = document.createElement("canvas");    //create button to add all available qty from previously chosen ore
                        div4_imgall.className = "refineryslot_div4_imgall";
                        div4_imgall.id = "refineryslot_div4_imgall_" + i;
                        div4_imgall.width = 50;
                        div4_imgall.height = 25;
                        div4_imgall.addEventListener("click", function () {
                            if (refineryObjectArray[i].current_ore === "1a") {
                                if (refineryObjectArray[i].current_queue < Main.material_ore_1_a) {
                                    refineryObjectArray[i].current_queue = Main.material_ore_1_a;
                                    refineryObjectArray[i].state = 3;
                                }
                            }
                            if (refineryObjectArray[i].current_ore === "1b") {
                                if (refineryObjectArray[i].current_queue < Main.material_ore_1_b) {
                                    refineryObjectArray[i].current_queue = Main.material_ore_1_b;
                                    refineryObjectArray[i].state = 3;
                                }
                            }
                        });
                        div4_imgcancel = getImage(Main.Preloader, "cancel.png");    //create img2 element for Cancel button
                        div4_imgcancel.addEventListener("click", function () {
                            refineryObjectArray[i].state = 3;
                        });         //create event listener for click -> go back to state 3
                        div4_imgcancel = document.createElement("canvas");    //create img element for Cancel button
                        div4_imgcancel.className = "refineryslot_cancelbutton";
                        div4_imgcancel.id = "refineryslot_div4_imgcancel_" + i;
                        div4_imgcancel.width = 15;
                        div4_imgcancel.height = 15;
                        div4_imgcancel.addEventListener("click", function () {
                            refineryObjectArray[i].state = 3;
                        });
                        div4.appendChild(div4_imgore);    //append img1, input box, button, img2 to div4
                        div4.appendChild(div4_imgall);
                        div4.appendChild(div4_input);
                        div4.appendChild(div4_imgcancel);
                        parentdiv.appendChild(div4);    //append div4 to parentdiv
                        
                        element_menurefinerycontainer[0].appendChild(docfrag);    //append docfrag (which holds parentdiv) to the container
                    }
                    element_menurefinerycontainer[0].logicInitialized = 1;  //divs and elements have been created and assigned to an object by ID, it is initialized
                }
            } else {            //if initialized
                for (j = 0; j < refineryObjectArray.length; j += 1) {       //for every refinery slot....
                    e = refineryObjectArray[j];                 //define refinery object this slot refers to
                    div0 = document.getElementById("refineryslot_div0_" + j);       //define all elements related to the refinery object this slot refers to
                    
                    div1 = document.getElementById("refineryslot_div1_" + j);
                    div1_imginput_ore1a = document.getElementById("refineryslot_div1_imginput_ore1a_" + j);
                    div1_imginput_ore1b = document.getElementById("refineryslot_div1_imginput_ore1b_" + j);
                    
                    div2 = document.getElementById("refineryslot_div2_" + j);
                    div3 = document.getElementById("refineryslot_div3_" + j);
                    div3_span1 = document.getElementById("refineryslot_div3_span1_" + j);
                    div3_span2 = document.getElementById("refineryslot_div3_span2_" + j);
                    div4 = document.getElementById("refineryslot_div4_" + j);
                    
                    if (e.state === 0) {        //check state for refinery object (which menu should be shown)
                        div0.style.display = "block";       //show related parent div, hide everything else
                        div1.style.display = "none";
                        div2.style.display = "none";
                        div3.style.display = "none";
                        div4.style.display = "none";
                    }
                    if (e.state === 1) {
                        div0.style.display = "none";
                        div1.style.display = "block";
                        div2.style.display = "none";
                        div3.style.display = "none";
                        div4.style.display = "none";
                        if (Main.material_ore_1_a <= 0) {       //show icon of ores in player's stock, hide them if player doesn't have them
                            div1_imginput_ore1a.style.display = "none";
                        } else {
                            div1_imginput_ore1a.style.display = "inline";
                        }
                        if (Main.material_ore_1_b <= 0) {
                            div1_imginput_ore1b.style.display = "none";
                        } else {
                            div1_imginput_ore1b.style.display = "inline";
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
                        div3_span1.innerHTML = "smelting: " + e.current_ore;        //update values to show smelting progress
                        div3_span2.innerHTML = "left: " + e.current_queue;
                    }
                    if (e.state === 4) {
                        div0.style.display = "none";
                        div1.style.display = "none";
                        div2.style.display = "none";
                        div3.style.display = "none";
                        div4.style.display = "block";
                    }
                }
            }
        };
        
        Main.object_menurefinerycontainer_draw = function () {
            var e, i, ctx, img,
                menurefinerycontainer,
                div1_imgcancel, div1_imginput_ore1a, div1_imginput_ore1b,
                div2_imgore, div2_imgall, div2_imgcancel,
                div3_imgrefill, div3_imgcancel,
                div4_imgore, div4_imgall, div4_imgcancel;
            e = Main.refineryObjectArray;           //define the refinery object being referred to for values
            menurefinerycontainer = document.getElementsByClassName("menurefinerycontainer");       //define the container element that this function draws for
            for (i = 0; i < e.length; i += 1) {
                if (menurefinerycontainer[i].logicInitialized) {        //if logic function has built all the elements (avoids null pointers)
                    if (e[i].state === 1) {         //check state (which menu should be drawn)
                        div1_imginput_ore1a = menurefinerycontainer[i].querySelector("#refineryslot_div1_imginput_ore1a_" + i);         //define canvas elements shown on this menu
                        div1_imginput_ore1b = menurefinerycontainer[i].querySelector("#refineryslot_div1_imginput_ore1b_" + i);
                        div1_imgcancel = menurefinerycontainer[i].querySelector("#refineryslot_div1_imgcancel_" + i);
                        ctx = div1_imgcancel.getContext("2d");      //for each canvas: define context -> define image -> draw image
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
                    if (e[i].state === 3) {
                        div3_imgrefill = document.getElementById("refineryslot_div3_imgrefill_" + i);
                        div3_imgcancel = document.getElementById("refineryslot_div3_imgcancel_" + i);
                        ctx = div3_imgrefill.getContext("2d");
                        img = getImage(Main.Preloader, "icon_refinery_refill.png");
                        ctx.drawImage(img, 0, 0);
                        ctx = div3_imgcancel.getContext("2d");
                        img = getImage(Main.Preloader, "cancel.png");
                        ctx.drawImage(img, 0, 0);
                    }
                    if (e[i].state === 4) {
                        div4_imgore = document.getElementById("refineryslot_div4_imgore_" + i);
                        div4_imgall = document.getElementById("refineryslot_div4_imgall_" + i);
                        div4_imgcancel = document.getElementById("refineryslot_div4_imgcancel_" + i);
                        ctx = div4_imgore.getContext("2d");
                        if (e[i].current_ore === "1a") {
                            img = getImage(Main.Preloader, "icon_refinery_ore1a.png");
                        }
                        if (e[i].current_ore === "1b") {
                            img = getImage(Main.Preloader, "icon_refinery_ore1b.png");
                        }
                        ctx.drawImage(img, 0, 0);
                        ctx = div4_imgall.getContext("2d");
                        img = getImage(Main.Preloader, "icon_refinery_all.png");
                        ctx.drawImage(img, 0, 0);
                        ctx = div4_imgcancel.getContext("2d");
                        img = getImage(Main.Preloader, "cancel.png");
                        ctx.drawImage(img, 0, 0);
                    }
                }
            }
        };
        
        //logic for orecount text objects
        Main.object_oreCounter_logic = function () {
            var element_oreCounter, docfrag,
                span_ore, span_showdetail, row, column,
                divtier1, divtier1_tableraw, divtier1_tableref, divtier1_p_title,
                divtier1_canvasicon_ore1a, divtier1_span_ore1a, divtier1_canvasicon_ore1b, divtier1_span_ore1b,
                divtier1_canvasicon_ref1a, divtier1_span_ref1a, divtier1_canvasicon_ref1b, divtier1_span_ref1b;
            element_oreCounter = document.getElementsByClassName("oreCounter");
            if (!element_oreCounter[0].logicInitialized) {
                docfrag = document.createDocumentFragment();
                span_ore = document.createElement("span");
                span_ore.id = "oreCounter_spanore";
                span_showdetail = document.createElement("span");
                span_showdetail.id = "oreCounter_span_showdetail";
                span_showdetail.textContent = "+";
                span_showdetail.addEventListener("click", function () {
                    if (Main.player_oreCountermenu === 0) {
                        Main.player_oreCountermenu = 1;
                    } else {
                        Main.player_oreCountermenu = 0;
                    }
                });
                //canvas_showdetail add event listener to toggle the divtier1 panel display
                docfrag.appendChild(span_ore);
                docfrag.appendChild(span_showdetail);
                divtier1 = document.createElement("div");
                divtier1.id = "oreCounter_divtier1";
                divtier1.style.display = "none";
                divtier1_p_title = document.createElement("span");
                divtier1_p_title.id = "oreCounter_divtier1_span_title";
                divtier1_p_title.className = "oreCounter_divtier_title";
                divtier1_p_title.textContent = "TIER I";
                divtier1.appendChild(divtier1_p_title); //append the title to div
                divtier1.appendChild(document.createElement("br"));
                
                divtier1_tableraw = document.createElement("table");
                divtier1_tableraw.style.display = "inline-block";
                row = document.createElement("tr");         //create row (1st row)
                column = document.createElement("td");      //create column
                divtier1_canvasicon_ore1a = document.createElement("canvas");
                divtier1_canvasicon_ore1a.id = "oreCounter_divtier1_canvasicon_ore1a";
                divtier1_canvasicon_ore1a.className = "oreCounter_divtier1_canvasicon";
                divtier1_canvasicon_ore1a.width = getImage(Main.Preloader, "icon_oreCounter_1a.png").width;
                divtier1_canvasicon_ore1a.height = getImage(Main.Preloader, "icon_oreCounter_1a.png").height;
                column.appendChild(divtier1_canvasicon_ore1a);  //append icon to column
                row.appendChild(column);        //append column to row
                column = document.createElement("td");      //create new column
                divtier1_span_ore1a = document.createElement("span");
                divtier1_span_ore1a.id = "oreCounter_divtier1_span_ore1a";
                divtier1_span_ore1a.className = "oreCounter_divtier_orenumbers";
                column.appendChild(divtier1_span_ore1a);    //append text to new column
                row.appendChild(column);        //append column to row
                divtier1_tableraw.appendChild(row);        //append the row to the table
                row = document.createElement("tr");         //create row (2nd row)
                column = document.createElement("td");      //create column
                divtier1_canvasicon_ore1b = document.createElement("canvas");
                divtier1_canvasicon_ore1b.id = "oreCounter_divtier1_canvasicon_ore1b";
                divtier1_canvasicon_ore1b.width = getImage(Main.Preloader, "icon_oreCounter_1b.png").width;
                divtier1_canvasicon_ore1b.height = getImage(Main.Preloader, "icon_oreCounter_1b.png").height;
                column.appendChild(divtier1_canvasicon_ore1b);  //append icon to column
                row.appendChild(column);        //append column to row
                column = document.createElement("td");      //create new column
                divtier1_span_ore1b = document.createElement("span");
                divtier1_span_ore1b.id = "oreCounter_divtier1_span_ore1b";
                divtier1_span_ore1b.className = "oreCounter_divtier_orenumbers";
                column.appendChild(divtier1_span_ore1b);    //append text to new column
                row.appendChild(column);        //append column to row
                divtier1_tableraw.appendChild(row);        //append the 2nd row to the table
                divtier1.appendChild(divtier1_tableraw);   //append table under the title
                
                divtier1_tableref = document.createElement("table");
                divtier1_tableref.style.display = "inline-block";
                row = document.createElement("tr");
                column = document.createElement("td");
                divtier1_canvasicon_ref1a = document.createElement("canvas");
                divtier1_canvasicon_ref1a.id = "oreCounter_divtier1_canvasicon_ref1a";
                divtier1_canvasicon_ref1a.className = "oreCounter_divtier1_canvasicon";
                divtier1_canvasicon_ref1a.width = getImage(Main.Preloader, "icon_oreCounter_1aref.png").width;
                divtier1_canvasicon_ref1a.height = getImage(Main.Preloader, "icon_oreCounter_1aref.png").height;
                column.appendChild(divtier1_canvasicon_ref1a);  //append icon to column
                row.appendChild(column);        //append column to row
                column = document.createElement("td");      //create new column
                divtier1_span_ref1a = document.createElement("span");
                divtier1_span_ref1a.id = "oreCounter_divtier1_span_ref1a";
                divtier1_span_ref1a.className = "oreCounter_divtier_refnumbers";
                column.appendChild(divtier1_span_ref1a);    //append text to new column
                row.appendChild(column);        //append column to row
                divtier1_tableref.appendChild(row);        //append the row to the table
                row = document.createElement("tr");         //create row (2nd row)
                column = document.createElement("td");      //create column
                divtier1_canvasicon_ref1b = document.createElement("canvas");
                divtier1_canvasicon_ref1b.id = "oreCounter_divtier1_canvasicon_ref1b";
                divtier1_canvasicon_ref1b.width = getImage(Main.Preloader, "icon_oreCounter_1bref.png").width;
                divtier1_canvasicon_ref1b.height = getImage(Main.Preloader, "icon_oreCounter_1bref.png").height;
                column.appendChild(divtier1_canvasicon_ref1b);  //append icon to column
                row.appendChild(column);        //append column to row
                column = document.createElement("td");      //create new column
                divtier1_span_ref1b = document.createElement("span");
                divtier1_span_ref1b.id = "oreCounter_divtier1_span_ref1b";
                divtier1_span_ref1b.className = "oreCounter_divtier_refnumbers";
                column.appendChild(divtier1_span_ref1b);    //append text to new column
                row.appendChild(column);        //append column to row
                divtier1_tableref.appendChild(row);        //append the 2nd row to the table
                divtier1.appendChild(divtier1_tableref);
                
                docfrag.appendChild(divtier1);          //append the div wrapper to docfrag
                element_oreCounter[0].appendChild(docfrag);     //append the docfrag
                element_oreCounter[0].logicInitialized = 1;     //elements fully created!
            } else {
                span_ore = document.getElementById("oreCounter_spanore");
                span_showdetail = document.getElementById("oreCounter_span_showdetail");
                divtier1 = document.getElementById("oreCounter_divtier1");
                divtier1_span_ore1a = document.getElementById("oreCounter_divtier1_span_ore1a");
                divtier1_span_ore1b = document.getElementById("oreCounter_divtier1_span_ore1b");
                divtier1_span_ref1a = document.getElementById("oreCounter_divtier1_span_ref1a");
                divtier1_span_ref1b = document.getElementById("oreCounter_divtier1_span_ref1b");
                span_ore.textContent = Main.material_ore_1_a + Main.material_ore_1_b + " ores";
                if (divtier1.style.display != "none") {
                    divtier1_span_ore1a.textContent = Main.material_ore_1_a;
                    divtier1_span_ore1b.textContent = Main.material_ore_1_b;
                    divtier1_span_ref1a.textContent = Main.material_refined_1_a;
                    divtier1_span_ref1b.textContent = Main.material_refined_1_b;
                }
            }
        };
        
        Main.object_oreCounter_draw = function () {
            var element_oreCounter, ctx, img,
                divtier1,
                divtier1_canvasicon_ore1a, divtier1_canvasicon_ore1b,
                divtier1_canvasicon_ref1a, divtier1_canvasicon_ref1b;
            element_oreCounter = document.getElementsByClassName("oreCounter");
            if (element_oreCounter[0].logicInitialized) {
                divtier1 = document.getElementById("oreCounter_divtier1");
                if (Main.player_oreCountermenu === 1) {
                    divtier1.style.display = "block";
                    divtier1_canvasicon_ore1a = document.getElementById("oreCounter_divtier1_canvasicon_ore1a");
                    divtier1_canvasicon_ore1b = document.getElementById("oreCounter_divtier1_canvasicon_ore1b");
                    divtier1_canvasicon_ref1a = document.getElementById("oreCounter_divtier1_canvasicon_ref1a");
                    divtier1_canvasicon_ref1b = document.getElementById("oreCounter_divtier1_canvasicon_ref1b");
                    ctx = divtier1_canvasicon_ore1a.getContext("2d");
                    img = getImage(Main.Preloader, "icon_oreCounter_1a.png");
                    ctx.drawImage(img, 0, 0);
                    ctx = divtier1_canvasicon_ore1b.getContext("2d");
                    img = getImage(Main.Preloader, "icon_oreCounter_1b.png");
                    ctx.drawImage(img, 0, 0);
                    ctx = divtier1_canvasicon_ref1a.getContext("2d");
                    img = getImage(Main.Preloader, "icon_oreCounter_1aref.png");
                    ctx.drawImage(img, 0, 0);
                    ctx = divtier1_canvasicon_ref1b.getContext("2d");
                    img = getImage(Main.Preloader, "icon_oreCounter_1bref.png");
                    ctx.drawImage(img, 0, 0);
                } else {
                    divtier1.style.display = "none";
                }
            }
        };
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Upgrades
        ----------------------------------------------------------*/
        Main.object_upgrade = function (name_of_upgrade) {          //upgrades to be kept in the upgrade array
            this.initialized = 0;       //is this upgrade initialized?  0: just made.  1: ready to build canvas elements.
            this.purchased = 0;         //does the player have this upgrade yet?
            this.upgradename = name_of_upgrade;     //string that tells what upgrade this is
            this.available = 0;         //should upgrade be made available to player?
            this.costarray = [];        //array carrying cost [string, #]
            this.arraytocheck = [];     //converted costarray that just contains [#, #]
            this.convertcostarray = function () {       //function to get a new arraytocheck
                this.arraytocheck.length = 0;           //empty the old arraytocheck
                this.arraytocheck = this.costarray.map(function (costarray_element) {       //get values to compare based on string name of material
                    if (costarray_element[0] === "refined_1a") {
                        return [Main.material_refined_1_a, costarray_element[1]];
                    } else if (costarray_element[0] === "refined_1b") {
                        return [Main.material_refined_1_b, costarray_element[1]];
                    } 
                });
            }
            this.availablecheck = function () {     //function to check available status.
                var i, checkcount, checkthiscount;
                this.convertcostarray();        //get new arraytocheck
                checkcount = this.arraytocheck.length;      //initialize checkcounter values
                checkthiscount = 0;
                for (i = 0; i < this.arraytocheck.length; i += 1) {     //for every entry in array...
                    if (this.arraytocheck[i][0] >= this.arraytocheck[i][1]) {       //if the value retrieved from Main is higher than the cost
                        checkthiscount += 1;        //add to the check counter
                    }
                }
                if (checkthiscount === checkcount) {
                    this.available = 1;
                }
            };
            this.costcheck = function () {
                var i, checkcount, checkthiscount;
                this.convertcostarray();        //get new arraytocheck
                checkcount = this.arraytocheck.length;      //initialize checkcounter values
                checkthiscount = 0;
                for (i = 0; i < this.arraytocheck.length; i += 1) {     //for every entry in array...
                    if (this.arraytocheck[i][0] >= this.arraytocheck[i][1]) {       //if the value retrieved from Main is higher than the cost
                        checkthiscount += 1;        //add to the check counter
                    }
                }
                if (checkthiscount === checkcount) {
                    this.purchased = 1;
                }
            }
            //this.iconimage      //icon image to use in research menu
            //this.costcheck      //function to check cost status. 0 if player does not have money, 1 if player does
            
            //check what upgrade it is, then initialize vars based on the name
            if (this.upgradename === "unlock_autominer1") {     //unlock first autominer
                this.iconimage = getImage(Main.Preloader, "icon_upgrade_unlockminer1.png");         //set image for icon in research menu
                this.costarray.push(        //define the cost array for this upgrade
                    ["refined_1a", 10],
                    ["refined_1b", 10]
                );
                this.initialized = 1;
            }
        };
        
        Main.upgradesArray.push(new Main.object_upgrade("unlock_autominer1"));
        
        /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        Menu initialization functions
        ----------------------------------------------------------*/
        Main.menuObjectInitialize = function (object) {
            if (object.initialized) {
                console.log("adding ", object.name);
                Main.menuObjectArray.push(object);
                console.log("obj array length ", Main.menuObjectArray.length);
            }
        };
        
        Main.buildMenu = function (statemenu) {             //function to initialize objects for a menu.  Only call if menuinitialized = 0
            Main.menuTotalObjects = 0;                       //total amount of objects needed to be loaded on a given menu
            Main.menuObjectArray = [];                      //clear the menu object array
            if (statemenu === 0) {                              //if requested to initialize mining menu...
                Main.menuTotalObjects = 6;                  //number of objects that need to be loaded for this specific menu
                Main.menuObjectInitialize(new Main.Object(0, "button_mines", "AreaSelect", "button_mines.png", Main.object_button_mines_logic));
                Main.menuObjectInitialize(new Main.Object(0, "button_refinery", "AreaSelect", "button_refinery.png", Main.object_button_refinery_logic));
                Main.menuObjectInitialize(new Main.Object(2, "oreCounter", "statisticsleft", "no image", Main.object_oreCounter_logic, Main.object_oreCounter_draw));
                Main.menuObjectInitialize(new Main.Object(2, "researchMenu", "research", "no_image", Main.researchmenu_logic, Main.researchmenu_draw));
                
                Main.menuObjectInitialize(new Main.Object(0, "rock", "StageLeft_1", "rock.png", Main.object_rock_logic));
                Main.menuObjectInitialize(new Main.Object(2, "infoPlayer", "information", "no image", Main.information_player_logic, Main.information_player_draw));
                
                while (!Main.menuInitialized) {
                    if (Main.menuObjectArray.length === Main.menuTotalObjects) {    //if all necessary objects are loaded into array
                        console.log("we done here");
                        document.body.appendChild(Main.documentFragment);
                        Main.menuInitialized = 1;               //declare menu is initialized    
                    }
                }
            }
            if (statemenu === 1) {                              //if requested to initialize mining menu...
                Main.menuTotalObjects = 5;                  //number of objects that need to be loaded for this specific menu
                Main.menuObjectInitialize(new Main.Object(0, "button_mines", "AreaSelect", "button_mines.png", Main.object_button_mines_logic));
                Main.menuObjectInitialize(new Main.Object(0, "button_refinery", "AreaSelect", "button_refinery.png", Main.object_button_refinery_logic));
                Main.menuObjectInitialize(new Main.Object(2, "oreCounter", "statisticsleft", "no image", Main.object_oreCounter_logic, Main.object_oreCounter_draw));
                //Main.menuObjectInitialize(new Main.Object(2, "researchMenu", "research", "no_image", Main.researchmenu_logic, Main.researchmenu_draw));
                
                Main.menuObjectInitialize(new Main.Object(0, "refinery_1", "StageLeft_1", "refinery_1.png", Main.object_rock_logic));
                Main.menuObjectInitialize(new Main.Object(2, "menurefinerycontainer", "StageLeft_1", "no_image", Main.object_menurefinerycontainer_logic, Main.object_menurefinerycontainer_draw));
                
                while (!Main.menuInitialized) {
                    if (Main.menuObjectArray.length === Main.menuTotalObjects) {    //if all necessary objects are loaded into array
                        console.log("we done here");
                        document.body.appendChild(Main.documentFragment);
                        Main.menuInitialized = 1;               //declare menu is initialized    
                    }
                }
            }
        };
        
        Main.clearMenu = function () {          //function to clear the menu (before switching menu)
            var i, j, k, target, parent, children, props;
            console.log("docfrag = ", Main.documentFragment);
            Main.documentFragment.appendChild(document.getElementsByClassName("Wrapper")[0]);      //set up the documentfragment
            for (i = 0; i < Main.menuObjectArray.length; i += 1) {      //loop through every object in the object array and delete the elements
                target = Main.menuObjectArray[i];                           //set the target object
                parent = Main.documentFragment.querySelectorAll("#" + target.parentid)[0];          //get the parent element from target object
                console.log("parent = ", parent);
                children = parent.querySelectorAll("." + target.name);    //find the children (array) by class name
                for (j = 0; j < children.length; j += 1) {              //loop through all children
                    props = Object.keys(children[j]);
                    for (k = 0; k < props.length; k += 1) {
                        console.log("deleting prop ", children[j][props[i]]);
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
            canvas_stageleft = document.getElementsByClassName("StageLeftCanvas")[0];
            if (Main.stateMenu === 0) {
                image_stageleft = getImage(Main.Preloader, "background_mines.png");
            }
            if (Main.stateMenu === 1) {
                image_stageleft = getImage(Main.Preloader, "background_mines.png");
            }
            ctx_stageleft = canvas_stageleft.getContext("2d");
            ctx_stageleft.imageSmoothingEnabled = 0;
            ctx_stageleft.clearRect(0, 0, canvas_stageleft.width, canvas_stageleft.height);
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
        
        for (i = 0; i < Main.autominerArray.length; i += 1) {       //loop through the autominerArray
            Main.autominerArray[i].logic();     //do the miners logic function
            Main.autominerArray[i].mine();      //tell it to mine
        }
        
        //check upgrades
        for (i = 0; i < Main.upgradesArray.length; i += 1) {        //loop through upgrades array
            if (Main.upgradesArray[i].available === 0) {
                Main.upgradesArray[i].availablecheck();
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
            if (!Main.stateMenuChanging) {
                //Draw object canvases
                if (Main.menuInitialized) {                               //if menu initialized, draw all objects in array
                    var i;
                    Main.drawBackgrounds();
                    for (i = 0; i < Main.menuObjectArray.length; i += 1) {
                        Main.menuObjectArray[i].draw();
                    }
                }
                Main.tickRender += 1;        // add to tick count
            }
        }
        window.requestAnimationFrame(Main.Render);
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