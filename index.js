const fs = require("fs");
const { parse } = require("csv-parse");

let userData = [];
let beatmaps = [];
let bracketText;

// creating a function to write the bracket.json file
function writeToFile(fileName, data) {
    fs.writeFile(fileName, data, (err) => {
        if (err)
            throw err;
        console.log(`Successfully created ${fileName}!`);
    })
}

function init() {
    // parsing user data
    fs.createReadStream("./db/scores.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            userData.push(row);
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
                    const mapIDs = beatmaps[0];
                    // generating bracket.json text
                    bracketText = `{
        "Ruleset": {
          "ShortName": "osu",
          "Name": "osu!",
          "InstantiationInfo": "osu.Game.Rulesets.Osu.OsuRuleset, osu.Game.Rulesets.Osu",
          "Available": true
        },
        "Teams": [`;
                    for (let i = 0; i < userData.length; i++) {
                        let newTeam = `{
            "FullName": "${userData[i][1]}",
            "FlagName": "${userData[i][2]}",
            "Acronym": "${userData[i][1].substring(0, 4)}",
            "SeedingResults": [
                {
                    "Beatmaps": [
                        {
                            "ID": ${mapIDs[0]},
                            "Score": ${userData[i][3]},
                            "Seed": ${userData[i][21]}
                        },
                        {
                            "ID": ${mapIDs[1]},
                            "Score": ${userData[i][4]},
                            "Seed": ${userData[i][22]}
                        },
                        {
                            "ID": ${mapIDs[2]},
                            "Score": ${userData[i][5]},
                            "Seed": ${userData[i][23]}
                        },
                        {
                            "ID": ${mapIDs[3]},
                            "Score": ${userData[i][6]},
                            "Seed": ${userData[i][24]}
                        }
                    ],
                    "Mod": "NM",
                    "Seed": ${userData[i][17]}
                },
                {
                    "Beatmaps": [
                        {
                            "ID": ${mapIDs[4]},
                            "Score": ${userData[i][7]},
                            "Seed": ${userData[i][25]}
                        },
                        {
                            "ID": ${mapIDs[5]},
                            "Score": ${userData[i][8]},
                            "Seed": ${userData[i][26]}
                        },
                        {
                            "ID": ${mapIDs[6]},
                            "Score": ${userData[i][9]},
                            "Seed": ${userData[i][27]}
                        }
                    ],
                    "Mod": "HD",
                    "Seed": ${userData[i][18]}
                },
                {
                    "Beatmaps": [
                        {
                            "ID": ${mapIDs[7]},
                            "Score": ${userData[i][10]},
                            "Seed": ${userData[i][28]}
                        },
                        {
                            "ID": ${mapIDs[8]},
                            "Score": ${userData[i][11]},
                            "Seed": ${userData[i][29]}
                        },
                        {
                            "ID": ${mapIDs[9]},
                            "Score": ${userData[i][12]},
                            "Seed": ${userData[i][30]}
                        }
                    ],
                    "Mod": "HR",
                    "Seed": ${userData[i][19]}
                },
                {
                    "Beatmaps": [
                        {
                            "ID": ${mapIDs[10]},
                            "Score": ${userData[i][13]},
                            "Seed": ${userData[i][31]}
                        },
                        {
                            "ID": ${mapIDs[11]},
                            "Score": ${userData[i][14]},
                            "Seed": ${userData[i][32]}
                        },
                        {
                            "ID": ${mapIDs[12]},
                            "Score": ${userData[i][15]},
                            "Seed": ${userData[i][33]}
                        }
                    ],
                    "Mod": "DT",
                    "Seed": ${userData[i][20]}
                }
            ],
            "Seed": "${userData[i][16]}",
            "Players": [
                {
                    "country": {
                        "code": "${userData[i][2]}"
                    },
                    "id": ${userData[i][0]},
                    "username": "${userData[i][1]}"
                }
            ]
        },
        `;
                        bracketText = bracketText + newTeam;
                    }

                    bracketText = bracketText.substring(0, bracketText.length - 10);
                    bracketText = bracketText + `
    ]
}`;
                    writeToFile('bracket.json', bracketText);
                });
        });
}

init();
