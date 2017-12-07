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

/*
code prenotes:
using custom code regions:
"//" + * + either of the start/end keywords:
    startregion
    endregion
*/

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@ ENTIRE FUCKING GAME @@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/*
1. define basic shortcut/helper functions
2. define the main object as empty object
3. define main.pipeline
4. call main.pipeline (declares the game not ready and defines high level game engine functions)
5. define the window onload event (triggers preload when game is declared not ready, then preload triggers the rest of the game engine)
*/
//startregion

//step 1 @@@@@@@@@@@ define basic shortcut/helper functions/vars that are outside main object @@@@@@@@@@@
/*
1. assets object: define the assets and then holds assets in arrays
2. getImage function
*/
//startregion
//assets
var assets = {
    domainImages: "res/images/",     //domain path to load images
    arrayImagesFilenames: [         //array that holds filename strings for image files
        "test_1.png",
        "test_2.png"
    ],
    arrayImages: [],
    domainSound: "res/sounds/",      //domain path to load sounds
    arraySoundFilenames: [          //array that holds filename strings for sound files
        "button-37.mp3"
    ],
    arraySound: []
};

//get image function
function getImage(string_name) {    //get image by filename from assets
    var imageIndex = assets.arrayImagesFilenames.indexOf(string_name);     //find the index of the image you are looking for by filename
    return assets.arrayImages[imageIndex];
}

//endregion

//step 2 @@@@@@@@@@@ define main object as empty object @@@@@@@@@@@
/*
this is where the game object starts being defined
*/
//startregion
var main = {};      //yes, this is literally it
//endregion

