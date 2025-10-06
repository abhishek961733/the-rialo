const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let player={x:150,y:canvas.height-120,radius:40,dx:0,dy:0,gravity:1.5,jumpForce:20,grounded:true,jumpCount:0,maxJumps:2};
let obstacles=[],obstacleInterval=100,obstacleTimer=0,gameSpeed=6,score=0,gameOver=false,keys={};
let particles=[];

let backgroundLayers=[];
for(let i=0;i<3;i++){
  let layer=[];
  for(let j=0;j<50;j++){
    layer.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,size:Math.random()*(20-i*5)+5,dy:0.2*(i+1),color:`rgba(0,200,255,${0.05+0.05*i})`});
  }
  backgroundLayers.push(layer);
}

let ghostImages=[];
for(let i=1;i<=3;i++){
  let img=new Image();
  img.src=`assets/ghost${i}.png`;
  ghostImages.push(img);
}

function drawPlayer(){
  ctx.save();
  ctx.beginPath();
  ctx.arc(player.x+player.radius,player.y+player.radius,player.radius,0,Math.PI*2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(document.querySelector('#logo img'),player.x,player.y,player.radius*2,player.radius*2);
  ctx.shadowColor='#00ffff';
  ctx.shadowBlur=20;
  ctx.strokeStyle='#00ffff';
  ctx.lineWidth=4;
  ctx.stroke();
  ctx.restore();

  particles.forEach((p,i)=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fillStyle=p.color;
    ctx.fill();
    p.x+=p.dx;p.y+=p.dy;p.size*=0.95;
    if(p.size<0.5) particles.splice(i,1);
  });
}

function drawObstacles(){
  obstacles.forEach(ob=>{
    ctx.save();
    ctx.globalAlpha=0.4+Math.random()*0.3;
    let img=ghostImages[Math.floor(Math.random()*ghostImages.length)];
    ctx.drawImage(img,ob.x,ob.y,ob.width,ob.height);
    ctx.restore();
  });
}

function drawBackground(){
  backgroundLayers.forEach(layer=>{
    layer.forEach(el=>{
      ctx.beginPath();
      ctx.arc(el.x,el.y,el.size,0,Math.PI*2);
      ctx.fillStyle=el.color;
      ctx.fill();
      el.y+=el.dy;
      if(el.y-el.size>canvas.height) el.y=-el.size;
    });
  });
}

function spawnObstacle(){
  const width=Math.random()*60+30;
  const height=Math.random()*60+30;
  obstacles.push({x:canvas.width,y:canvas.height-height-70,width:width,height:height});
}

function checkCollision(r){
  for(let ob of obstacles){
    if(r.x+r.radius*2>ob.x && r.x<ob.x+ob.width && r.y+r.radius*2>ob.y && r.y<ob.y+ob.height){
      document.getElementById('hitSound').play();
      return true;
    }
  }
  return false;
}

function update(){
  if(gameOver)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBackground();
  player.dy+=player.gravity;
  player.y+=player.dy;
  player.x+=player.dx;

  if(player.y+player.radius*2>=canvas.height-70){player.y=canvas.height-70-player.radius*2;player.dy=0;player.grounded=true;player.jumpCount=0;}
  else player.grounded=false;
  if(player.x<0)player.x=0;
  if(player.x+player.radius*2>canvas.width)player.x=canvas.width-player.radius*2;

  drawPlayer();

  obstacleTimer++;
  if(obstacleTimer>=obstacleInterval){spawnObstacle();obstacleTimer=0;}

  obstacles.forEach((ob,index)=>{
    ob.x-=gameSpeed;
    drawObstacles();
    if(checkCollision(player)){gameOver=true;document.getElementById('gameOver').style.display='block';}
    if(ob.x+ob.width<0){obstacles.splice(index,1);score++;document.getElementById('score').textContent='Score: '+score;}
  });

  if(score>0 && score%10===0)gameSpeed=6+score/10;
  requestAnimationFrame(update);
}

window.addEventListener('keydown',e=>{
  keys[e.code]=true;
  if((e.code==='Space'||e.code==='ArrowUp')&&(player.grounded||player.jumpCount<player.maxJumps)){
    player.dy=-player.jumpForce;player.jumpCount++;
    document.getElementById('jumpSound').play();
    for(let i=0;i<5;i++)particles.push({x:player.x+player.radius,y:player.y+player.radius,size:5,color:'#00ffff',dx:(Math.random()-0.5)*4,dy:-Math.random()*4});
  }
});
window.addEventListener('keyup',e=>{keys[e.code]=false;});

function handleMovement(){
  if(keys['ArrowLeft'])player.dx=-6;
  else if(keys['ArrowRight'])player.dx=6;
  else player.dx=0;
  requestAnimationFrame(handleMovement);
}
handleMovement();

function restartGame(){
  obstacles=[];player.y=canvas.height-120;player.dy=0;player.x=150;score=0;gameOver=false;player.jumpCount=0;
  document.getElementById('score').textContent='Score: 0';
  document.getElementById('gameOver').style.display='none';
  update();
}

document.getElementById('startBtn').addEventListener('click',()=>{
  document.getElementById('homeScreen').style.display='none';
  canvas.style.display='block';
  document.getElementById('score').style.display='block';
  document.getElementById('logo').style.display='block';
  update();
});

document.getElementById('leaderBtn').addEventListener('click',()=>{
  document.getElementById('homeScreen').style.display='none';
  document.getElementById('leaderboardScreen').style.display='flex';
  const list=document.getElementById('leaderList');
  list.innerHTML='<li>Player1 - 100</li><li>Player2 - 80</li><li>Player3 - 50</li>';
});

document.getElementById('scoreBtn').addEventListener('click',()=>{alert('Your Current Score: '+score);});
document.getElementById('backBtn').addEventListener('click',()=>{document.getElementById('leaderboardScreen').style.display='none';document.getElementById('homeScreen').style.display='flex';});
window.addEventListener('keydown',e=>{if(e.code==='KeyR'&&gameOver) restartGame();});
