//global variables. 'source-' prefix is related to 1-st (source) box;  'target-' prefix is related to 2-nd (target) box.
var context = canvas.getContext("2d");
var width=600;								//canvas width
var height=300;								//canvas height
var boxSize=200;							//size of boxes
var sourceBoxX=50;							//x-coordinate of source box left border
var targetBoxX=350;							//x-coordinate of target box left border
var boxY=50;								//y-coordinate of top border (both boxes)
var radius=10;								//balls radius
var posLeft=targetBoxX+radius+1;			//min x-coordinate of ball center within target box
var posRight=targetBoxX+boxSize-radius-1;	//max x-coordinate of ball center within target box
var posTop=boxY+boxSize-radius-1;			//min y-coordinate of ball center within target box
var posBottom=boxY+radius+1;				//max y-coordinate of ball center within target box
var selectedBall;							//ball object, which is currently selected
var selectedBallId;							//index of selected ball in balls array
var sourceBalls;							//array of balls in source box
var targetBalls;							//array of balls in target box
var currentX=0;								//current cursor x-coordinate
var currentY=0;								//current cursor y-coordinate
var prevX=0;								//previous cursor x-coordinate
var prevY=0;								//previous cursor y-coordinate
var offsetX=0;								//cursor x-offset from the ball center
var offsetY=0;								//cursor y-offset from the ball center
var originalX=0;							//ball's original x-coordinate (in source box)
var originalY=0;							//ball's original y-coordinate (in source box)

//constructor for balls in the source box
function SourceBall(x,y,color) {
	this.x=x;
	this.y=y;
	this.color=color;		
};

//add 'draw' and 'stroke' methods to SourceBall.prototype object
SourceBall.prototype.draw=function() {
	context.beginPath();
	context.arc(this.x,this.y,radius,0,Math.PI*2,false);
	context.fillStyle = this.color;
	context.fill();
};

SourceBall.prototype.stroke=function() {
	context.beginPath();
	context.arc(this.x,this.y,radius,0,Math.PI*2,false);
	context.strokeStyle = 'yellow';
	context.stroke();
};

//constructor for balls in the target box
function TargetBall(x,y,color,dx,dy) {
	SourceBall.call(this,x,y,color);		//'SourceBall' constructor is called to add 'x','y','color' properties
	this.dx=dx;		
	this.dy=dy;
};

//set 	TargetBall.prototype.__proto__=SourceBall.prototype (this way works in IE)
function inherit(proto) {
	function F() {}
	F.prototype = proto;
	var object = new F;
	return object;
};

TargetBall.prototype=inherit(SourceBall.prototype)
TargetBall.prototype.constructor=TargetBall;

//function for canvas and boxes drawing
function drawArea() {													
	context.clearRect(0,0,width,height);
	context.strokeStyle = 'black';
	context.strokeRect(sourceBoxX,boxY,boxSize,boxSize);
	context.strokeRect(targetBoxX,boxY,boxSize,boxSize);
};

