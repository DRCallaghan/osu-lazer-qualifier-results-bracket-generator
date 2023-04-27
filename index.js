// used for writing new files to the hard drive
const fs = require("fs");
// used for user interaction on the CLI
const inquirer = require('inquirer');
// used for grabbing data from csv files for use in this app
const { parse } = require("csv-parse");

function generateBracket() {
    // global variable declaration for use in writing the bracket.json
    let teamData = [];
    let beatmaps = [];
    let bracketText = `{
        "Ruleset": {
            "ShortName": "osu",
            "Name": "osu!",
            "InstantiationInfo": "osu.Game.Rulesets.Osu.OsuRuleset, osu.Game.Rulesets.Osu",
            "Available": true
        },
        "Teams": [
            `;
    let teamSize;
    let modPools;
    let modLengths;
    let modSeedingResults;
    let pastMaps = 0;
    let pastMods = 0;
    // doubling the number of maps for map scores and map seeds, adding the number of mod pools for mod pool seeds, adding three for team name, flag, and overall seed
    let teamSizeIndex;

    // creating a function to read all scores from the scores.csv
    function readScores() {
        fs.createReadStream('./db/scores.csv')
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", function (row) {
                teamData.push(row);
            })
            .on("error", function (error) {
                console.log(error.message);
            })
            .on("end", function () {
                console.log("Finished parsing qualifier data.");
                readMaps();
            });
    }
    // creating a function to read all map info from the maps.csv
    function readMaps() {
        fs.createReadStream('./db/maps.csv')
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", function (row) {
                beatmaps.push(row);
            })
            .on("error", function (error) {
                console.log(error.message);
            })
            .on("end", function () {
                console.log("Finished parsing map ID data.");
                beatmaps = beatmaps[0];
                getTourneyInfo();
            });
    }
    // creating a function to get information on the tournament from the user using inquirer and storing that info in the global variables
    function getTourneyInfo() {
        inquirer
            .prompt([
                // team size
                {
                    type: 'input',
                    message: 'What is the max team size for your tournament? (Required)',
                    name: 'teamSize'
                },
                // mod pools
                {
                    type: 'input',
                    message: 'Please provide a comma-separated list of all mod pools in your qualifiers mappool.',
                    name: 'modPools',
                    validate: modPoolsInput => {
                        if (modPoolsInput) {
                            return true;
                        } else {
                            console.log('Without a list of mod pools, this script does not function. Please provide such a list.');
                            return false;
                        }
                    }
                },
                // mod pool lengths
                {
                    type: 'input',
                    message: 'Please provide a comma-separated list of the length of all mod pools in your qualifiers mappool.',
                    name: 'modLengths',
                    validate: modLengthsInput => {
                        if (modLengthsInput) {
                            return true;
                        } else {
                            console.log('Without a list of mod pool lengths, this script does not function. Please provide such a list.');
                            return false;
                        }
                    }
                }
            ])
            .then((answers) => {
                // putting inquirer answers into global variables for later use
                teamSize = parseInt(answers.teamSize);
                modPools = answers.modPools.split(",");
                // trimming any mod pools of spaces and making them all caps
                for (let i = 0; i < modPools.length; i++) {
                    modPools[i] = modPools[i].trim().toUpperCase();
                };
                modLengths = answers.modLengths.split(",")
                // trimming any mod pool lengths of spaces
                for (let i = 0; i < modLengths.length; i++) {
                    modLengths[i] = parseInt(modLengths[i].trim());
                };
                addTeam();
            })
    }
    // creating a function to write the bracket.json file
    function writeToFile(fileName, data) {
        fs.writeFile(fileName, data, (err) => {
            if (err)
                throw err;
            console.log(`Successfully created ${fileName}!`);
        })
    }
    // creating a function to add each team
    function addTeam() {
        // iterating over all teams, all mod pools, and all users and adding them to the bracket text while including seeding results
        for (let i = 0; i < teamData.length; i++) {

            // creating the basic new team structure to be added many times over
            let newTeam = `{
            "FullName": "${teamData[i][0]}",
            "FlagName": "${teamData[i][1]}",
            "Acronym": "${teamData[i][0].substring(0, 4)}",
            "SeedingResults": [`;

            // adding the new team basic structure to the bracket text before starting mod pool seeding results iteration
            bracketText = bracketText + newTeam;

            // iterating over each mod text and adding all specific maps
            pastMaps = 0;
            pastMods = 0;
            for (let j = 0; j < modPools.length; j++) {
                modSeedingResults = `
                {
                    "Beatmaps": [`;
                // iterating over each map within that mod pool and adding them all to a string literal to be added to the full bracket text later
                for (let k = 0; k < modLengths[j]; k++) {
                    // declaring variables for easy reading of array values during current map text declaration
                    // score index is the first thing in the csv file aside from team name and team flag, so we only need to add past maps to 2
                    let scoreIndex = 2 + pastMaps;
                    // seed index is after all scores on all maps, which is given by the array.reduce method, and is after all mod pool seeds
                    let seedIndex = modLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 3) + modPools.length + pastMaps;

                    let currentMapText = `
                        {
                            "ID": ${beatmaps[pastMaps]},
                            "Score": ${teamData[i][scoreIndex]},
                            "Seed": ${teamData[i][seedIndex]}
                        },`
                    // adding the current map to this mod pool's seeding results
                    modSeedingResults = modSeedingResults + currentMapText;
                    // adding a buffer of past maps for future iterations
                    pastMaps++;
                }
                // removing the last comma from the set of map scores
                modSeedingResults = modSeedingResults.substring(0, modSeedingResults.length - 1);
                // getting the index of the mod pool seed from the csv
                let modSeedIndex = modLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 3) + pastMods;
                // finishing the mod seeding results
                modSeedingResults = modSeedingResults + `
                ],
                "Mod": "${modPools[j]}",
                "Seed": ${teamData[i][modSeedIndex]}
                },`;
                // adding each mod pool's results for that team to the bracket text
                bracketText = bracketText + modSeedingResults;
                // adding a buffer of past mods for future iterations
                pastMods++;
            }
            // removing the last comma from the set of mod scores
            bracketText = bracketText.substring(0, bracketText.length - 1);

            // adding the necessary ending text to the seeding results section of each team
            let totalSeedIndex = modLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 2);
            let seedingResultsEndCap = `
                    ],
                        "Seed": "${teamData[i][totalSeedIndex]}",
                        "Players": [
                            `;
            bracketText = bracketText + seedingResultsEndCap;

            // setting the index of the team size in the scores.csv file
            teamSizeIndex = modLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 2 + modPools.length + 3;
            // iterating over each team to add all members and their country of origin
            for (let j = 0; j < teamData[i][teamSizeIndex]; j++) {
                let uid = teamSizeIndex + 1 + j;
                let uflag = uid + teamSize;
                let playerData = `{
                                "country": {
                        "code": "${teamData[i][uflag]}"
                    },
                    "id": ${teamData[i][uid]}
                },`;
                bracketText = bracketText + playerData;
            };
            bracketText = bracketText.substring(0, bracketText.length - 1);
            let teamEnd = `]
                    },
        `;
            bracketText = bracketText + teamEnd;
        }
        // removing the last comma from the set of players
        bracketText = bracketText.substring(0, bracketText.length - 10);
        // ending the bracket file
        bracketText = bracketText + `
            ]
        }`;
        // writing the full file
        writeToFile('bracket.json', bracketText);
    }

    // calling all functions in order
    readScores();
}

generateBracket();
