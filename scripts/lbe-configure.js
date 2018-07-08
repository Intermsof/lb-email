#!/usr/bin/env node
const commander = require('commander');
const package = require('../package.json');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const colors = require('colors');

commander.version(package);

commander.command('path')
    .description('call this command to make the current path the working directory')
    .action(()=>{
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let workingDir = process.cwd();
        rl.question(`Make ${workingDir.underline.green} the working directory? ${"(y/n)".yellow}: `, (answer) => {
            if(answer == 'y'){
                let homedir = require('os').homedir();
                let configDir = path.join(homedir,'.lbemail');
                fs.writeFile(configDir, workingDir, function(err) {
                    if(err) {
                      return console.log(err);
                    }
                    console.log(`The working directory is now ${workingDir.underline.green}.`);
                });   
            }
            else{
                console.log(`${"Change aborted.".red}`);  
            }
            rl.close();
        });
    });
    
commander.command('scene7')
    .description('enter your scene7 username and password for automated image upload')
    .action(()=>{
        console.log('you have triggered the scene7 command');
    });

commander.parse(process.argv);