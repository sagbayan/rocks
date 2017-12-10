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
                    e1 = new main.Object(parentName, className, fLogic, fRender);     //create the new object with logic and render
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
                    main.menu.countObjectsNeeded = 2;     //define how many objects are needed in the menu
                    main.menu.initializeObject("wrapper", "cavescreen", main.objectCavescreenLogic, main.objectCavescreenRender);
                    main.menu.initializeObject("wrapper", "gamescreen", main.objectGamescreenLogic, main.objectGamescreenRender);
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
            //changeToMenu: function (whichmenu) {
                //TODO define change menu and add to logic
            //}
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
        //debug related
        
        //cave screen
        main.cave = {
            initialized: false,
            mapArray: [],
            mapWidth: 1000,     //size of map array.  map is square, so size is width^2
            cameraWidth: 1000,   //viewport of camera in pixels
            cameraHeight: 1000,
            cameraX: 0,         //location of camera in pixels
            cameraY: 0,
            cameraXMin: 0,
            cameraXMax: 0,      //will be recalculated in initialize()
            cameraYMax: 0,
            cameraYMin: 0,
            startX: 0,          //start location (top of cave) will be calculated
            startY: 0,
            tilemapTileSize: 50,
            tilemapFilename: "tilemap_cave.png",
            showMap: false,     //flag that reveals map
            
            initializeMap: function () {
                /*
                1. create empty map
                2. mine it out, and crop it
                3. use flood fill algo to check how big it is
                4. if big enough, let it go, otherwise retry
                */
                var i, j, mapWidth, tilecameraWidth, tilecameraHeight, cameraWidth, cameraHeight, createNewMap, abortFlag;
                mapWidth = main.cave.mapWidth;
                cameraWidth = main.cave.cameraWidth;      //TODO define camera control and then change this back to the main.cave variable
                cameraHeight = main.cave.cameraHeight;
                tilecameraWidth = cameraWidth / main.cave.tilemapTileSize;       //width of camera in tiles.  50
                tilecameraHeight = cameraHeight / main.cave.tilemapTileSize;      //height of camera in tiles.  50
                abortFlag = false;      //catches errors TODO: find out what is actually causing this issue
                
                //create array of mapWidth x mapWidth, initialize with 0 using array.fill method
                main.cave.mapArray = Array.from({length: mapWidth}, () => Array(mapWidth).fill(0));
                
                //mine it out
                //TODO write clever cellular automata function here to make a cave by inserting 1 (no wall) into array
                createNewMap = function () {
                    var i, j, minerHealth, minerX, minerY, minerXStart, minerYStart, minerLoops, minerSize, mineFunction;
                    minerHealth = 20000;   //how many blocks it will attempt to mine
                    minerSize = 3;      //size of block to mine out
                    minerXStart = 500;  //starting location on map for miners
                    minerYStart = 500;
                    minerLoops = 2;     //how many miners will mine
                    mineFunction = function (X, Y) {    //function to "mine" out the map array, based on miner size
                        var z, w, mX, mY;
                        for (z = 0; z < (2 * minerSize); z += 1) {
                            for (w = 0; w < (2 * minerSize); w += 1) {
                                mX = X - minerSize + z;
                                mY = Y - minerSize + w;
                                /*if (main.cave.mapArray[X - minerSize + z] === undefined) {
                                    console.log("we fucked up", X - minerSize + z, main.cave.mapArray[X - minerSize + z]);
                                    console.log(X, Y);
                                    break;
                                }*/
                                if (main.cave.mapArray !== undefined) {
                                    main.cave.mapArray[mX][mY] = 1;
                                }
                            }
                        }
                        main.cave.mapArray[X][Y] = 1;
                    };

                    for (j = 0; j < minerLoops; j += 1) {
                        minerX = minerXStart;   //place miners initially at the start location
                        minerY = minerYStart;
                        for (i = 0; i < minerHealth; i += 1) {
                            var randomX = Math.round(Math.random() * (minerSize * 2)) - (minerSize),  //roll neg or pos, in range of minerSize
                                randomY = Math.round(Math.random() * (minerSize * 2)) - (minerSize);  //roll neg or pos, in range of minerSize
                            minerX = minerX + randomX;  //move in X
                            if (minerX >= (mapWidth + (0.5 * tilecameraWidth)) || minerX <= (0 + (0.5 * tilecameraWidth))) {    //if it hits the edge of map, quit
                                break;
                            } else {
                                //main.cave.mapArray[minerX][minerY] = 1; //mine a wall
                                if (minerX >= mapWidth - minerSize) {   //if it somehow has gone too far, reset location
                                    minerX = minerXStart;
                                }
                                mineFunction(minerX, minerY);
                            }
                            minerY = minerY + randomY;  //move in Y
                            if (minerY >= (mapWidth + (0.5 * tilecameraHeight)) || minerY <= (0 + (0.5 * tilecameraHeight))) {    //if it hits the edge of map, quit
                                break;
                            } else {
                                if (minerY >= mapWidth - minerSize) {   //if it somehow has gone too far, reset location
                                    minerY = minerYStart;
                                }
                                mineFunction(minerX, minerY);
                            }
                        }
                    }
                    //TODO: crop the cave array
                    //find left-most cell
                    var leftX, rightX, topY, botY, breakCheck;
                    breakCheck = false;
                    for (i = 0; i < mapWidth; i += 1) {     //start from left, go to right
                        for (j = 0; j < mapWidth; j += 1) {     //start from top, go to bottom
                            if (main.cave.mapArray[i][j] !== 0) {
                                leftX = i - tilecameraWidth - 1;        //set cropping boundary to 1 tile beyond the camera view limit
                                breakCheck = true;
                                break;
                            }
                        }
                        if (breakCheck) {
                            break;
                        }
                    }
                    //find right-most cell
                    breakCheck = false;
                    for (i = mapWidth - 1; i > -1; i -= 1) {     //start from right, go to left
                        for (j = 0; j < mapWidth; j += 1) {     //start from top, go to bottom
                            if (main.cave.mapArray[i][j] !== 0) {
                                rightX = i + tilecameraWidth + 1;
                                breakCheck = true;
                                break;
                            }
                        }
                        if (breakCheck) {
                            break;
                        }
                    }
                    //find top-most cell
                    breakCheck = false;
                    for (j = 0; j < mapWidth; j += 1) {     //start from top, go to bottom
                        for (i = 0; i < mapWidth; i += 1) {     //start from left, go to right
                            if (main.cave.mapArray[i][j] !== 0) {
                                topY = j - tilecameraHeight - 1;
                                breakCheck = true;
                                break;
                            }
                        }
                        if (breakCheck) {
                            break;
                        }
                    }
                    //find bot-most cell
                    breakCheck = false;
                    for (j = mapWidth - 1; j > -1; j -= 1) {     //start from bottom, go to top
                        for (i = 0; i < mapWidth; i += 1) {     //start from left, go to right
                            if (main.cave.mapArray[i][j] !== 0) {
                                botY = j + tilecameraHeight + 1;
                                breakCheck = true;
                                break;
                            }
                        }
                        if (breakCheck) {
                            break;
                        }
                    }
                    //crop the array using left/right/top/bot values
                    var croppedArray;
                    croppedArray = main.cave.mapArray.slice(leftX, rightX);
                    for (i = 0; i < (croppedArray.length); i += 1) {
                        croppedArray[i] = croppedArray[i].slice(topY, botY);
                    }
                    //find the starting point of the cropped array
                    breakCheck = false;
                    if (croppedArray[0] === undefined || croppedArray[0].length === 0) {    //check if the array was cropped correctly
                        console.log("ABORT! ABORT!");   //if it's not, abandon ship TODO figure out why croppedArray[0].length === 0 sometimes
                        abortFlag = true;
                        return;
                    }
                    for (j = 0; j < croppedArray[0].length; j += 1) {     //start from top, go to bottom
                        for (i = 0; i < croppedArray.length; i += 1) {     //start from left, go to right
                            if (croppedArray[i][j] !== 0) {
                                topY = j - tilecameraHeight - 1;
                                main.cave.startX = i;
                                main.cave.startY = j;
                                breakCheck = true;
                                break;
                            }
                        }
                        if (breakCheck) {
                            break;
                        }
                    }
                    return croppedArray;    //return the cropped array to be checked by floodfill function
                };       //define how the map is populated with space (create the cave), then crop the map
                var mapArrayCropped = createNewMap();   //perform the map function, then create a reference to the new map
                if (abortFlag === true) {   //catch the abort flag, if it's true
                    return;
                }
                //TODO clean up the map
                var cleanMap, cleanLoop;
                cleanLoop = 10;  //how many times to run the cleaning function
                cleanMap = function (checkThisArray) {
                    var i, j, k, l,
                        counterLimit = 5,
                        arrayToClean = JSON.parse(JSON.stringify(checkThisArray));
                    for (i = 1; i < checkThisArray.length - 1; i += 1) {
                        for (j = 1; j < checkThisArray[0].length - 1; j += 1) {     //for each cell in the array to check...
                            var counter = 0;
                            //check its 8 neighboring squares in the array to check
                            //  A   B   C
                            //  D   ?   E
                            //  F   G   H
                            if (checkThisArray[i][j] === 0) {   //if cell is a wall...
                                for (k = -1; k < 2; k += 1) {
                                    for (l = -1; l < 2; l += 1) {   //loop through 8 cells surrounding it
                                        if (k === 0 && l === 0) {   //skip the cell itself
                                            continue;
                                        } else {
                                            if (checkThisArray[i + k][j + l] !== 0) {   //count how many of its 8 neighbors are not walls
                                                counter += 1;
                                            }
                                        }
                                    }
                                }
                                if (counter >= counterLimit) { //if atleast 5 of its neighbors are empty, set itself to empty
                                    arrayToClean[i][j] = 1;
                                }
                            }
                        }
                    }
                    return arrayToClean;
                };
                for (i = 0; i < cleanLoop; i += 1) {    //
                    mapArrayCropped = cleanMap(mapArrayCropped);
                }
                
                console.log(mapArrayCropped.length, mapArrayCropped[0].length);
                //floodfill check
                var floodFillCheckArray = JSON.parse(JSON.stringify(mapArrayCropped)),     //deep copy the cropped array to check and modify for fill
                    floodFillCount,             //count how many cells are filled (how big is the cave?)
                    floodFillFunction,      //does the flood fill
                    floodFillCheckFunction; //calculates the result
                floodFillFunction = function (x, y) {   //define floodfill function
                    if (floodFillCheckArray[x][y] === 99) {     //if the cell to check has already been checked, quit
                        return;
                    }
                    if (floodFillCheckArray[x][y] !== 1) {      //if the cell isn't initially empty, quit
                        return;
                    }
                    var floodFillQueue = [];        //create empty queue array
                    floodFillCheckArray[x][y] = 99; //set the cell to checked (since it has neither been checked nor is it a wall)
                    floodFillQueue.push([x, y]);    //push 2d array, coordinates for x/y for each cell to check
                    while (floodFillQueue.length > 0) { //if there are nodes to remove from queue
                        var temp = floodFillQueue[0],
                            floodcheckx = temp[0],
                            floodchecky = temp[1];
                        floodFillQueue.shift();
                        if (floodFillCheckArray[floodcheckx - 1][floodchecky] === 1) {  //check left
                            floodFillQueue.push([floodcheckx - 1, floodchecky]);
                            floodFillCheckArray[floodcheckx - 1][floodchecky] = 99;
                        }
                        if (floodFillCheckArray[floodcheckx + 1][floodchecky] === 1) {  //check right
                            floodFillQueue.push([floodcheckx + 1, floodchecky]);
                            floodFillCheckArray[floodcheckx + 1][floodchecky] = 99;
                        }
                        if (floodFillCheckArray[floodcheckx][floodchecky - 1] === 1) {  //check up
                            floodFillQueue.push([floodcheckx, floodchecky - 1]);
                            floodFillCheckArray[floodcheckx][floodchecky - 1] = 99;
                        }
                        if (floodFillCheckArray[floodcheckx][floodchecky + 1] === 1) {  //check down
                            floodFillQueue.push([floodcheckx, floodchecky + 1]);
                            floodFillCheckArray[floodcheckx][floodchecky + 1] = 99;
                        }
                    }
                };  //define the floodfill function
                floodFillFunction(main.cave.startX, main.cave.startY);  //perform the floodfill function
                
                floodFillCount = 0;     //set fill count to 0
                floodFillCheckFunction = function () {
                    for (i = 0; i < floodFillCheckArray.length; i += 1) {   //calculate how big the cave is
                        for (j = 0; j < floodFillCheckArray[0].length; j += 1) {
                            if (floodFillCheckArray[i][j] === 99) {
                                floodFillCount += 1;
                            }
                        }
                    }
                };      //define the floodfill check function
                floodFillCheckFunction();       //perform the floodfill check
                
                //TODO reject if count is less than the map size limit
                console.log( floodFillCount, Math.sqrt(floodFillCount));
                var mapSizelimit = 75000;       //define the desired minimum map size
                if (floodFillCount < mapSizelimit) {       //reject the map!
                    console.log("map too small!  Retrying...");
                    main.cave.initialized = false;
                } else {    //accept the map!
                    //replace the map array with the cropped one
                    main.cave.mapArray = mapArrayCropped;
                    console.log(mapArrayCropped);
                    console.log("map done");
                    main.cave.initialized = true;
                }
            },  //initializes the map array
            
            initialize: function () {
                while (!main.cave.initialized) {    //if cave is not initialized, initialize it
                    main.cave.initializeMap();      //create the map array to reference
                }
                
                main.cave.cameraXMax = main.cave.mapArray.length * main.cave.tilemapTileSize - main.cave.cameraWidth;  //define xmax, ymax based on width
                main.cave.cameraYMax = main.cave.mapArray[0].length * main.cave.tilemapTileSize - main.cave.cameraHeight;
                main.cave.cameraXMin = main.cave.tilemapTileSize;   //leave one tile on outside for render
                main.cave.cameraYMin = main.cave.tilemapTileSize;
                main.cave.cameraX = main.cave.startX * main.cave.tilemapTileSize - 0.5 * main.cave.cameraWidth;
                main.cave.cameraY = main.cave.startY * main.cave.tilemapTileSize - 0.5 * main.cave.cameraHeight;
            }   //initializes the cave.  calls to init the map.
        };
        
        main.objectCavescreenLogic = function () {
            var element_cavescreen = document.getElementsByClassName("cavescreen")[0];
            if (!element_cavescreen.logicInitialized) {     //attaches a initialized? boolean to the element for initialization purposes
                var canvas;
                //initialize the cave
                main.cave.initialize();
                
                //add event listeners to control the camera
                //TODO add arrow key camera control
                
                //create canvas element
                canvas = document.createElement("canvas");
                canvas.id = "cavescreenCanvas";
                canvas.width = main.cave.mapArray.length;
                canvas.height = main.cave.mapArray[0].length;
                //canvas.style.border = '1px solid #F00';
                document.addEventListener("keypress", function (e) {
                    if (e.keyCode === 109) {    //toggle map with "M" key
                        if (main.cave.showMap) {
                            main.cave.showMap = false;
                            console.log(main.cave.showMap);
                            return;
                        }
                        if (!main.cave.showMap) {
                            main.cave.showMap = true;
                            console.log(main.cave.showMap);
                            return;
                        }
                    }
                });
                element_cavescreen.appendChild(canvas);
                
                element_cavescreen.logicInitialized = true;
            }
        };
        
        main.objectCavescreenRender = function () {
            var element_cavescreen = document.getElementsByClassName("cavescreen")[0],
                canvas, imageData, context, pixelIndex,
                red, green, blue, alpha,            //color values for imageData
                cellX, cellY,   //X Y location on imageData
                mapWidth, mapHeight,    //camera location on map array of cave
                mapCheckCell, checkX, checkY, checkOOB;           //value of the corresponding cell in the map array
            if (element_cavescreen.logicInitialized) {
                if (!element_cavescreen.renderInitialized) {
                    canvas = document.getElementById("cavescreenCanvas");
                    canvas.style.position = "fixed";
                    context = canvas.getContext("2d");
                    imageData = context.createImageData(main.cave.mapArray.length, main.cave.mapArray[0].length);
                    main.cave.canvasMap = canvas;
                    main.cave.canvasMapImagedata = imageData;
                    
                    element_cavescreen.renderInitialized = true;
                } else {
                    canvas = main.cave.canvasMap;
                    context = canvas.getContext("2d");
                    imageData = main.cave.canvasMapImagedata;
                    //modify imageData based on cave camera
                    mapWidth = main.cave.mapArray.length;
                    mapHeight = main.cave.mapArray[0].length;
                    //console.log("weee ", context, imageData);
                    if (!main.cave.showMap) {
                        canvas.style.display = "none";
                    }
                    if (main.cave.showMap) {    //only draw if showMap is true
                        canvas.style.display = "inline";
                        for (cellX = 0; cellX < mapWidth; cellX += 1) {      //from left to right, for width of camera
                            for (cellY = 0; cellY < mapHeight; cellY += 1) {     //from top to bottom, for height of camera
                                pixelIndex = (cellY * mapWidth + cellX) * 4;       //formula for getting pixel index in imagedata
                                checkX = cellX;       //location in map array to check X
                                checkY = cellY;       //location in map array to check Y
                                if (checkX > main.cave.mapArray.length - 1 || checkY > main.cave.mapArray[0].length - 1) {  //if it's out of bounds, flag checkOOB
                                    checkOOB = true;
                                } else {
                                    checkOOB = false;
                                }
                                if (checkOOB) {
                                    mapCheckCell = -1;
                                } else {
                                    mapCheckCell = main.cave.mapArray[checkX][checkY];    //check the map array cell for each camera pixel
                                    //mapCheckCell = main.cave.croppedmapArray[checkX][checkY]
                                }
                                if (mapCheckCell === -1) {   //if cell is OOB
                                    red = 0;
                                    green = 0;
                                    blue = 255;
                                    alpha = 255;
                                }
                                if (mapCheckCell === 0) {   //if cell is a wall
                                    red = 255;
                                    green = 255;
                                    blue = 255;
                                    alpha = 255;
                                }
                                if (mapCheckCell === 1) {   //if cell is empty
                                    red = 0;
                                    green = 0;
                                    blue = 0;
                                    alpha = 255;
                                }
                                //find the camera X,Y, color it red
                                var mapX = Math.floor(main.cave.cameraX / main.cave.tilemapTileSize),
                                    mapY = Math.floor(main.cave.cameraY / main.cave.tilemapTileSize);
                                if (checkX === mapX && checkY === mapY) {
                                    red = 255;
                                    green = 0;
                                    blue = 0;
                                    alpha = 255;
                                }
                                //edit the imagedata based on cell data
                                imageData.data[pixelIndex] = red;
                                imageData.data[pixelIndex + 1] = green;
                                imageData.data[pixelIndex + 2] = blue;
                                imageData.data[pixelIndex + 3] = alpha;
                            }
                        }
                        //draw it on canvas
                        context.putImageData(imageData, 0, 0);
                    }
                    
                }
            }
        };
        
        main.objectGamescreenLogic = function () {
            var element_gamescreen = document.getElementsByClassName("gamescreen")[0],
                canvas,
                mapX, mapY,         //where on the map array is the camera
                cameraX, cameraY,   //camerax, cameray
                tileAtlas, tileSize;
            if (!element_gamescreen.logicInitialized) {
                //TODO create tilemap blah blah blah
                if (main.cave.initialized) {
                    canvas = document.createElement("canvas");
                    canvas.width = main.cave.cameraWidth;
                    canvas.height = main.cave.cameraHeight;
                    main.cave.canvasGame = canvas;
                    element_gamescreen.appendChild(canvas);
                    
                    element_gamescreen.logicInitialized = true;
                }
            } else {
                canvas = main.cave.canvasGame;
                tileAtlas = getImage(main.cave.tilemapFilename);
                tileSize = main.cave.tilemapTileSize;
                cameraX = main.cave.cameraX;    //where is the camera
                cameraY = main.cave.cameraY;
                mapX = Math.floor(cameraX / tileSize);  //where on the map array is the camera
                mapY = Math.floor(cameraY / tileSize);
            }
        };
        
        main.objectGamescreenRender = function () {
            var element_gamescreen = document.getElementsByClassName("gamescreen")[0],
                canvas, context;
            if (element_gamescreen.logicInitialized) {
                if (!element_gamescreen.renderInitialized) {
                    //TODO create render for tilemap blah blah blah
                    element_gamescreen.renderInitialized = true;
                } else {
                    canvas = main.cave.canvasGame;
                    context = canvas.getContext("2d");
                }
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
        window.requestAnimationFrame(main.render);
        if (main.gameTickTracker === "logic done") {    //only perform render if logic is done! (logic done is a callback)
            //menu render
            if (main.menu.loaded) {     //only render if menu objects are loaded
                for (i = 0; i < main.menu.objectArray.length; i += 1) {
                    main.menu.objectArray[i].render();
                }
            }
            main.gameTickRender += 1;
        }
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