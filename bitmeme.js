/*  BitMemes - a Simple Pixel Art Web App 

Copyright (c) 2013, Joshua Byard
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met: 

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer. 
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies, 
either expressed or implied, of the copyright owner.

*/

// establish canvas and context.....................................................................................................

var canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 580;

// initialize variables.............................................................................................................


var clicking = false;
var pixelSize = 8;
var selectedColor = 'fcfcfc';
var selectedTool = "";
var grid = true;
var swatchSize = 16;
var sheet = { 
	x: 0,
	y: 0,
	cols:80,
	rows:64
};


var undoCache = Array;

logo = new Image();
logo.ready = false;
logo.src = 'siteImages/logo_small.png';
logo.onload = function(e) {
	logo.ready=true;
}

// objects..........................................................................................................................

var Square = function (x,y) {

	this.x = x;
	this.y = y;
	this.color = 'rgba(0,0,0,0)';
}

Square.prototype = {

	createPath: function (context) {

		context.beginPath();
		context.moveTo(this.x, this.y);
		context.rect(this.x, this.y, pixelSize, pixelSize);

		context.closePath();
	},

	draw: function (context) {

		this.createPath(context);	
		context.fillStyle = this.color;
		context.fill();

	}

}


var Swatch = function (x, y) {

	this.x = x;
	this.y = y;
	this.color = "white";
	this.selected = false;
	this.size = swatchSize;

}

Swatch.prototype = {

	createPath: function (context) {
		context.beginPath();
		context.moveTo(this.x, this.y);
		context.rect(this.x, this.y, this.size, this.size);
		context.closePath()
	},

	draw: function (context) {

		this.createPath(context);
		context.fillStyle = this.color;
		context.fill();

		if (selectedTool == this) {
			context.strokeStyle = 'orange';
		}

		context.stroke();
		context.strokeStyle = 'black';
	}

}


// create the Pallet, an array of swatches.........................................................................................

var pallet = Array();

for (var col = 0; col < 28; ++col) {
  for (var row	 = 0; row < 2; ++row) {	
		pallet.push(new Swatch(sheet.x + (swatchSize * col + swatchSize), (10 + sheet.y + sheet.rows * pixelSize) + (swatchSize * row)));
  }
}
			
if (NESpallet) {
	for (count = 0; count < pallet.length; ++count) {
		pallet[count].color = NESpallet[count];
	}
}

// create the paint tools..............................................................................

var tools = Array();

tools['16bitBrush'] = new Swatch(sheet.x + (sheet.cols * pixelSize) - (swatchSize * 5) - 50,10 + sheet.y + 
										sheet.rows * pixelSize + 2);

tools['16bitBrush'].selected = true;
tools['16bitBrush'].size  = swatchSize;
tools['16bitBrush'].do = function(squares, targetSquare) {
   squares[targetSquare].color = selectedColor;
}
selectedTool = tools['16bitBrush'];

tools['8bitBrush'] = new Swatch(sheet.x + (sheet.cols * pixelSize) - (swatchSize * 3) -50,10 +  sheet.y +
								sheet.rows * pixelSize + 2);

tools['8bitBrush'].size  = swatchSize * 2;
tools['8bitBrush'].do = function(squares, targetSquare) {
	  
	  squares[targetSquare].color = selectedColor;
	  		
	  var over = targetSquare + sheet.rows;
		if (over < squares.length)  squares[over].color = selectedColor;	

	  var down = targetSquare + 1;
	  	if ( down % sheet.rows !== 0 ) squares[down].color = selectedColor;
		
	  var diag = over + 1;
	  	if ( diag % sheet.rows !== 0 && diag < squares.length )  squares[diag].color = selectedColor;
	  
}

tools['bucketFill']  = new Swatch(sheet.x + (sheet.cols * pixelSize) -50,10 +  sheet.y +
									    sheet.rows * pixelSize + 2);

tools['bucketFill'].size = swatchSize * 3;