//function to calculate position change and speed change
function makeStep(ball) {	
//calculate interactions with box borders
	if (ball.dx>0) {										//if x-speed>0 (right direction)
		var distX=posRight-ball.x;							//calculate distanse from ball center to max x-coordinate of ball center within target box		
		if (distX>0) {ball.x+=Math.min(ball.dx,distX)}		//if the distanse>0 (ball doesn't touch bax border), change ball x-coordinate (if distanse to border < speed, choose distanse to border)
		else {ball.dx=-ball.dx}								//else (ball touched bax border), change ball x-direction
	}
	else if (ball.dx<0) {									//if x-speed<0 (left direction)
		var distX=posLeft-ball.x;							//calculate distanse from ball center to min x-coordinate of ball center within target box		
		if (distX<0) {ball.x+=Math.max(ball.dx,distX)}		//if the distanse<0 (ball doesn't touch bax border), change ball x-coordinate
		else {ball.dx=-ball.dx}								//else (ball touched bax border), change ball x-direction
	};
	if (ball.dy<0) {										//the same logic for y
		var distY=posBottom-ball.y;
		if (distY<0) {ball.y+=Math.max(ball.dy,distY)}
		else {ball.dy=-ball.dy}
	}
	else if (ball.dy>0) {
		var distY=posTop-ball.y;
		if (distY>0) {ball.y+=Math.min(ball.dy,distY)}
		else {ball.dy=-ball.dy}
	};
//calculate interactions with other balls
	for (var i=0; i<targetBalls.length; i++) {																//for all balls in target box					
		if (targetBalls[i]!=ball) {																			//if ball is not current ball
			var a=ball.x-targetBalls[i].x;																	//calculate difference between x-coordinated of balls centers
			var b=ball.y-targetBalls[i].y;																	//calculate difference between y-coordinated of balls centers
			var distsqr=Math.pow(a,2)+Math.pow(b,2);														//calculate sqr of distance between this ball and current ball
			var dist=Math.sqrt(distsqr);																	//calculate the distance between this ball and current ball
			if (dist<radius*2) {																			//if distanse less than 2 radius (balls touch each other)
				var p1=a*b/distsqr;
				var p2=Math.pow(a,2)/distsqr;
				var p3=Math.pow(b,2)/distsqr;
				var d1=Math.round(ball.dy*p1+ball.dx*p2-targetBalls[i].dy*p1-targetBalls[i].dx*p2);			//calculate x-speed change		
				var d2=Math.round(ball.dx*p1+ball.dy*p3-targetBalls[i].dx*p1-targetBalls[i].dy*p3);			//calculate y-speed change
				ball.dx=ball.dx-d1; 																		//change both balls x-speed and y-speed values
				ball.dy=ball.dy-d2;
				targetBalls[i].dx=targetBalls[i].dx+d1;
				targetBalls[i].dy=targetBalls[i].dy+d2;
				p3=radius-dist/2; 																			//calculate balls intersection														
				p1=Math.round(p3*(a/dist));																	//calculate balls x-intersection	
				p2=Math.round(p3*(b/dist));																	//calculate balls y-intersection	
				ball.x+=p1;																					//change both balls x- and y- coordinates
				ball.y+=p2;										
				targetBalls[i].x-=p1;
				targetBalls[i].y-=p2;
			};
		};
	};	
};

//function returns random RGB color (used to set balls color)
function getRandomColor() {
	var str='0123456789ABCDEF';
	var colorStr='#';
	for (var i=0; i<=5; i++) {
		  colorStr+=str.charAt(Math.floor(Math.random()*str.length));
	};
	return colorStr;
};

//function returns random integer in (min,max) range (used to set balls coordinates)
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

//function returns random coordinate in i-cell within a box
function getRandomCoord(i) {
	return getRandomInt(Math.floor(boxSize*i/3)+radius+1,Math.floor(boxSize*(i+1)/3)-radius-1);
};

//function to check whether cursor within a ball
function isCursorOnBall(ball) {
	return (Math.pow((currentX-ball.x),2)+Math.pow((currentY-ball.y),2)<=Math.pow(radius,2));
};

//function gets data from sessionStorage/document.cookie (if presented) and creates balls objects
function start() {
	sourceBalls=[];															
	targetBalls=[];
	var sourceArr;
	var targetArr;
	if (window.sessionStorage) {											//if sessionStorage is not defined
		sourceArr=sessionStorage.sourceStorage;								//get balls parameters from sessionStorage
		if (sourceArr) {sourceArr=JSON.parse(sourceArr)};		
		targetArr=sessionStorage.targetStorage;		
		if (targetArr) {targetArr=JSON.parse(targetArr)};		
	}
	else {																//get balls parameters from cookie string
		var cookie=document.cookie;
		var sourceIndex=cookie.indexOf('sourceStorage=');
		var targetIndex=cookie.indexOf('targetStorage=');
		if (sourceIndex!=-1) {
			sourceArr=JSON.parse(cookie.substring(sourceIndex+14,cookie.indexOf(';',sourceIndex+14)));
		};
		if (targetIndex!=-1) {
			targetArr=JSON.parse(cookie.substring(targetIndex+14));
		};
	};
	if (sourceArr || targetArr) {																		//if got balls parameters from sessionStorage/documenyt.cookie
		for (var i=0; i<sourceArr.length; i++) {														//fill source box balls array with this parameters
			sourceBalls.push(new SourceBall(sourceArr[i].x, sourceArr[i].y, sourceArr[i].color));
		};
		for (var i=0; i<targetArr.length; i++) {														//fill target box balls array with this parameters
			targetBalls.push(new TargetBall(targetArr[i].x, targetArr[i].y, targetArr[i].color, targetArr[i].dx, targetArr[i].dy));
		};
	}
	else {																		//if no balls parameters in sessionStorage/documenyt.cookie
		for (var i=0; i<=8; i++) {												//here target box is divided to 9 cells (3x3), each ball is placed within it's cell
			var posX=sourceBoxX+getRandomCoord(i%3); 							
			var posY=boxY+getRandomCoord(Math.floor(i/3));
			sourceBalls.push(new SourceBall(posX,posY,getRandomColor()));		//fill source box balls array with this random parameters
		};
	};
};

