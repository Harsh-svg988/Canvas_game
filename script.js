const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')
canvas.width = innerWidth;
canvas.height = innerHeight;
c.imageSmoothingEnabled = true;

const scoreEl = document.querySelector('#scoreElement');
const startGameBtn = document.querySelector('#start-Btn');
const modalEl = document.querySelector('#modalEl');
const SCORE = document.querySelector('.score');



class Player{
    constructor(x,y,radius,color){
        this.x = x;
        this.y = y
        this.radius = radius;
        this.color = color;
    }
    draw (){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0,2*Math.PI,false);
        c.fillStyle=this.color;
        c.fill();

    }
}
class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw (){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0,2*Math.PI,false);
        c.fillStyle=this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw (){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0,2*Math.PI,false);// 0 to 2PI  is angle of the circle. FALSE is for clockwise direction
        c.fillStyle=this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw (){
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0,2*Math.PI,false);
        c.fillStyle=this.color;
        c.fill();
        c.restore();

    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;

    }
}

const x = canvas.width/2;
const y = canvas.height/2;

let player = new Player(x,y,30,'white')
let projectiles = [];
let enemies = [];
let particles = [];


function initiate(){
 player = new Player(x,y,30,'white')
 projectiles = [];
 enemies = [];
 particles = [];
scoreEl.innerHTML = 0;
SCORE.innerHTML = 0;

}

function spwanEnemies(){
    setInterval(()=>{
        const radius = Math.random()*(30-8)+8;
        let x;
        let y;
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random () * canvas.height;
        }
        else{
            x = Math.random () * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random()*360},50%,50%)`
        const angle = Math.atan2(
            canvas.height/2 - y,
            canvas.width/2 - x
        )
        const velocity = {
            x : Math.cos(angle)*0.6,
            y : Math.sin(angle)*0.6
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
        console.log("eneimes")
    },1000)
}

let score = 0;
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);  // It call animate function again and again 
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0,0,canvas.width,canvas.height); //clear the canvas
    player.draw();

    particles.forEach((particle,index) =>{
        if(particle.alpha <= 0){
            particles.splice(index,1);
        }
        else{
            particle.update();
        }
    })

    //Updating the projectiles in every frame
    projectiles.forEach((projectile,index) => {
        projectile.update();
        
        // this condition helps in removing the projectiles from array if it goes out of the window without colliding
        if(projectile.x + projectile.radius < 0 ||
           projectile.x - projectile.radius > canvas.width ||
           projectile.y - projectile.radius > canvas.height || 
           projectile.y + projectile.radius < 0){

            setTimeout(() =>{
                projectiles.splice(index,1);
            },0)
           }

    });
    
    // updating the enemy in every frame
    enemies.forEach((enemy) => {
        enemy.update();
        //END GAME when enemy collides with the player
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distance - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            SCORE.innerHTML = score;

        }
    });
    // Removing the enemy and projectiles when they the collide with each other 
    projectiles.forEach((projectile, projectileIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (distance - enemy.radius - projectile.radius < 1) {
                
                // Explosion effect
                for(var i = -2; i < enemy.radius; i++){
                    particles.push(new Particle(projectile.x,
                        projectile.y,
                        Math.random()*3,
                        enemy.color,{
                            x:(Math.random() - 0.5)*(15*Math.random()),
                            y:(Math.random() - 0.5)*(9*Math.random())
                        }))
                }
               
                if(enemy.radius - 10 > 7 ){
                    score = score+10;
                    scoreEl.innerHTML = score;
                    gsap.to(enemy,{
                        radius:enemy.radius-10
                    })
                    setTimeout(() =>{
                        projectiles.splice(projectileIndex, 1);
                    },0)
                }
                else{
                    score = score+50;
                    scoreEl.innerHTML = score;
                    setTimeout(() =>{
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                    },0)
                }
            }
        });
    });
}

addEventListener('click',(e) => {
    console.log(e.clientY);
    const angle = Math.atan2(
        e.clientY - canvas.height/2,
        e.clientX - canvas.width/2
    )
    const velocity = {
        x : Math.cos(angle) * 7,
        y : Math.sin(angle) * 7
    }
    projectiles.push(new Projectile(canvas.width/2,canvas.height/2,5,'white',velocity))
})

startGameBtn.addEventListener('click',function(){
    initiate();
    animate();
    spwanEnemies();
    modalEl.style.display = 'none';
})
