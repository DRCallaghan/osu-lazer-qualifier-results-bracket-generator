# osu! Lazer Tournament Client Bracket Generator CLI

  ## Licensing:
  [![license](https://img.shields.io/badge/license-MIT_License-blue)](https://shields.io/)

  See the licensing file for more information about this project's copyright information.

  ## Table of Contents
  - [Description](#description)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contribution](#contribution)
  - [Additional Info](#additional-info)

  ## Description:
  - This project was built to provide an easy way for anyone to create a bracket.json file for their tournament running on the osu! Lazer tournament client.
  - Without this program, either users must write their own custom script for exporting qualifier results into osu! Lazer, or they must input all results manually. The first solution is very technically challenging, while the manual entry can take upwards of 10 hours for large tournaments. This program solves this problem in a matter of seconds once installed properly.
  - During the course of writing this program, I refreshed much of my knowledge on CLIs, proper commenting and documentation, and file structure.
  - This project is, to my knowledge, the only open source and publicly available osu! Lazer tournament client script for importing qualifier results. It is also fully customizable to any tournament with a qualifier mappool; team size, qualifier pool structure, and mod pool sizes are all left up to the user.

  ## Installation:
  - If you do not have a program which can run CLI apps installed, first install one. I recommend [VSCode](https://code.visualstudio.com/) for Windows users.
  - Make sure you have [node.js](https://nodejs.org/en) installed in VSCode after downloading it. I recommend installing the LTS build recommended for most users.
  - If you have git installed, clone the repo onto your drive.![clone the repo onto your drive](https://i.imgur.com/5SX5L8h.png)
  - If you do not have git installed, download a zip file of this repo.![download a zip file of this repo](https://i.imgur.com/oBaM6JE.png)
  - Open a terminal in the project directory in your code editor.
  - In the terminal, type `npm i`. Then hit enter.
  - Add your `maps.csv` and `scores.csv` files to the `/db` directory. For the structure of these files, see [Usage](#usage). For example structure, sample files are included in the initial download of this program.
  - You are now ready to run the program!


  ## Usage:
  - Make sure your `maps.csv` and `scores.csv` files are formatted correctly!
  - `maps.csv` should follow a basic format of a header row with all slot names, followed by a single other row with all beatmap IDs. See the sample included in this download for an example. ![example](https://i.imgur.com/h203WSb.png)
  - `scores.csv` should follow the following format, in order from left to right, starting with a header row:
    - Team name
    - Team flag code
    - All map scores, in order
    - Overall Seeding
    - All overall mod pool seedings, in order
    - All map seedings, in order
    - Each team's team size
    - All player IDs for each team, in order
    - All player flag codes, in order
  - See the sample included in this download for an example. ![example](https://i.imgur.com/Veh96AP.png)
  - Once these files are correctly formatted and in the `/db` directory, you can run the program without issue.
  - In the terminal, type `node index.js`.
  - Follow all directions for listed in the terminal.
  - Your Lazer `bracket.json` is now in the project directory! Make sure to move it out once finished; all future uses of this program will overwrite any existing file named `bracket.json` in the project directory.

  ## Outside Resources
  There were no collaborators on this project. My information can be found in Additional Info.
  This project uses [node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/).


  ## Contribution
  There are no guidelines for contribution as this project is closed. This project will at some point become deprecated in favor of a web build for further end-use accessibility.

  ## Additional Info
  - Github: [DRCallaghan](https://github.com/DRCallaghan)
  - Email: dennis.callaghan87@gmail.com

  If you would like to reach me for additional questions on this project, you can send me an email at the address listed above. Please title your email "osu! Lazer Tournament Client Bracket Generator CLI - Additional Questions" so I know to reply.