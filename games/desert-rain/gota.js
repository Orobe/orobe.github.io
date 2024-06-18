//Def tamaño objeto gota para el check de colisión
var gota = {
	width: 28,
	height: 44,
	stdPoints: 1,
	goodPoints: 5,
};

var startingYSPeed = 3;
var ySpeedCurrent = startingYSPeed;


//Generador de gotas para el array
function Gota(){
	
	//Variables de cada gota. "this" hace referencia a la gota que llama a la función. O sea gotas[i]
	this.x = Math.random() * (res-gota.height) + (c.width - res) / 2;
	this.y = -gota.height;
	this.yspeed = ySpeedCurrent;
	this.hueAngle = 0;
	this.isGood = false;
	
	//Boolean para saber si esta gota puede puntuar o no. Para evitar que la misma gota te suba 800 puntos por segundo
	this.collected = false;

	//Función de cambio de pos de la gota
	this.erori = function(){
		
		this.yspeed = ySpeedCurrent;
		this.y += this.yspeed;
		
		//Si la gota puede puntuar --> Mirar colisión con el collector --> Mirar si se ha pasado del suelo para resetear puntuación / game over.
		if(!this.collected){
			this.checkCollision();
			if(this.y > c.height - gota.height){
				if(!this.isGood){
					hasStarted = true;
					prevScore = gameScore;
					gameScore = 0;
					ySpeedCurrent = startingYSPeed;
					gameOver = true;
				}
				//Si toca suelo --> No puede puntuar ni quitar puntos
				this.collected = true;
			}
		}
	}

	//Función de checkeo de colisión
	this.checkCollision = function(){
		if(posX < this.x + gota.width && posX + collector.width > this.x && posY < this.y + gota.height && posY + collector.height > this.y){
			//Si colisiona --> No puede puntuar más + cambia de color para diferenciar + puntuación++
			this.collected = true
			if(this.isGood){
				gameScore += gota.goodPoints;
				checkScore(gota.goodPoints);
			}else{
				gameScore++;
				checkScore(gota.stdPoints);
			}
			hasStarted = true;
			
		}
	}
	
	this.checkPos = function(){
		if(gotas.length > 1){
			while((this.x < gotas[gotas.indexOf(this) - 1].x && gotas[gotas.indexOf(this) - 1].x < this.x + gota.width) ||
				(gotas[gotas.indexOf(this) - 1].x < this.x && this.x < gotas[gotas.indexOf(this) - 1].x + gota.width)){
				this.x = Math.random() * (res-gota.height) + (c.width - res) / 2;
			}
		}
	}

	//Dibujar esta gota con el color que le corresponda (Azul / Random)
	this.irudikatu = function(){
		if(this.isGood)ctx.filter = "hue-rotate(" + this.hueAngle + "deg)"
		if(!this.collected) ctx.drawImage(imgGota, this.x, this.y);
		ctx.filter = "hue-rotate(0)"
	}
	
	this.genAngle = function(){
		do{
			this.hueAngle = Math.random()*360;
		}while(this.hueAngle < 60 || this.hueAngle > 300);	
	}
}

