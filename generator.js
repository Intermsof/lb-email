const fs = require('fs');
const colors = require('colors');
const path = require('path');
const sizeof = require('image-size');
const opn = require('opn');
const readline = require('readline');
const websiteRoot = 'https://www.luckybrand.com/';

function outputHTML(dirWithImages,dirToOutput){
    let generatedEmail = '';
    let draftEmail = '<div style="text-align:center; font-size:50px">Draft email: use as reference for entering links in terminal</div>\n';
    let fileName = null;
    //Verify
    let files = fs.readdirSync(dirWithImages);
    files.forEach(file => {
        let sliced = file.slice(0,file.lastIndexOf('_'));
        if(fileName === null){
            fileName = sliced;
        }
        else if(fileName !== sliced){
            console.log(`${"ERROR!".red} ${fileName} != ${sliced}`);
        }
        //TODO: Make sure the files are in ascending order
    });

    //generate draft email
    let currentRowPixels = 0;
    let currentRow = 1;
    let counter = 0;

    //completely synchronous
    const genEmail = (isDraft)=>{
        let internalCounter = 0;
        files.forEach(file =>{
            let imageDir = path.join(dirWithImages,file);
            let imageDimensions = sizeof(imageDir);
            let imageNameNoExtension = file.slice(0,file.lastIndexOf('.'));
            if(currentRowPixels === 0){
                if(isDraft){
                    draftEmail += createRow();
                }
                else{
                    generatedEmail += createRow();
                }
            }
    
            currentRowPixels += imageDimensions.width;
            let isGif = file.slice(file.lastIndexOf('.')) === '.gif';
    
            if(isDraft){
                draftEmail += createCollumn(imageDimensions.width,imageDimensions.height,"dummy",imageDir,isGif,imageNameNoExtension,internalCounter + 1,true);
            }
            else{
                let fullLink = websiteRoot + links[internalCounter];
                generatedEmail += createCollumn(imageDimensions.width, imageDimensions.height, alts[internalCounter], fullLink, isGif,imageNameNoExtension);
            }
    
            if(currentRowPixels === 600){
                currentRow += 1;
                currentRowPixels = 0;
                if(isDraft){
                    draftEmail += endRow();
                }
                else{
                    generatedEmail += endRow();
                }
            }
            else if(currentRowPixels > 600){
                console.log(`${"ERROR:".red} row ${currentRow} does not add up to 600 pixels`);
            }
            
            internalCounter++;
        });
        counter = internalCounter;
    }

    genEmail(true); //generate the draft

    let draftFileDir = path.join(dirToOutput, '.draft.html');
    fs.writeFileSync(draftFileDir,draftEmail);
    opn(draftFileDir);
    
    var links = [];
    var alts = [];

    const createFinalEmail = function(){
        for(let i = 0; i < counter; ++i){
            console.log(links[i], alts[i]);
        }
        genEmail(false);
        let finalFileDir = path.join(dirToOutput, `${fileName}.html`);
        fs.writeFileSync(finalFileDir,generatedEmail);
        fs.unlinkSync(draftFileDir);

        opn(finalFileDir).then((()=>{
            process.exit();
        }));
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var askForLink = (num)=>{
        rl.question(`${"link".green} for ${num + 1}: `, (answer)=>{
            links[num] = answer;
            askForAlt(num);
        });
    };

    var askForAlt = (num)=>{
        rl.question(`${"alt-name".green} for ${num + 1}: `, (answer)=>{
            alts[num] = answer;
            if(num === counter - 1){
                rl.close();
                createFinalEmail();
            }
            else{
                askForLink(num + 1);
            }
        });
    }

    askForLink(0);
}


function createCollumn(width, height, alt, site, isGif, filename,testLabel = -1, draft = false){
    if(draft){
        const src = site;
        const collumn =
        `         <!-- *************************************Begin Collumn************************************* -->
                <td>
                    <a title="4th " href="${site}" style="text-decoration: none;">
                        <div style="position:relative; top:0px; left:0px; width:${width}px; height:0px; overflow:visible">
                            <div style="background-color:gray; opacity: 0.4; color:black; text-align:center; border: 2px solid white; font-size:${Math.min(width,height)}; line-height:${height}px; width: 100%;">
                                ${testLabel}
                            </div>
                        </div>
                        <img width="${width}" height="${height}" src="${src}" alt="${alt}" title="${alt}" style="margin: 0px; padding: 0px; display: block; border: 0px none;" />
                    
                    </a>
                </td>
                <!-- *************************************End Collumn*************************************  -->\n`;
        return collumn;
    }
    else{
        const src = `http://s7d5.scene7.com/is/${isGif? "content" : "image"}/LuckyBrandJeans/${filename}?wid=${width}&amp;qlt=90`;
        const collumn =
        `         <!-- *************************************Begin Collumn************************************* -->
                <td>
                    <a title="${alt}" href="${site}" style="text-decoration: none;">
                        <img width="${width}" height="${height}" src="${src}" alt="${alt}" title="${alt}" style="margin: 0px; padding: 0px; display: block; border: 0px none;" />
                    </a>
                </td>
                <!-- *************************************End Collumn*************************************  -->\n`;
        return collumn;
    }
    
}

function createRow(){
    const rowBegin =
        '<table border="0" cellpadding="0" cellspacing="0" align="center" width="600" style="border-collapse: collapse;">\n\t<tbody>\n\t\t<tr> \n';
    return rowBegin;
}
  
function endRow(){
    const rowEnd = '\t\t</tr>\n\t</tbody>\n</table>\n';
    return rowEnd;
}  

module.exports = outputHTML;