//step 3 @@@@@@@@@@@ define pipeline function @@@@@@@@@@@
/*
1. declare game not ready
2. define the preload
3. define init
    I. define low level game functions, variables
    II. declare the game ready
    III. call loop and render (main game loop)
4. define logic
5. define render
6. define loop
*/
//startregion
main.pipeline = function () {
    //step 1 @@@@@@@@@@@ declare game not ready @@@@@@@@@@@
    main.ready = 0;
    
    //step 2 @@@@@@@@@@@ define the preload function @@@@@@@@@@@
    /*
    1. loads assets into arrays containing objects
    2. check array length to see if objects are loaded in
    3. if they are, call main.init to begin initializing the game
    */
    //startregion
    main.preload = function () {
        //@@@@@@@@@@@ load assets image/sound resources @@@@@@@@@@@
        /*
        1. store images to an array by name
        2. store sounds to another array by name
        3. store misc resources to another array by name
        */
        //define assets arrays
        var i, filename,
            contentToLoadCount_images = assets.arrayImagesFilenames.length,  //number of images files to load from res directory
            domainImages = assets.domainImages,             //domain for the image files
            imagesLoaded = false,
            contentToLoadCount_sounds = assets.arraySoundFilenames.length,  //number of sound files to load from res directory
            domainSound = assets.domainSound,
            soundLoaded = false,
            allcontentLoadedCheck;
        for (i = 0; i < contentToLoadCount_images; i += 1) {
            var imageToPush = new Image();
            filename = assets.arrayImagesFilenames[i];
            imageToPush.src = domainImages + filename;
            imageToPush.onload = function () {
                assets.arrayImages.push(imageToPush);
                if (assets.arrayImages.length === contentToLoadCount_images) {
                    imagesLoaded = true;
                    allcontentLoadedCheck();
                }
            };
        }
        for (i = 0; i < contentToLoadCount_sounds; i += 1) {
            var soundToPush = new Audio();
            filename = assets.arraySoundFilenames[i];
            soundToPush.src = domainSound + filename;
            soundToPush.oncanplaythrough = function () {
                assets.arraySound.push(soundToPush);
                if (assets.arraySound.length === contentToLoadCount_sounds) {
                    soundLoaded = true;
                    allcontentLoadedCheck();
                }
            };
        }
        //callback function that is checked on every file load to fire main.init
        allcontentLoadedCheck = function () {
            if (soundLoaded && imagesLoaded) {
                console.log("preload completed!");
                main.init();
            }
        };
    };
    //endregion
    
    //@@@@@@@@@@@ define init @@@@@@@@@@@
    /*
    1. define variables
    2. define functions
    3. declare the game ready
    4. call main.loop and main.render
    */
    //startregion
    main.init = function () {
        //@@@@@@@@@@@ define all variables and functions @@@@@@@@@@@
        /*
        1. top-level game variables (framerate, ticker, etc)
        2. Menus
        3. top-level game objects (HTML elements)
        4. lower game objects (logic and render functions)
        */
        //startregion
        //@@@@@@@@@@@ top-level game variables
        main.gameFramerate = 60;        //target framerate of game engine (FPS)
        main.gameTickrate = 1000 / main.gameFramerate;     //amount of time per tick.  sets the loop speed to match game framerate
        main.gameTickEngine = 0;              //ticker counter for game engine.  starts at 0
        main.gameTickRender = 0;
        main.gameTickLoop = 0;
        main.gameTickTracker = "";    //tells the engine where the game is
        
        //@@@@@@@@@@@ menu functions and variables
        main.menu = {
            state: "preloader", //tells what menu the game is on
            loaded: false,      //tells if the menu objects are loaded
            countObjectsNeeded: 0,  //keeps count of objects needed on screen
            objectArray: [],    //array that holds the objects in the menu (check against countObjectsNeeded)
            
            initializeObject: function () {     //arg1 = parentName, arg2 = className, arg3 = fLogic, arg4 = fRender
                var e1,
                    parentName = arguments[0],
                    className = arguments[1],
                    fLogic = function () {},    //logic and render will be blank functions if not defined by method call
                    fRender = function () {};
                if (arguments.length === 2) {
                    e1 = new main.Object(parentName, className);     //create the new object with no logic or render function (just a div)
                    e1.initialize(fLogic, fRender);
                }
                if (arguments.length === 3) {
                    e1 = new main.Object(parentName, className);     //create the new object with no render
                    fLogic = arguments[2];
                    e1.initialize(fLogic, fRender);
                }
                if (arguments.length === 4) {
                    e1 = new main.Object(parentName, className, fLogic, fRender);     //create the new object
                    fLogic = arguments[2];
                    fRender = arguments[3];
                    e1.initialize(fLogic, fRender);
                }
                if (e1.initialized) {
                    main.menu.objectArray.push(e1);
                    console.log("initialized ",e1.classname);
                }
            },
            buildMenu: function (whichmenu) {   //function to build menu (after it is empty)
                main.menu.objectArray = [];     //empty array
                if (whichmenu === "cave") {
                    main.menu.countObjectsNeeded = 1;     //define how many objects are needed in the menu
                    main.menu.initializeObject("wrapper", "cavescreen", main.objectCavescreenLogic, main.objectCavescreenRender);
                }
                
                while (!main.menu.loaded) {
                    if (main.menu.objectArray.length === main.menu.countObjectsNeeded) {
                        console.log("menu loaded!");
                        main.menu.loaded = true;
                    }
                }
            },
            clearMenu: function () {    //function to clear menu
                var i, j, k, parent, children, target, props;
                for (i = 0; i < main.menu.objectArray.length; i += 1) {
                    target = main.menu.objectArray[i];
                    parent = document.querySelectorAll("#" + target.parentName)[0];     //get parent element by ID of this object type
                    children = parent.querySelectorAll("." + target.classname);         //get array of child elements of parent
                    for (j = 0; j < children.length; j += 1) {          //loop through all the children
                        props = Object.keys(children[j]);               //find their properties
                        for (k = 0; k < props.length; k += 1) {
                            console.log("deleting prop ", children[j][props[i]]);
                            delete children[j][props[i]];
                        }
                        parent.removeChild(children[j]);
                    }
                }
                main.menu.loaded = false;
            },
            changeToMenu: function (whichmenu) {
                //TODO define change menu and add to logic
            }
        };
        
        //@@@@@@@@@@@ top-level game objects
        main.Object = function () {                 //the object that controls HTML element
            this.initialized = 0;             //tells if the object is initialized
            this.parentName = arguments[0];
            this.classname = arguments[1];
            this.logic = function () {};      //logic function as defined by initialize
            this.render = function () {};     //render function as defined by initialize
            this.elementReference = {};         //reference to the HTML element controlled by this object
            this.initialize = function (fLogic, fRender) {       //creates the div element, appends it to parent, defines the logic and render functions, calls it done.
                var e1 = document.createElement("div"),
                    parentElement = document.getElementById(this.parentName);
                e1.className = this.classname;
                parentElement.appendChild(e1);
                this.logic = fLogic;
                this.render = fRender;
                this.initialized = 1;
            };
        };
        
        //@@@@@@@@@@@ lower-level game objects
        //cave screen
        main.cave = {
            initialized: false,
            mapArray: [],
            mapWidth: 1000,     //size of map array.  map is square, so size is width^2
            cameraWidth: 400,   //viewport of camera
            cameraHeight: 400,
            
            initializeMap: function () {
                var i, j, mapWidth;
                mapWidth = main.cave.mapWidth;
                //populate array with 0
                for (i = 0; i < mapWidth; i += 1) {
                    for (j = 0; j < mapWidth; j += 1) {
                        main.cave.mapArray.push(0);     //populate with 0 (wall)
                    }
                }
                //mine it out
                //TODO write clever cellular automata function here to make a cave
                for (i = 0; i < 200; i += 1) {
                    main.cave.mapArray[200][i] = 1;
                }
            },
            
            initialize: function () {
                main.cave.initializeMap();      //create the map to reference
            }
        };
        
        main.objectCavescreenLogic = function () {
            var element_cavescreen = document.getElementsByClassName("cavescreen")[0];
            if (!element_cavescreen.logicInitialized) {     //attaches a initialized? boolean to the element for initialization purposes
                var canvas;
                canvas = document.createElement("canvas");
                canvas.id = "cavescreenCanvas";
                canvas.width = getImage("test_1.png").width;
                canvas.height = getImage("test_1.png").height;
                element_cavescreen.appendChild(canvas);
                
                element_cavescreen.logicInitialized = true;
            }
        };
        
        main.objectCavescreenRender = function () {
            var element_cavescreen = document.getElementsByClassName("cavescreen")[0];
            if (element_cavescreen.logicInitialized) {
                var canvas, image;
                canvas = document.getElementById("cavescreenCanvas");
                image = getImage("test_1.png");
                canvas.getContext("2d").drawImage(image, 0, 0);
            }
        };
        
        //endregion
        
        //@@@@@@@@@@@ declare game ready @@@@@@@@@@@
        main.ready = 1;
        
        //@@@@@@@@@@@ call loop, call render @@@@@@@@@@@
        //startregion
        main.loop();
        main.render();
        //endregion
    };
    //endregion
    
    //@@@@@@@@@@@ define logic @@@@@@@@@@@
    /*
    1. declare logic is starting
    2. do logic
    3. declare logic is done
    */
    //startregion
    main.logic = function () {
        var i;
        //declare logic is starting
        main.gameTickTracker = "logic start";
        
        //menu logic
        if (!main.menu.loaded) {        //check if menu isn't loaded
            main.menu.buildMenu("cave");    //build menu if it isn't
        } else {    //if it is, then do the logic function of all objects in menu
            for (i = 0; i < main.menu.objectArray.length; i += 1) {
                main.menu.objectArray[i].logic();
            }
        }
        
        //declare logic is done
        main.gameTickEngine += 1;
        main.gameTickTracker = "logic done";
    };
    //endregion
    
    //@@@@@@@@@@@ define render @@@@@@@@@@@
    /*
    1. check if logic is done
    2. do render
    3. call renderframe to callback main.render
    */
    //startregion
    main.render = function () {
        /*
        1. check if logic is done
        2. do render
        3. call for renderframe to repeat this function call (starts a loop)
        */
        var i;
        if (main.gameTickTracker === "logic done") {    //only perform render if logic is done! (logic done is a callback)
            //menu render
            if (main.menu.loaded) {     //only render if menu objects are loaded
                for (i = 0; i < main.menu.objectArray.length; i += 1) {
                    main.menu.objectArray[i].render();
                }
            }
            main.gameTickRender += 1;
        }
        window.requestAnimationFrame(main.render);
    };
    //endregion
    
    //@@@@@@@@@@@ define loop @@@@@@@@@@@
    /*
    1. call main. logic
    2. settimeout to callback main.loop based on main.framerate
    */
    //startregion
    main.loop = function () {
        /*
        1. call logic
        2. set to repeat based on game framerate
        */
        main.logic();
        //time compensation functions go HERE
        main.gameTickLoop += 1;
        setTimeout(main.loop, main.gameTickrate);
    };
    //endregion
    
};
//endregion

//step 4 @@@@@@@@@@@ call main.pipeline @@@@@@@@@@@
/*
this launches the game
*/
//startregion
main.pipeline();                   //boot that shit up
//endregion

//step 5 @@@@@@@@@@@ define the window.onload event @@@@@@@@@@@
/*
1. check if preload is done by checking if the game is ready
2. if the game is not ready, call the preload (should only happen once)
*/
//startregion
window.onload = function () {
    console.log("window.onload called");
    if (!main.ready) {
        console.log("preload called");
        main.preload();
    }
};
//endregion

//thanks for playing :)
//endregion