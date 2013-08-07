// establish canvas and context.....................................................................................................

var canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d');
	
canvas.width = 900;
canvas.height = 600;

// initialize variables.............................................................................................................


var clicking = false;
var pixelSize = 16;
var selectedColor = 'fcfcfc';
var selectedTool = "";
var swatchSize = 16;
var sheet = { 
	x: 75,
	y: 100,
	cols:42,
	rows:30   
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

// create an array of squares......................................................................................................

var squares = Array();

for (var col = 0; col < sheet.cols; ++col) {
  for (var row	 = 0; row < sheet.rows; ++row) {	
		squares.push(new Square(sheet.x + (pixelSize * col),(pixelSize * row)));
  }
}


// create the Pallet, an array of swatches.........................................................................................

var pallet = Array();

for (var col = 0; col < 4; ++col) {
  for (var row	 = 0; row < 14; ++row) {	
		pallet.push(new Swatch(sheet.x - (swatchSize * col + swatchSize), sheet.y + (swatchSize * row)));
  }
}
			// the OG NES pallet minus the multiple blacks
pallet[0].color   = "#7C7C7C";
pallet[1].color   = "#0000FC";
pallet[2].color   = "#0000BC";
pallet[3].color   = "#4428BC";
pallet[4].color   = "#940084";
pallet[5].color   = "#A80020";
pallet[6].color   = "#A81000";
pallet[7].color   = "#881400";
pallet[8].color   = "#503000";
pallet[9].color   = "#007800";
pallet[10].color  = "#006800";
pallet[11].color  = "#005800";
pallet[12].color  = "#004058";
pallet[13].color  = "#BCBCBC";
pallet[14].color  = "#0078F8";
pallet[15].color  = "#0058F8";
pallet[16].color  = "#6844FC";
pallet[17].color  = "#D800CC";
pallet[18].color  = "#E40058";
pallet[19].color  = "#F83800";
pallet[20].color  = "#E45C10";
pallet[21].color  = "#AC7C00";
pallet[22].color  = "#00B800";
pallet[23].color  = "#00A800";
pallet[24].color  = "#00A844";
pallet[25].color  = "#008888";
pallet[26].color  = "#F8F8F8";
pallet[27].color  = "#3CBCFC";
pallet[28].color  = "#6888FC";
pallet[29].color  = "#9878F8";
pallet[30].color  = "#F878F8";
pallet[31].color  = "#F85898";
pallet[32].color  = "#F87858";
pallet[33].color  = "#FCA044";
pallet[34].color  = "#F8B800";
pallet[35].color  = "#B8F818";
pallet[36].color  = "#58D854";
pallet[37].color  = "#58F898";
pallet[38].color  = "#00E8D8";
pallet[39].color  = "#787878";
pallet[40].color  = "#FCFCFC";
pallet[41].color  = "#A4E4FC";
pallet[42].color  = "#B8B8F8";
pallet[43].color  = "#D8B8F8";
pallet[44].color  = "#F8B8F8";
pallet[45].color  = "#F8A4C0";
pallet[46].color  = "#F0D0B0";
pallet[47].color  = "#FCE0A8";
pallet[48].color  = "#F8D878";
pallet[49].color  = "#D8F878";
pallet[50].color  = "#B8F8B8";
pallet[51].color  = "#B8F8D8";
pallet[52].color  = "#00FCFC";
pallet[53].color  = "#F8D8F8";
pallet[54].color  = "#000000";
pallet[55].color  = 'rgba(0,0,0,0)';

// create the tools..............................................................................................................

var paintTool = new Swatch(sheet.x - swatchSize * 4, (pallet[pallet.length-1] ).y + swatchSize * 2);

paintTool.selected = true;
paintTool.size  = swatchSize * 2;
paintTool.paint = function(square) {
   square.color = selectedColor;
}
selectedTool = paintTool;

var fillTool  = new Swatch(sheet.x - swatchSize * 2,(pallet[pallet.length-1] ).y + swatchSize * 2);

fillTool.size = swatchSize * 2;
fillTool.fill = function(square) {
	
	for (var count = 0; count < squares.length; ++count) {
		if (squares[count].color == square.color) {
			squares[count].color = selectedColor;	
		}
	}
}



// a bunch o' functions.........................................................................................................

function drawTools(context) {
	
	paintTool.draw(context);
	fillTool.draw(context);	
	
}

function drawPallet(context) {

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
	var size = (350 / Math.pow(-1.1, caption.length)) + 16;
	
	context.font =  + size + "px sans-serif";
	context.textAlign = 'center';
    context.fillStyle = "white";
	
	context.fillText(caption, (sheet.x + (sheet.cols * pixelSize / 2)), (squares[sheet.rows - 2]).y );
	
	context.strokeText(caption, (sheet.x + (sheet.cols * pixelSize / 2)), (squares[sheet.rows - 2]).y );
}


function render(context) {
	
	context.clearRect ( 0, 0, canvas.width, canvas.height);
	
	drawSquares(context);
	drawPallet(context);
	drawTools(context);
	drawCaption(context,caption.value);

	if (logo.ready) {
		context.drawImage(logo, (sheet.x + (sheet.cols * pixelSize)) - 127, (sheet.rows * pixelSize) - 27);	
	}
}

function changeRes(res) {
	var previous = cloneSquares(squares);
	
	switch (res) {
	  case 8: pixelSize = 16;
	  			sheet.cols = 42;
				sheet.rows = 30;
	     break
	
	  case 16: pixelSize = 8;
	  			 sheet.cols = 84;
				 sheet.rows = 60;
		 break
	
	}

	render(context);
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
		fillTool.selected = false;
	} 
	
	fillTool.createPath(context);
	if (context.isPointInPath(loc.x, loc.y)) {
		fillTool.color = selectedColor;
		selectedTool = fillTool;
		fillTool.selected = true;
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

render(context);

alert('YOU SUCK AT JEWEL THEIF, YOU REALLY SUCK SUCK');
