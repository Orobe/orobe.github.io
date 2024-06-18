//Def de elementos de canvas
var c = document.getElementById("canv1");
var ctx = c.getContext("2d");

c.width = window.innerWidth;
c.height = window.innerHeight;

c.addEventListener('click', pause);
window.addEventListener('keydown', this.check, false);

ctx.textBaseline = 'middle';
ctx.textAlign = 'center';

//Crear imagen
var img = new Image();
img.src = 'cubodeagua.png';
var imgGota = new Image();
imgGota.src = 'Gotita.png';
var imgTuto = new Image();
imgTuto.src = 'Lorefinal.png';
var imgQMark = new Image();
imgQMark.src = 'questionmark.png';

//Background
var bgImg = new Image();
bgImg.src = 'fondo.png';
var bgBrown = "#784937"

//Variables
var clientXPos = 100;
var clientYPos;
var posX;
var posY;
var delay = 700;
var i = 0;
var res = 720;
var pTextSize = 30;

//Def tamaño objeto collector para el check de colisión
var collector = {
	width: 50,
	height: 60,
}; 

var btnTutorial = {
	x: (c.width - res) / 2 + 10,
	y: 10,
	width: 48,
	height: 48,
	clicked: false,
};

//GameStates
var inGame = false;
var hasStarted = false;
var isWaiting = true;
var isPaused = true;
var gameOver = false;

//Array de gotas
var gotas = [];

//Puntuación
var gameScore = 0;
var prevScore = 0;

chanceGoodGota = 10;

//Functions a cargar onload
function onLoadFuntzioak(){
	posY = c.height - 130;
	posX = c.width / 2 - (collector.width / 2);
	
	ctx.fillStyle = bgBrown;
	ctx.fillRect(0, 0, c.width, c.height);
	ctx.drawImage(bgImg, (c.width - res) / 2, 0, res, c.height);
	ctx.drawImage(img, posX, posY, collector.width, collector.height);
	
	ctx.drawImage(imgTuto, (c.width - res) / 2, 200, res, 530);
	
	setInterval(marraztu, 16);
	setInterval(genGota, 700);
	setInterval(genGotaGood, 1000);
}



//Generar gráficos
function marraztu(){
	
	if(!isPaused){
		//Limpiar pantalla
		ctx.drawImage(bgImg, (c.width - res) / 2, 0, res, c.height);
	}
	
	if(inGame){

		ctx.fillStyle = bgBrown;
		ctx.fillRect(0, 0, (c.width - res) / 2, c.height);
		ctx.fillRect((c.width - res) / 2 + res, 0, c.width, c.height);
	
		//Mover posX del collector
		aldatuPos();
		
		//Por cada elemento del array de gotas --> cambiar y + dibujar
		if(!isWaiting){
			for(var j = 0; j < gotas.length; j++){
			gotas[j].erori();
			if(gotas.length != 0) gotas[j].irudikatu();
			}
		}
		
		//Dibujar la imagen del collector
		ctx.drawImage(img, posX, posY, collector.width, collector.height);

		if(hasStarted)checkScore();
		

		
	}else if(isPaused && !isWaiting){
		if(!btnTutorial.clicked){
			ctx.font = "48px Arial";
			ctx.fillStyle="#563B36";
			ctx.fillText("PAUSE", c.width / 2, c.height / 2 - 150);
			ctx.drawImage(imgQMark, btnTutorial.x, btnTutorial.y, btnTutorial.width, btnTutorial.height);
		}else{
			ctx.drawImage(imgTuto, (c.width - res) / 2, 200, res, 530);
		}
		if(checkMouseCollision(btnTutorial)) btnTutorial.clicked = true;
	}else if(gameOver){
		ctx.font = "48px Arial";
		ctx.fillStyle="#563B36";
		ctx.fillText("GAME OVER", c.width / 2, c.height / 2 - 200);
		ctx.font = "24px Arial";
		ctx.fillText("Puntuazioa: " + prevScore, c.width / 2, c.height / 2 - 100);
		ctx.fillText("Egin klik partida berria hasteko", c.width / 2, c.height / 2 + 100);
	}
	
	if(!gameOver){
	//Texto de puntuación
	ctx.font = "" + pTextSize + "px Arial";
	ctx.fillStyle="#ffffff";
	ctx.fillText(gameScore, c.width / 2, c.height - 30);
	}
}	

//Actualizar la posición del cursor
function updatePos(e){
	clientXPos = e.clientX;
	clientYPos = e.clientY;
}

var xCursorSpeed = 24;

//Mover el collector según la pos del ratón
function aldatuPos(){
	if(clientXPos - collector.width / 2 < posX && clientXPos - collector.width / 2 + xCursorSpeed < posX && posX > (c.width - res) / 2){
		posX -= xCursorSpeed;
	}else if(clientXPos - collector.width / 2 > posX && clientXPos - collector.width / 2 -xCursorSpeed > posX && posX < (c.width - res) / 2 + res - collector.width){
		posX += xCursorSpeed;
	}
}

//Generar un nuevo objeto 'gota' en el array de gotas
function genGota(){
	if(inGame){
		gotas[i] = new Gota();
		gotas[i].checkPos();
		i++;
		isWaiting = false;
	}
}

function genGotaGood(){
	if(Math.random() < chanceGoodGota / 100 && inGame){
	gotas[i] = new Gota();
	gotas[i].isGood = true;
	gotas[i].genAngle();
	gotas[i].checkPos();
	i++;
	}
}

function checkScore(ptsGained){
	if(gameScore % 50 == 0 && gameScore != 0 || (ptsGained == gota.goodPoints && (gameScore % 50) < gota.goodPoints)){
		ySpeedCurrent += 0.5;
		gotas = [];
		i = 0;
		hasStarted = false;
		isWaiting = true;
		inGame = false;
		for(var cont = 0; cont < 3; cont++){
			setTimeout(wiggleText, 600 * cont);
		}
		setTimeout(function(){inGame = true}, 1800);
	}else if(gameScore == 0){
		gotas = [];
		i = 0;
		hasStarted = false;
		isWaiting = true;
		inGame = false;
	}
}

function pause(){
	if(inGame) {
		inGame = false;
		isPaused = true;
	}else{
		inGame = true;
		isPaused = false;
		gameOver = false;
		if(btnTutorial.clicked) btnTutorial.clicked = false;
	}
}

function check(e){
	//ESC
	if(e.keyCode == 27) pause();
}

function wiggleText(){
	var timesChanged = 20;

		for(var count = 0; count < timesChanged; count++){
			setTimeout(function(){pTextSize++;}, count * 15);
		}
		
		for(count = 0; count < timesChanged; count++){
			setTimeout(function(){pTextSize--;}, count * 15 + 300);
		}
}


function checkMouseCollision(obj){
	var isColliding = false;
	if(obj.x < clientXPos && clientXPos < obj.x + obj.width && obj.y < clientYPos && clientYPos < obj.y + obj.height) isColliding = true;
	return isColliding;
}