//call 'start' function
start();																			

//each 30ms call function, which calculates balls positions and draws all the objects
setInterval(function () {
		drawArea();
		for (var i=0; i<targetBalls.length; i++) {		//for all balls in target box
			makeStep(targetBalls[i]);					//change ball position
			targetBalls[i].draw();						//draw ball
		};
		if (selectedBall) {								//if some ball is selected
			selectedBall.x=currentX-offsetX;			//calculate ball position
			selectedBall.y=currentY-offsetY;
		};
		for (var i=0; i<sourceBalls.length; i++) {		//for all balls in source box
			sourceBalls[i].draw();						//draw ball
			if (isCursorOnBall(sourceBalls[i])) {		//if mouse in navigated on the ball, stroke it
				sourceBalls[i].stroke();
			}
		};
	},30);	

//each 300ms call function, which (is some ball is selected by mouse), saves mouse coordinates
setInterval(function () {
	if (selectedBall) {										//if some ball is selected
		prevX=currentX;										//save current cursor coordinates
		prevY=currentY;
	};
},300);

//mousemove handling
canvas.addEventListener('mousemove', function(event) { 
	currentX=event.pageX;									//save mouse coordinates to cursor properties
	currentY=event.pageY;
});

//mousedown handling
canvas.addEventListener('mousedown', function(event) {									
	for (var i=0; i<sourceBalls.length; i++) {	
		if (isCursorOnBall(sourceBalls[i])) {				//if mouseclick was on a ball from source box
			selectedBall=sourceBalls[i];					//copy ball object to selectedBall variable
			selectedBallId=i;								//save ball index in 'sourceBalls' array (it's used to splice it from 'sourceBalls' array, if the ball will be moved to target box)
			originalX=selectedBall.x;						//save original ball coordinates (to put the ball back, if 'mouseup' happens not in target box)
			originalY=selectedBall.y;
			offsetX=currentX-selectedBall.x;				//save cursor offset from the ball center 
			offsetY=currentY-selectedBall.y;
			break;
		};
	}; 
});

//mouseup handling
canvas.addEventListener('mouseup', function() {				
	if (selectedBall) {															//if ball was selected				
		var x=selectedBall.x;				
		var y=selectedBall.y;
		if (!(x>=posLeft && x<=posRight && y>=posBottom && y<=posTop)) {		//if ball is out of target box
			selectedBall.x=originalX;											//set original ball coordinates (to move it back to source box)
			selectedBall.y=originalY;
		}
		else {																	//if ball is within target box,add ball object to targetBalls array
			targetBalls.push(new TargetBall(selectedBall.x,selectedBall.y,selectedBall.color,Math.round((currentX-prevX)/10),Math.round((currentY-prevY)/10)));						
			sourceBalls.splice(selectedBallId,1);								//remove ball object from sourceBalls array
		};
		selectedBall=false; 		//crear selectedBall
	};
});

//beforeunload handling
window.addEventListener('beforeunload',function() {
	var sourceArr=[];											//create 2 arrays to save balls parameters to session storage
	var targetArr=[];											//sourceArr - for boxed from source box, targetArr - for boxed from target box, 
	for (var i=0; i<sourceBalls.length; i++) {
		sourceArr.push({x:sourceBalls[i].x, y:sourceBalls[i].y, color:sourceBalls[i].color});		//for all balls in sourceBalls array add balls parameters to sourceArr
	};
	for (var i=0; i<targetBalls.length; i++) {
		targetArr.push({x:targetBalls[i].x, y:targetBalls[i].y, color:targetBalls[i].color, dx:targetBalls[i].dx, dy:targetBalls[i].dy});//the same for targetBalls array
	};
	if (!window.sessionStorage) {										//if sessionStorage is not defined
		document.cookie = "sourceStorage="+JSON.stringify(sourceArr);	//set cookies with balls parameters
		document.cookie = "targetStorage="+JSON.stringify(targetArr);
	}
	else {
		sessionStorage.sourceStorage=JSON.stringify(sourceArr);				//else set sessionStorage properties with balls parameters
		sessionStorage.targetStorage=JSON.stringify(targetArr);
	};
});

newbutton.addEventListener('click', function() {
	if (!window.sessionStorage) {											//if sessionStorage is not defined
		var date = new Date(0);
		document.cookie = "sourceStorage=; expires="+date.toUTCString();	//remove cookies with balls parameters
		document.cookie = "targetStorage=; expires="+date.toUTCString();
	}
	else {
		delete sessionStorage.sourceStorage;								//else remove sessionStorage properties with balls parameters
		delete sessionStorage.targetStorage;
	};
	start();
});
