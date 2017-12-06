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
*/
//startregion
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
        //startregion
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
        //endregion
        
        //@@@@@@@@@@@ callback function that is checked on every load to fire main.init @@@@@@@@@@@
        allcontentLoadedCheck = function () {
            if (soundLoaded && imagesLoaded) {
                console.log("preload completed!");
                main.init();
            }
        }
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
        //startregion
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
        /*
        1. declare logic not done
        2. do logic
        3. declare logic done
        */
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