tools['bucketFill'].do = function(squares, index) {

	// retain the original color of center square, then color it the selected color

	var colorOfindex = squares[index].color;
	squares[index].color = selectedColor;

	// look at neighbors and if they are on page and the same color, call this function on them

	var up = index - 1;
	if ( index % sheet.rows !== 0 ) {
		if (squares[up].color == colorOfindex) this.do(squares, up); 
	} 

	var right = index + sheet.rows;
	if (right < squares.length) {
		if (squares[right].color == colorOfindex) this.do(squares, right);
	}

	var down = index + 1;
	if (down % sheet.rows !== 0) {
		if (squares[down].color == colorOfindex) this.do(squares, down);
	}

	var left = index - sheet.rows;
	if(left > 0) {
		if (squares[left].color == colorOfindex) this.do(squares, left);
	}
}



// a bunch o' functions.........................................................................................................


function drawTools(context) {
	
	context.lineWidth= 4;
	tools['16bitBrush'].draw(context);
	tools['8bitBrush'].draw(context);
	tools['bucketFill'].draw(context);	

}

function drawPallet(context) {
	context.lineWidth= 1;
	for (var q = 0; q < pallet.length; ++q) {
		
		pallet[q].draw(context);
	
	}

}

function drawSquares(context) {

	for (var count = 0; count < squares.length; ++count) {
		
		squares[count].draw(context);	
	
	}

}

function drawCaption(context) {
	
	// get the caption from the document

	var caption = (document.getElementById('caption')).value;

	// text formatting variables 

	var letter = 0;
	var limit = 32;
	var line = 0;
	var lines = Array();
	var offset = 32;
	var words = caption.split(" ")

	// base font size on the caption's length 

	caption.length < 12 ? context.font = "bold 72px Courier": context.font = "bold 32px Courier";

	// font styles

	context.textAlign = 'center';
    context.fillStyle = "white";
	context.strokeStyle = 'black';
	context.lineWidth = 1;
	
	// parse caption into lines of text one word at a time

	for (word = 0; word < words.length; ++word) { 
		
		// add word to line if it's within the line's character limit...

		if (letter + words[word].length < limit && letter < limit) { 

		 lines[line] ? lines[line] = lines[line] + words[word] + " " : lines[line] = words[word] + " ";
		 letter = letter + words[word].length + 1;
			
		// ...or create the next line, and the reset character count.

		} else {

			line = line + 1;
			
			--word;
			letter = 0;
		}

	} 
	
	// draw each line of text, offsetting each line verticaly 

	for (row = 0; row < lines.length; ++row) {

		context.fillText(lines[row], 
						(sheet.x + (sheet.cols * pixelSize / 2)),
						(sheet.y + (sheet.rows * pixelSize)) - 
						(lines.length * offset) + (row * offset));
		
		context.strokeText(lines[row], 
					      (sheet.x + (sheet.cols * pixelSize / 2)),
						  (sheet.y + (sheet.rows * pixelSize)) - 
						  (lines.length * offset) + (row * offset));
	}	

}

function drawGrid(context) {
	context.strokeStyle = 'white';
	
	
	for (var vert = sheet.x, flip = 0; vert < sheet.x + (sheet.cols * pixelSize) + pixelSize; vert += pixelSize, ++flip) {
		context.beginPath();
		context.moveTo(vert, sheet.y); 
		flip % 2 == 0 ? context.lineWidth = 0.5 : context.lineWidth = 0.25; 
		context.lineTo(vert, sheet.y + (sheet.rows * pixelSize));		
		context.stroke();
	  }
	  
	for (var horz = sheet.y, flop = 0; horz < sheet.y + (sheet.rows * pixelSize) + pixelSize; horz += pixelSize, ++flop) {
		context.beginPath();
		context.moveTo(sheet.x, horz);
		flop % 2 == 0 ? context.lineWidth = 0.5 : context.lineWidth = 0.25; 
		context.lineTo(sheet.x + (sheet.cols * pixelSize), horz);
		context.stroke();	
	 }
	
	context.lineWidth= 0.25;
	
}

