# Email Generator

A node cli that automatically generates emails from images and user inputted links.

## Requirements

* Images in each row must add up to 600px. 
* Each collumn in a row must be the same height.

### Installing

Get the latest stable version of node.js, and run

```
npm install -g lbe
```

### Usage

The first time the tool is used, you must specify a path for the cli to look for your images. This will be the same path that the cli places the generated html file in. To do this, cd into the desired directory, and run
```
lbe configure path
```

To generate an email, run

```
lbe email
```

The cli will prompt you to enter the date this email is for, as well as the name for the email. This name is only used for naming the folder to detect the images.

The cli will automatically open up the file explorer at the directory in which you should paste the images in. Copy and paste the entire "images" folder generated by photoshop into this directory.

The cli will automatically detect when you've done the above step, and generate a "draft" html and open that up in your default browser. Use that draft as a reference to provide the links, and alternative names to the cli.

After you've done this, the cli will generate the final html, which will have the same name as the names of the images provided. This final html will be opened automatically in the browser for review.

Quit the cli by pressing ctrl-c.
