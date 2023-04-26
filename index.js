// used for writing new files to the hard drive
const fs = require("fs");
// used for user interaction on the CLI
const inquirer = require('inquirer');
// used for grabbing data from csv files for use in this app
const { parse } = require("csv-parse");

// global variable declaration for use in writing the bracket.json
let teamData = [];
let beatmaps = [];
let bracketText;
let teamSize;
let modPools;
let modLengths;

// separate function for getting the individual mod pool length
function getModLength(mod) {
    inquirer
        .prompt([
            {
                type: 'input',
                message: `How many maps are in the ${mod} pool?`,
                name: 'modPoolLength',
                validate: modPoolLengthInput => {
                    const pass = modPoolLengthInput.match(/^[1-9]\d*$/);
                    if (pass) {
                        return true;
                    }
                    return 'Please enter a positive number greater than zero.';
                }
            }
        ])
        .then((answer) => {
            modLengths.push(answer);
        });
};

// creating a function to write the bracket.json file
function writeToFile(fileName, data) {
    fs.writeFile(fileName, data, (err) => {
        if (err)
            throw err;
        console.log(`Successfully created ${fileName}!`);
    })
}

function readScores(sheetPath) {
    fs.createReadStream(sheetPath)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            teamData.push(row);
        })
        .on("error", function (error) {
            console.log(error.message);
        })
        .on("end", function () {
            console.log("Finished parsing qualifier data.");
        });
}

function readMaps(mappoolPath) {
    fs.createReadStream(mappoolPath)
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
        });
}

function init() {

    // parsing user data
    fs.createReadStream("./db/scores.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            teamData.push(row);
        })
        .on("error", function (error) {
            console.log(error.message);
        })
        .on("end", function () {
            console.log("Finished parsing qualifier data.");

            // parsing map data
            fs.createReadStream("./db/maps.csv")
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

                    // asking the user questions about the tournament format
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
                            }
                        ])
                        .then((answers) => {
                            // putting inquirer answers into global variables for later use
                            teamSize = answers.teamSize;
                            modPools = answers.modPools.split(",");
                            // trimming any mod pools of spaces
                            for (let i = 0; i < modPools.length; i++) {
                                modPools[i] = modPools[i].trim();
                            };
                            // asking the user for the length of every mod pool in order
                            for (let i = 0; i < modPools.length; i++) {
                                getModLength(modPools[i]);
                            };
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
                                let modSeedingResults;
                                let pastMaps = 0;
                                let pastMods = 0;
                                for (let j = 0; j < modPools.length; j++) {
                                    // iterating over each map within that mod pool and adding them all to a string literal to be added to the full bracket text later
                                    for (let k = 0; k < modLengths[j]; k++) {

                                        // declaring variables for easy reading of array values during current map text declaration
                                        // score index is the first thing in the csv file aside from team name and team flag, so we only need to add past maps to 2
                                        let scoreIndex = 2 + pastMaps;
                                        // seed index is after all scores on all maps, which is given by the array.reduce method, and is after all mod pool seeds
                                        let seedIndex = modLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 3) + modPools.length + pastMaps;

                                        // not adding or adding a comma at the end of each map based on whether said map is the last map in a mod pool
                                        let lastMap = modLengths[j] - 1;
                                        let currentMapText;
                                        if (k === lastMap) {
                                            currentMapText = `
                                {
                                    "ID": ${beatmaps[pastMaps]},
                                    "Score": ${teamData[i][scoreIndex]},
                                    "Seed": ${teamData[i][seedIndex]}
                                }`
                                        } else {
                                            currentMapText = `
                                {
                                    "ID": ${beatmaps[pastMaps]},
                                    "Score": ${teamData[i][scoreIndex]},
                                    "Seed": ${teamData[i][seedIndex]}
                                },`
                                        }

                                        // adding the current map to this mod pool's seeding results
                                        modSeedingResults = modSeedingResults + currentMapText;

                                        // adding a buffer of past maps for future iterations
                                        pastMaps++;
                                    }
                                    let modSeedIndex = modLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 3) + pastMods;
                                    modSeedingResults = `
                                ],
                                "Mod": "${modPools[j]}",
                                "Seed": ${teamData[i][modSeedIndex]}
                            }`;

                                    // adding each mod pool's results for that team to the bracket text
                                    bracketText = bracketText + modSeedingResults;

                                    pastMods++;
                                }

                                // adding the necessary ending text to the seeding results section of each team
                                let totalSeedIndex = modLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 2);
                                let seedingResultsEndCap = `
                    ],
                        "Seed": "${teamData[i][totalSeedIndex]}",
                        "Players": [
                            `;
                                bracketText = bracketText + seedingResultsEndCap;

                                // iterating over each team to add all members and their country of origin
                                // doubling the number of maps for map scores and map seeds, adding the number of mod pools for mod pool seeds, adding three for team name, flag, and overall seed
                                let teamSizeIndex = modLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 0) * 2 + modPools.length + 3;
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

                            bracketText = bracketText.substring(0, bracketText.length - 10);
                            bracketText = bracketText + `
    ]
}`;
                            writeToFile('bracket.json', bracketText);
                        });
                });
        });
}

init();
