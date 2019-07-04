$(document).ready(function () {
    var characters = {
        "Harry Potter": {
            name: "Harry Potter",
            health: 120,
            attack: 8,
            imageURL: "assets/images/harry-potter.jpg",
            enemyAttackBack: 15
        },
        "Draco Malfoy": {
            name: "Draco Malfoy",
            health: 100,
            attack: 14,
            imageURL: "assets/images/draco.jpg",
            enemyAttackBack: 10
        },
        "Severus Snape": {
            name: "Severus Snape",
            health: 150,
            attack: 8,
            imageURL: "assets/images/snape.jpg",
            enemyAttackBack: 5
        },
        "Lord Voldemort": {
            name: "Lord Voldemort",
            health: 180,
            attack: 15,
            imageURL: "assets/images/voldemort.jpg",
            enemyAttackBack: 25
        },

    };

    //variable for the currently selected character
    var selectedCharacter;

    //array variable to contain remaining possible combatants
    var combatants = [];

    //variable to contain current defender
    var currDefender;

    //initial game turn counter
    var turnCounter = 0;

    //initial kill counter
    var killCounter = 0;

    //test
    console.log(characters);

    //function to render a character card to the page

    //character rendered and the area they are rendered to
    var renderOne = function (character, renderArea, charStatus) {
        var charDiv = $("<div class='character' data-name='" + character.name + "'>");
        var charName = $("<div class='character-name'>").text(character.name);
        var charImage = $("<img alt ='image' class='character-image'>").attr("src", character.imageURL);
        var charHealth = $("<div class='character-health'>").text(character.health);
        charDiv.append(charName).append(charImage).append(charHealth);
        $(renderArea).append(charDiv);

        //if the character is an enemy or defender (the active opponent), add the appropriate status
        if (charStatus === "enemy") {
            $(charDiv).addClass("enemy");
        }
        else if (charStatus === "defender") {
            currDefender = character;
            $(charDiv).addClass("target-enemy");
        }
    };

    //function to handle rendering game message
    var renderMessage = function (message) {
        var gameMessage = $("#game-message");
        var newMessage = $("<div>").text(message);
        gameMessage.append(newMessage);

        //if we get this specific message passed in, clear the message area
        if (message === "clearMessage") {
            gameMessage.text("");
        }
    }

    //function to render characters to the page
    var renderCharacters = function (charObj, areaRender) {

        //if true render all characters to the starting area
        if (areaRender === "#characters-section") {
            $(areaRender).empty();

            //loop thru characters object and call the renderOne function
            for (var key in charObj) {
                if (charObj.hasOwnProperty(key)) {
                    renderOne(charObj[key], areaRender, "");
                }
            }
        }

        //selected character appears in "#selected character" div
        //if else statement to render selected character to the div
        if (areaRender === "#selected-character") {
            renderOne(charObj, areaRender);
        }

        //"available-to-attack" div is where in active characters reside
        //if true, render the selected character to this area
        if (areaRender === "#available-to-attack-section") {
            for (var i = 0; i < charObj.length; i++) {
                renderOne(charObj[i], areaRender, "enemy");
            }

            //on click event for each enemy
            $(document).on("click", ".enemy", function () {
                var name = ($(this).attr("data-name"));

                //if there is no defender, the clicked enemy will become the defender
                if ($("#defender").children().length === 0) {
                    renderCharacters(name, "#defender");
                    $(this).hide();
                    renderMessage("clearMessage");
                }
            });
        }

        //"#defender" is the div where the active opponent appears
        //if true, render the selected opponent in this location
        if (areaRender === "#defender") {
            $(areaRender).empty();
            for (var i = 0; i < combatants.length; i++) {
                if (combatants[i].name === charObj) {
                    renderOne(combatants[i], areaRender, "defender");
                }
            }
        }

        //re-render defender when attacked
        if (areaRender === "playerDamage") {
            $("#defender").empty();
            renderOne(charObj, "#defender", "defender");
        }

        //re-render player character when attacked
        if (areaRender === "enemyDamage") {
            $("#selected-character").empty();
            renderOne(charObj, "#selected-character", "");
        }

        //removed defeated enemy
        if (areaRender === "enemyDefeated") {
            $("#defender").empty();
            var gameStateMessage = "You have defeated " + charObj.name + ", you can choose to fight another enemy."
            renderMessage(gameStateMessage);
        }
    }

    //function to restart the game 
    var restartGame = function (inputEndGame) {

        //when restart button is clicked, reload the page
        var restart = $("<button>RESTART</button>").click(function () {
            location.reload();
        })

        //build div to diplsay the victory/defeat message
        var gameState = $("<div>").text(inputEndGame);

        //render restart button and victory/defeat message to page
        $("body").append(gameState);
        $("body").append(restart);
    };

    //call function to render all characters to the page when game begins
    renderCharacters(characters, "#characters-section");

    //click on a character to select it
    $(document).on("click", ".character", function () {

        //test
        console.log("This worked!");

        //variable to safe the name of the selected character
        var name = $(this).attr("data-name");

        //test
        console.log(name);

        //if then statement to run through if a character has been chosen or not
        if (!selectedCharacter) {

            selectedCharacter = characters[name];

            //loop thru leftover charaters and push them to enemies available to attack
            for (var key in characters) {
                if (key !== name) {
                    combatants.push(characters[key]);
                }
            }

            //test
            console.log(combatants);

            //hide the character select div
            $("#characters-section").hide();

            //render selected character and combatants
            renderCharacters(selectedCharacter, "#selected-character");
            renderCharacters(combatants, "#available-to-attack-section");
        }

    });

    //click on attack button
    $("#attack-button").on("click", function () {

        if ($("#defender").children().length !== 0) {

            //reduce defender's health by your attack value
            currDefender.health -= (selectedCharacter.attack * turnCounter);
            console.log(currDefender.health);

            //if the enemy still has health
            if (currDefender.health > 0) {

                //create attack messages
                var attackMessage = "You attacked " + currDefender.name + " for " + (selectedCharacter.attack + turnCounter) + " damage.";
                var counterAttackMessage = currDefender.name + " attacked you back for " + currDefender.enemyAttackBack + " damage.";
                renderMessage("clearMessage");

                //render the enemy's updated character card
                renderCharacters(currDefender, "playerDamage");

                //render combat messages
                renderMessage(attackMessage);
                renderMessage(counterAttackMessage);

                //reduce your health by the attack amount
                selectedCharacter.health -= currDefender.enemyAttackBack;

                //render player's updated character card
                renderCharacters(selectedCharacter, "enemyDamage");
            }

            //call the restartGame function to restart the game
            if (selectedCharacter.health <= 0) {
                renderMessage("clearMessage");
                restartGame("You have been defeated...GAME OVER!!!");
                $("#attack-button").unbind("click");
            }

            //else if the enemy has less than 0 health they are defeated
            else {
                //remove enemy's character card
                renderCharacters(currDefender, "enemyDefeated");

                //increment kill count
                killCounter++;

                //call the restartGame function to allow user to restart game
                //check if all oppoents are dead
                if (killCounter >= 3) {
                    renderMessage("clearMessage");
                    restartGame("YOU WON!!! GAME OVER!!!");
                }
            }
            //increase number of turns by 1 with each click
            turnCounter++;
        }

    });
});