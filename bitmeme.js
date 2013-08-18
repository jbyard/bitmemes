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
var grid = false;
var swatchSize = 16;
var sheet = { 
	x: 0,
	y: 0,
	cols:80,
	rows:64
};

var captionInput = document.getElementById('caption');
var undo = Array;

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
	this.color = '#000';
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

		if (this.selected) {
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

// create the tools..............................................................................................................

var paintTool = new Swatch(sheet.x + (sheet.cols * pixelSize) - (swatchSize * 5) - 50,10 + sheet.y + 
										sheet.rows * pixelSize + 2);

paintTool.selected = true;
paintTool.size  = swatchSize;
paintTool.paint = function(square) {
   square.color = selectedColor;
}
selectedTool = paintTool;

var eightBitTool = new Swatch(sheet.x + (sheet.cols * pixelSize) - (swatchSize * 3) -50,10 +  sheet.y +
								sheet.rows * pixelSize + 2);

eightBitTool.size  = swatchSize * 2;
eightBitTool.paint = function(targetSquare) {
	  
	  squares[targetSquare].color = selectedColor;
	  		
	  var over = targetSquare + sheet.rows;
		if (over < squares.length)  squares[over].color = selectedColor;	

	  var down = targetSquare + 1;
	  	if ( down % sheet.rows !== 0 ) squares[down].color = selectedColor;
		
	  var diag = over + 1;
	  	if ( diag % sheet.rows !== 0 && diag < squares.length )  squares[diag].color = selectedColor;
	  
}

var fillTool  = new Swatch(sheet.x + (sheet.cols * pixelSize) -50,10 +  sheet.y +
									    sheet.rows * pixelSize + 2);

fillTool.size = swatchSize * 3;
fillTool.fill = function(square) {

	for (var count = 0; count < squares.length; ++count) {
		if (squares[count].color == square.color) {
			squares[count].color = selectedColor;	
		}
	}
}



// a bunch o' functions.........................................................................................................

function drawTools(context) {
	context.lineWidth= 4;
	
	paintTool.draw(context);
	eightBitTool.draw(context);
	fillTool.draw(context);	

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

function drawCaption(context, caption) {

	context.font = "bold 32px Courier";
	context.textAlign = 'center';
    context.fillStyle = "white";
	context.strokeStyle = 'black';
	context.lineWidth = 1;

	context.fillText(caption, (sheet.x + (sheet.cols * pixelSize / 2)), (squares[sheet.rows - 4]).y );

	context.strokeText(caption, (sheet.x + (sheet.cols * pixelSize / 2)), (squares[sheet.rows - 4]).y );
}

function drawGrid(context) {
	context.strokeStyle = 'white';
	context.lineWidth= 0.25;
	
	for (var vert = sheet.x; vert < sheet.x + (sheet.cols * pixelSize) + pixelSize; vert += pixelSize) {
		context.beginPath();
		context.moveTo(vert, sheet.y);
		context.lineTo(vert, sheet.y + (sheet.rows * pixelSize));		
		context.stroke();
	  }
	  
	for (var horz = sheet.y; horz < sheet.y + (sheet.rows * pixelSize) + pixelSize; horz += pixelSize) {
		context.beginPath();
		context.moveTo(sheet.x, horz);
		context.lineTo(sheet.x + (sheet.cols * pixelSize), horz);
		context.stroke();	
	 }
	
	
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
	drawCaption(context,caption.value);

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

function loadSquares(f) {

	squares = cloneSquares(JSON.parse(f));
	render(context);
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

function makeJSON() {

	document.write(JSON.stringify(undo));
}

function detect(loc) {

	// check to see if mouse is over any squares

	for (var count = 0; count < squares.length; ++count) {
		squares[count].createPath(context);
		if (context.isPointInPath(loc.x, loc.y)) { 		

			switch (selectedTool) {
				case paintTool: paintTool.paint(squares[count]);
			      break
				case eightBitTool: eightBitTool.paint(count); 				
				  break
				case fillTool: fillTool.fill(squares[count]);
				  break
				default:  paintTool.paint(squares[count]);
				  break
			}
		}
	}

	// check to see if mouse is over any tools

	paintTool.createPath(context);
	if (context.isPointInPath(loc.x, loc.y)) {
		paintTool.color = selectedColor;
		selectedTool = paintTool;
		paintTool.selected = true;
		eightBitTool.selected = false;
		fillTool.selected = false;
	} 
	
	eightBitTool.createPath(context);
	if (context.isPointInPath(loc.x, loc.y)) {
		eightBitTool.color = selectedColor;
		selectedTool = eightBitTool;
		eightBitTool.selected = true;
		paintTool.selected = false;
		fillTool.selected = false;
	} 

	fillTool.createPath(context);
	if (context.isPointInPath(loc.x, loc.y)) {
		fillTool.color = selectedColor;
		selectedTool = fillTool;
		fillTool.selected = true;
		eightBitTool.selected = false;
		paintTool.selected = false;
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

function windowToCanvas(canvas, x, y) {    

	var bbox = canvas.getBoundingClientRect();	

	return { x: (x - bbox.left) * (canvas.width / bbox.width),
			  y: (y - bbox.top) * (canvas.height / bbox.height)
	};

}


// user events......................................................................................................................



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
    
	undo = cloneSquares(squares);

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