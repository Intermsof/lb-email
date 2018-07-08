#!/usr/bin/env node
const commander = require('commander');
const package = require('../package.json');
const colors = require('colors');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const opn = require('opn');
const outputHTML = require('../generator');

function awaitImages(dir){
    opn(dir);
    console.log(dir);
    const dirToWatch = path.join(dir,'images');
    if(fs.existsSync(dirToWatch)){
        console.log("change fired and dir exists");
        outputHTML(dirToWatch,dir);
    }
    else{
        fs.watchFile(dirToWatch, (eventType,filename) =>{
            if(fs.existsSync(dirToWatch)){
                console.log("change fired and dir exists");
                outputHTML(dirToWatch,dir);
            }else{
                console.log("changed fire but dir does not exist");
            }
        });
    }
}

commander.version(package.version);

commander.command('configure','provide configurations to the cli');

commander.command('email')
    .description('generate an email from images')
    .action(()=>{
        //Attempt to get working directory
        let homedir = require('os').homedir();
        let configDir = path.join(homedir,'.lbemail');
        if(fs.existsSync(configDir)){
            const configReader = readline.createInterface({
                input: fs.createReadStream(configDir)
            });

            let lineCounter = 0;
            configReader.on('line',(line)=>{
                if(lineCounter === 0){
                    let workingDirectory = line;
                    setup(workingDirectory);
                }
            });
        }else{
            console.log(`Your working directory has not been set. Please cd into desired directory and ${"run 'lb configure path'".red} \n`);
            process.exit();
        }
    });

commander.parse(process.argv);

function setup(workingDirectory){
    let date = new Date();
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    const dateCallback = (str, key) => {
        if (key && key.name === 'return') {
            process.stdout.write('\n');
    
            //Parse date into string for folder
            const year = date.getFullYear().toString();
            const _month = date.getMonth() + 1; //A Number 
            const month = _month < 10 ? `0${_month}` : _month.toString(); //A String
            const _myDate = date.getDate(); //A Number
            const myDate = _myDate < 10? `0${_myDate}` : _myDate.toString(); //A String

            const parsedDate = year + month + myDate;
            console.log(`Email will be in folder ${parsedDate.green}`);
            process.stdin.removeListener('keypress',dateCallback);

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('What is the name of the email? ', (answer) => {
                let dateDir = path.join(workingDirectory, parsedDate);
                const createEmailDir = ()=>{
                    let dir = path.join(workingDirectory, parsedDate, answer);
                    if(!fs.existsSync(dir)){
                        fs.mkdir(dir, (err)=>{
                            if(err){
                                console.log(err);
                            }else
                            awaitImages(dir);
                        });
                    }
                    else{
                        awaitImages(dir);
                    } 
                };
                if(!fs.existsSync(dateDir)){
                    fs.mkdir(dateDir, (err)=>{
                        if(err){
                            console.log(err);
                        }else
                            rl.close();
                            createEmailDir();
                    });
                }
                else{
                    rl.close();
                    createEmailDir();
                }
            });

            
        } 
        else if(key && key.name === 'tab'){
            readline.clearLine(process.stdout,0);
            date.setDate(date.getDate() + 1);
            readline.cursorTo(process.stdout,0); 
            process.stdout.write(`Which date is this email for?: ${date.toDateString().green}`);
        }
        else if(key && key.name == 'q'){
            readline.clearLine(process.stdout,0);
            date.setDate(date.getDate() - 1);
            readline.cursorTo(process.stdout,0); 
            process.stdout.write(`Which date is this email for?: ${date.toDateString().green}`);
        }
        else {
            console.log(`You pressed the "${str}" key`);
            console.log();
            console.log(key);
            console.log();
            process.exit();
        }
    };
    process.stdout.write(`Which date is this email for?: ${date.toDateString().green}`);
    process.stdin.on('keypress', dateCallback);
}


/*


                //Create readline
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                let dir = process.cwd();
                rl.question('What is the name of the email?', (answer) => {
                    console.log(answer);
                });
*/
/*

const sizeOf = require('image-size');
const readline = require('readline');
const fs = require('fs');
//Table creation strings
const rowBegin =
  `
  <table border="0" cellpadding="0" cellspacing="0" align="center" width="600" style="border-collapse: collapse;">
    <tbody>
      <tr> \n`;
const rowEnd =
  `
      </tr>
    </tbody>
  </table>`;
  //<!-- *************************************End Row************************************* -->\n
  //<!-- *************************************Begin Row************************************* -->
//The result of the email we are currently appending to
let generatedEmail = '';

const lineReader = readline.createInterface({
  input: fs.createReadStream('config.in')
});

const StateEnum = Object.freeze({
  readSiteRoot: 0,
  readFilename: 1,
  readNumRows: 2,
  readNumCollumns: 3,
  readCollumn: 4,
});

let collumnsLeft = 0;
let rowsLeft = 0;
let state = StateEnum.readSiteRoot;
let siteRoot;
let fileName;
let imageCounter = 2;

lineReader.on('line',(line) => {
  switch (state) {
    case StateEnum.readSiteRoot:
      siteRoot = line;
      state = StateEnum.readFilename;
      break;
    case StateEnum.readFilename:
      fileName = line;
      state = StateEnum.readNumRows
      break;
    case StateEnum.readNumRows:
      rowsLeft = parseInt(line);
      state = StateEnum.readNumCollumns;
      break;
    case StateEnum.readNumCollumns:
      createRow();
      collumnsLeft = parseInt(line);
      state = StateEnum.readCollumn;
      break;
    case StateEnum.readCollumn:
      //Do things with data
      let collumnData = line.split(",");
      let fullFileName = fileName;

      if(imageCounter >= 10){
        fullFileName += ("_" + imageCounter);
      }else{
        fullFileName += ("_0" + imageCounter);
      }

      let extension;
      let type;
      if(fs.existsSync("images/" + fullFileName + ".gif")){
        extension = ".gif";
        type = 1;
      }else{
        extension = ".png";
        type = 0;
      }

      let dimensions = sizeOf("images/" + fullFileName + extension);
      let siteAddress = siteRoot + collumnData[1];
      imageCounter++;
      createCollumn(dimensions.width,dimensions.height,
          collumnData[0],siteAddress,type,fullFileName);

      //Finish doing things with data
      collumnsLeft--;
      if(collumnsLeft <= 0){
        rowsLeft--;

        if(rowsLeft == 0){
          endRow()
          fs.writeFile("./generated.html", generatedEmail, function(err) {
            if(err) {
              return console.log(err);
            }
            console.log("The file was saved!");
          });
        }else{
          state = StateEnum.readNumCollumns;
          endRow();
        }
      }
      break;
  }
});




function createCollumn(width, height, alt, site, type, filename){
  const src = `http://s7d5.scene7.com/is/${type == 0? "image" : "content"}/LuckyBrandJeans/${filename}?wid=${width}&amp;qlt=90`

  const collumn =
  `         <!-- *************************************Begin Collumn************************************* -->
          <td>
              <a title="4th " href="${site}">
                  <img width="${width}" height="${height}" src="${src}" alt="${alt}" title="${alt}" style="margin: 0px; padding: 0px; display: block; border: 0px none;" />
              </a>
          </td>
          <!-- *************************************End Collumn*************************************  -->\n`
  generatedEmail += collumn;
}

function createRow(){
  generatedEmail += rowBegin;
}

function endRow(){
  generatedEmail += rowEnd
}

*/