function toggleGrid() {
	grid = grid ? false: true;
	render(context);
}

function render(context) {

	context.clearRect ( 0, 0, canvas.width, canvas.height);

	drawSquares(context);
	drawPallet(context);
	drawTools(context);
	var showGrid = grid ? drawGrid(context): false;	
	drawCaption(context);

	if (logo.ready) {
		context.drawImage(logo, (sheet.x + (sheet.cols * pixelSize)) - 150, sheet.y + (sheet.rows * pixelSize) - 27);	
	}
}

function cloneSquares(originals) {
	var clones = Array();

	for (var count = 0; count < originals.length; ++count) {
		var clone = new Square(originals[count].x,originals[count].y);
		clone.color = originals[count].color;
		clones.push(clone);
	}

	return clones;
}


function blankScreen() {
	
	var newSquares = Array();

	for (var col = 0; col < sheet.cols; ++col) {
  		for (var row	 = 0; row < sheet.rows; ++row) {	
		newSquares.push(new Square(sheet.x + (pixelSize * col),sheet.y + (pixelSize * row)));
 		 }
	 }	

	return newSquares;

}

function importJSON(src) {
		squares = cloneSquares(JSON.parse(src));
		render(context);
}

function exportJSON() {
	window.location.href = 'data:Application/octet-stream,' +
                         encodeURIComponent(JSON.stringify(squares));
}

function detect(loc) {

	// check to see if mouse is over any squares

	for (var count = 0; count < squares.length; ++count) {
		squares[count].createPath(context);
		if (context.isPointInPath(loc.x, loc.y)) { 		

			selectedTool.do(squares,count);
		}
	}

	// check to see if mouse is over any tools
	for (tool in tools) {
		tools[tool].createPath(context);
		if (context.isPointInPath(loc.x, loc.y)) {
			selectedTool = tools[tool];
		}
	}
	
	// check to see if mouse is over any Swatches
	for (var f = 0; f < pallet.length; ++f) {
		pallet[f].createPath(context);
		if (context.isPointInPath(loc.x, loc.y)) {		

			selectedColor = pallet[f].color;
			selectedTool.color = selectedColor;

		}

	}

}

function downloadImage(context) {
	var busCanvas = document.createElement('canvas');
	busCanvas.width = sheet.cols * pixelSize;
	busCanvas.height = sheet.rows * pixelSize;
	var busContext = busCanvas.getContext('2d');
	
	busContext.drawImage(canvas, sheet.x, sheet.y, busCanvas.width, busCanvas.height, 0 , 0, busCanvas.width, busCanvas.height  );
	
	var image = busCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
	window.location.href=image;
}


function windowToCanvas(canvas, x, y) {    

	var bbox = canvas.getBoundingClientRect();	

	return { x: (x - bbox.left) * (canvas.width / bbox.width),
			  y: (y - bbox.top) * (canvas.height / bbox.height)
	};

}

function undo() {
	squares = cloneSquares(undoCache);
	render(context);
}


// user events......................................................................................................................

canvas.drop = function (e) {

	importJSON(e.dataTransfer.files[0]);
}

canvas.onmousemove = function (e){

	var loc = windowToCanvas(canvas, e.clientX, e.clientY);

	if (clicking) {
	
	detect(loc);

	}
	render(context);
}

canvas.onmouseup = function (e){
	
	clicking = false;	
}

canvas.addEventListener('touchend', function(e) {
	clicking = false;	
});

canvas.onmousedown = function (e) {
    
	undoCache = cloneSquares(squares);

	var loc = windowToCanvas(canvas, e.clientX, e.clientY);

	clicking = true;
	detect(loc);

	render(context);

}

canvas.addEventListener('touchstart', function(e) {
	var loc = windowToCanvas(canvas, e.clientX, e.clientY);

	clicking = true;
	detect(loc);

	render(context);
});


// draw an empty page................................................................................................................

var squares = blankScreen();

render(context);

// alert('YOU SUCK AT JEWEL THEIF, YOU REALLY SUCK SUCK');
