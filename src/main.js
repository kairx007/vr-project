import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import './style.css';

const app = document.querySelector('#app');
const scene = new THREE.Scene();
const playerRig = new THREE.Group();
scene.add(playerRig);
scene.background = new THREE.Color(0x9aaca9);
scene.fog = new THREE.Fog(0x9aaca9, 25, 72);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, .1, 100);
camera.position.set(0, 1.65, 5.4);
camera.rotation.order='YXZ';
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
// Prioritize a crisp headset image over peripheral render savings.
renderer.xr.setFramebufferScaleFactor(1.2);
renderer.xr.setFoveation(0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe9f2ef, 0x554839, 1.65));
const sun = new THREE.DirectionalLight(0xffe4bd, 2.7);
sun.position.set(-8, 14, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun);
const fill = new THREE.DirectionalLight(0xc4d7dc, .8); fill.position.set(4, 5, -7); scene.add(fill);

const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const concrete = mat(0x74766f,.96), dark = mat(0x242a29,.72), sand = mat(0xb29f7c,.98), green = mat(0x33483c,.95), trim = mat(0xc4f36b,.45,.2);
function box(w,h,d,material,x,y,z,cast=true,receive=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=receive;scene.add(o);return o;}
function makeGroundTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#95836a';ctx.fillRect(0,0,512,512);
 for(let i=0;i<11000;i++){
  const shade=Math.floor(90+Math.random()*95),alpha=.07+Math.random()*.22,size=.5+Math.random()*2.4;
  ctx.fillStyle=`rgba(${shade},${Math.floor(shade*.91)},${Math.floor(shade*.75)},${alpha})`;
  ctx.fillRect(Math.random()*512,Math.random()*512,size,size);
 }
 for(let i=0;i<55;i++){
  ctx.fillStyle=`rgba(70,63,51,${.08+Math.random()*.16})`;
  ctx.beginPath();ctx.ellipse(Math.random()*512,Math.random()*512,2+Math.random()*8,1+Math.random()*3,Math.random()*Math.PI,0,Math.PI*2);ctx.fill();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(5,10);texture.anisotropy=1;return texture;
}
// Textured compacted dirt and gravel ground.
box(34,.24,62,mat(0x95836a,.98),0,-.14,-22,false,true);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(34,62),new THREE.MeshStandardMaterial({map:makeGroundTexture(),color:0xd0c0a4,roughness:.98}));
ground.rotation.x=-Math.PI/2;ground.position.set(0,-.018,-22);ground.receiveShadow=true;scene.add(ground);
box(34,.7,.5,dark,0,.25,-51,false,true);
// Side berms and simple industrial range bays
for(const x of [-15.8,15.8]){box(.65,3.2,59,green,x,1.5,-21,false,true);for(let z=5;z>-50;z-=10){box(.14,2.5,.2,sand,x>0?x-.3:x+.3,1.2,z,false,false)}}
for(let z=-6;z>-48;z-=10){for(const x of [-11,-5,5,11]){box(.24,3.2,.28,dark,x,1.6,z,false,true);box(4.6,.24,.34,concrete,x,3.1,z,false,true);box(.55,2.2,.32,sand,x>0?x-1.95:x+1.95,1.05,z,false,true)}box(34,.2,.5,dark,0,3.28,z,false,false)}
// Soft, broken berms at the range horizon instead of repeated pointed cones.
for(let i=0;i<9;i++){
 const geometry=new THREE.DodecahedronGeometry(1,1),position=geometry.attributes.position;
 for(let v=0;v<position.count;v++){const n=.88+Math.sin(position.getX(v)*4.7+i)*.1+Math.cos(position.getZ(v)*5.3-i)*.08;position.setXYZ(v,position.getX(v)*n,position.getY(v)*n,position.getZ(v)*n)}
 geometry.computeVertexNormals();
 const g=new THREE.Mesh(geometry,mat(i%3?0x788278:0x8b8975,.98));g.scale.set(5+Math.random()*6,2.2+Math.random()*2.6,3.5+Math.random()*3);g.position.set((i-4)*9,.15,-58-Math.random()*7);g.rotation.y=Math.random()*2;scene.add(g);
}
// Shooting station and luminous safety markers
box(2.2,.08,1.2,dark,0,.08,3.35);box(2.05,.025,1.06,trim,0,.13,3.35,false,false);
for(const x of [-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.025,12),trim);p.rotation.x=Math.PI/2;p.position.set(x*1.22,.04,3.2);scene.add(p)}

// Flat half-body silhouettes on resettable range popper hinges.
const targets=[];
const targetColors=[0xd64c37,0xd1d6c7,0xc4f36b,0xe0a843];
function makeTargetArt(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;
 const ctx=canvas.getContext('2d');ctx.strokeStyle='#e5e6e1';ctx.fillStyle='#f2f2ed';ctx.lineWidth=4;
 const px=x=>(x+.44)*canvas.width/.88,py=y=>(1.03-y)*canvas.height/1.08;
 for(const [rx,ry] of [[.245,.32],[.196,.255],[.147,.19],[.098,.125],[.049,.062]]){
  ctx.beginPath();ctx.ellipse(px(0),py(.43),rx*canvas.width/.88,ry*canvas.height/1.08,0,0,Math.PI*2);ctx.stroke();
 }
 ctx.beginPath();ctx.arc(px(0),py(.43),.032*canvas.width/.88,0,Math.PI*2);ctx.stroke();
 ctx.font='500 46px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
 for(const [text,x,y] of [['7',0,.78],['8',0,.64],['9',0,.52],['X',0,.43],['9',0,.34],['8',0,.2],['7',0,.08],['7',-.22,.43],['8',-.16,.43],['9',-.1,.43],['9',.1,.43],['8',.16,.43],['7',.22,.43]])ctx.fillText(text,px(x),py(y));
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=1;
 return new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
}
const targetArtMaterial=makeTargetArt();
function makeTarget(x,y,z,kind=0,moving=false){
 const group=new THREE.Group();group.position.set(x,Math.max(.05,y-1.5),z);scene.add(group);
 const stand=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,.94,8),dark);stand.position.set(0,.45,-.07);group.add(stand);
 const hinge=new THREE.Group();hinge.position.set(0,.9,0);group.add(hinge);
 const face=new THREE.Group();hinge.add(face);
 const bodyShape=new THREE.Shape();
 bodyShape.moveTo(-.29,.025);bodyShape.lineTo(.29,.025);bodyShape.lineTo(.265,.32);
 bodyShape.quadraticCurveTo(.27,.42,.34,.51);bodyShape.quadraticCurveTo(.42,.60,.36,.67);
 bodyShape.lineTo(.25,.62);bodyShape.lineTo(.17,.70);bodyShape.lineTo(.14,.76);
 bodyShape.quadraticCurveTo(0,.81,-.14,.76);bodyShape.lineTo(-.17,.70);bodyShape.lineTo(-.25,.62);
 bodyShape.lineTo(-.36,.67);bodyShape.quadraticCurveTo(-.42,.60,-.34,.51);
 bodyShape.quadraticCurveTo(-.27,.42,-.265,.32);bodyShape.closePath();
 const bodyMaterial=new THREE.MeshBasicMaterial({color:0x090a0b,side:THREE.DoubleSide});
 const paper=new THREE.Mesh(new THREE.PlaneGeometry(.88,1.08),new THREE.MeshBasicMaterial({color:0xe4e3db,side:THREE.DoubleSide}));paper.position.set(0,.49,.04);face.add(paper);
 const body=new THREE.Mesh(new THREE.ShapeGeometry(bodyShape,10),bodyMaterial);body.position.z=.055;face.add(body);
 const head=new THREE.Mesh(new THREE.CircleGeometry(.12,24),bodyMaterial);head.position.set(0,.86,.055);face.add(head);
 const polygon=bodyShape.extractPoints(10).shape;
 const outlineGeometry=new THREE.BufferGeometry().setFromPoints(polygon.map(point=>new THREE.Vector3(point.x,point.y,.064)));
 const outline=new THREE.LineLoop(outlineGeometry,new THREE.LineBasicMaterial({color:0xdee0dc,transparent:true,opacity:.9}));face.add(outline);
 const scoreArt=new THREE.Mesh(new THREE.PlaneGeometry(.88,1.08),targetArtMaterial);scoreArt.position.set(0,.49,.074);face.add(scoreArt);
 const target={group,face,hinge,hitMeshes:[body,head],homeX:x,homeZ:z,phase:Math.random()*6.28,speed:.55+Math.random()*.45,amplitude:moving?1.2:0,moving,alive:true,state:'up',fallAngle:0,downTime:0,kind};
 body.userData.target=head.userData.target=target;
 targets.push(target);
}
for(let i=0;i<4;i++)makeTarget(-7.4+i*4.9,1.5,-12,i,i===1||i===3);
makeTarget(0,1.55,-12,2,false); // Center plate gives the opening view a clear firing target.
for(let i=0;i<5;i++)makeTarget(-9+i*4.5,1.55,-23,i%4,i===0||i===2||i===4);
for(let i=0;i<4;i++)makeTarget(-7.5+i*5,1.65,-35,(i+1)%4,i===1||i===2);
for(let i=0;i<3;i++)makeTarget(-5+i*5,1.7,-45,i%4,i===1);

const raycaster=new THREE.Raycaster();
const clock=new THREE.Clock();
const activeEffects=[];
const tracerGeometry=new THREE.CapsuleGeometry(.018,.2,3,10);
const tracerMaterial=new THREE.MeshBasicMaterial({color:0xfff0bd,toneMapped:false,depthTest:false});
const trailGeometry=new THREE.CapsuleGeometry(.012,1.25,3,8);
const trailMaterial=new THREE.MeshBasicMaterial({color:0xff8a2b,transparent:true,opacity:.88,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,toneMapped:false});
const flashGeometry=new THREE.SphereGeometry(.04,8,6);
const flashMaterial=new THREE.MeshBasicMaterial({color:0xffbd4a,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
const sparkGeometry=new THREE.SphereGeometry(.026,8,6);
const sparkMaterial=new THREE.MeshBasicMaterial({color:0xffaa45,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
const effectUp=new THREE.Vector3(0,1,0);
let score=0,ammo=12,playing=false,reloadUntil=0,shotLock=false;
const scoreEl=document.querySelector('#score'),ammoEl=document.querySelector('#ammo'),overlay=document.querySelector('#overlay'),toast=document.querySelector('#toast'),hint=document.querySelector('#hint');
const latencyValueEl=document.querySelector('#latency-value'),latencyNoteEl=document.querySelector('#latency-note');
const latencyCanvas=document.createElement('canvas');latencyCanvas.width=512;latencyCanvas.height=128;
const latencyContext=latencyCanvas.getContext('2d');
const latencyTexture=new THREE.CanvasTexture(latencyCanvas);latencyTexture.colorSpace=THREE.SRGBColorSpace;
const latencyMesh=new THREE.Mesh(new THREE.PlaneGeometry(.5,.125),new THREE.MeshBasicMaterial({map:latencyTexture,transparent:true,depthTest:false,toneMapped:false}));
latencyMesh.position.set(-.27,.29,-.8);latencyMesh.renderOrder=1000;latencyMesh.visible=false;camera.add(latencyMesh);
let latestShotPing=0;
const moveKeys=new Set();
const moveSpeed=4.2;
const moveBounds={minX:-14,maxX:14,minZ:-47,maxZ:7};
const moveForward=new THREE.Vector3(),moveRight=new THREE.Vector3(),moveDelta=new THREE.Vector3(),moveUp=new THREE.Vector3(0,1,0),bodyQuaternion=new THREE.Quaternion();
let mouseLooking=false,lastPointerX=0,lastPointerY=0;
function updateHUD(){scoreEl.textContent=String(score).padStart(4,'0');ammoEl.textContent=String(ammo).padStart(2,'0')}
let toastTimer;function flash(text){toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),500)}
function spawnShotEffects(muzzle,direction,travelDistance,impactPoint){
 const flashMesh=new THREE.Mesh(flashGeometry,flashMaterial);
 flashMesh.position.copy(muzzle).addScaledVector(direction,.035);
 flashMesh.quaternion.setFromUnitVectors(effectUp,direction);
 flashMesh.scale.set(.85,.85,2.2);scene.add(flashMesh);
 activeEffects.push({kind:'flash',mesh:flashMesh,life:.11,maxLife:.11});
 const tracer=new THREE.Mesh(tracerGeometry,tracerMaterial);
 tracer.quaternion.setFromUnitVectors(effectUp,direction);
 tracer.position.copy(muzzle).addScaledVector(direction,.09);scene.add(tracer);
 const trail=new THREE.Mesh(trailGeometry,trailMaterial);
 trail.quaternion.copy(tracer.quaternion);trail.position.copy(muzzle).addScaledVector(direction,.29);scene.add(trail);
 activeEffects.push({kind:'tracer',mesh:tracer,trail,origin:muzzle.clone(),direction:direction.clone(),distance:travelDistance,progress:0,speed:18,impactPoint:impactPoint?.clone()??null});
}
function spawnImpactSparks(point,direction){
 for(let i=0;i<18;i++){
  const mesh=new THREE.Mesh(sparkGeometry,sparkMaterial);
  mesh.position.copy(point);scene.add(mesh);
  const velocity=new THREE.Vector3((Math.random()-.5)*3.8,(Math.random()-.5)*3.2,(Math.random()-.5)*3.8).addScaledVector(direction,-1.2);
  const life=.34+Math.random()*.18;activeEffects.push({kind:'spark',mesh,velocity,life,maxLife:life});
 }
}
function updateEffects(dt){
 for(let i=activeEffects.length-1;i>=0;i--){
  const effect=activeEffects[i];
  if(effect.kind==='tracer'){
   effect.progress+=effect.speed*dt;
   const progress=Math.min(effect.progress,effect.distance);
   effect.mesh.position.copy(effect.origin).addScaledVector(effect.direction,progress+.06);
   effect.trail.position.copy(effect.origin).addScaledVector(effect.direction,progress-.62);
   const remaining=Math.max(0,(effect.distance-effect.progress)/Math.max(effect.distance,.01));
   effect.trail.scale.z=Math.max(.03,Math.min(1,remaining));
   if(effect.progress>=effect.distance){
    if(effect.impactPoint)spawnImpactSparks(effect.impactPoint,effect.direction);
    scene.remove(effect.mesh,effect.trail);activeEffects.splice(i,1);
   }
  }else if(effect.kind==='spark'){
   effect.life-=dt;effect.velocity.y-=2.2*dt;effect.mesh.position.addScaledVector(effect.velocity,dt);
   effect.mesh.scale.setScalar(Math.max(.01,effect.life/effect.maxLife));
   if(effect.life<=0){scene.remove(effect.mesh);activeEffects.splice(i,1)}
  }else{
   effect.life-=dt;effect.mesh.scale.multiplyScalar(.84);
   if(effect.life<=0){scene.remove(effect.mesh);activeEffects.splice(i,1)}
  }
 }
}
function drawLatencyPanel(value,note){
 latencyContext.clearRect(0,0,512,128);
 latencyContext.fillStyle='rgba(9,16,19,.92)';latencyContext.fillRect(0,0,512,128);
 latencyContext.strokeStyle='#c4f36b';latencyContext.lineWidth=3;latencyContext.strokeRect(2,2,508,124);
 latencyContext.fillStyle='#a5b0ad';latencyContext.font='500 19px monospace';latencyContext.fillText('SHOT ROUND TRIP',18,31);
 latencyContext.fillStyle='#c4f36b';latencyContext.font='bold 48px monospace';latencyContext.fillText(`${value} ms`,18,91);
 latencyContext.fillStyle='#a5b0ad';latencyContext.font='16px monospace';latencyContext.fillText(note,270,91);
 latencyTexture.needsUpdate=true;
}
function setLatencyDisplay(value,note){latencyValueEl.textContent=value;latencyNoteEl.textContent=note;drawLatencyPanel(value,note)}
async function measureShotRtt(shotId,hit){
 const startedAt=performance.now();
 setLatencyDisplay('SHOT',hit?'HIT · WAITING FOR ACK':'MISS · WAITING FOR ACK');
 try{
  const response=await fetch('/api/shot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({shotId,hit}),cache:'no-store'});
  if(!response.ok)throw new Error(`Shot latency endpoint returned ${response.status}`);
  await response.json();
  const roundTrip=Math.max(1,Math.round(performance.now()-startedAt));
  if(shotId===latestShotPing)setLatencyDisplay(String(roundTrip),hit?'HIT · APP RTT ACK':'MISS · APP RTT ACK');
 }catch{
  if(shotId===latestShotPing)setLatencyDisplay('SHOT',hit?'HIT · SERVER UNAVAILABLE':'MISS · SERVER UNAVAILABLE');
 }
}
function resetTargets(){
 for(const target of targets){target.alive=true;target.state='up';target.fallAngle=0;target.downTime=0;target.group.visible=true;target.group.position.x=target.homeX;target.group.rotation.set(0,0,0);target.hinge.rotation.set(0,0,0);target.group.scale.setScalar(1)}
}
function newRound(){score=0;ammo=12;playing=true;reloadUntil=0;shotLock=false;resetTargets();updateHUD()}
function fire(origin,direction,muzzleOrigin=origin){
 if(!playing||performance.now()<reloadUntil||shotLock)return;
 shotLock=true;setTimeout(()=>shotLock=false,180);
 ammo--;updateHUD();
 const shotId=++latestShotPing;
 const shotDirection=direction.clone().normalize();
 scene.updateMatrixWorld(true);
 raycaster.set(origin,shotDirection);raycaster.near=0;raycaster.far=55;
 const hitMeshes=targets.filter(candidate=>candidate.alive).flatMap(candidate=>candidate.hitMeshes);
 const firstHit=raycaster.intersectObjects(hitMeshes,false)[0];
 const target=firstHit?.object.userData.target??null;
 const nearest=firstHit?.distance??55;
 const hitPoint=firstHit?.point??null;
 if(target?.alive){
  target.alive=false;target.state='falling';target.fallAngle=0;target.downTime=0;
  const points=target.moving?150:100;score+=points;updateHUD();flash(`+${points}  //  CLEAN HIT`);
 }else flash('MISS');
 const tracerDistance=target?Math.max(.2,nearest-muzzleOrigin.distanceTo(origin)):18;
 spawnShotEffects(muzzleOrigin,shotDirection,tracerDistance,target?hitPoint:null);
 void measureShotRtt(shotId,Boolean(target));
 if(ammo===0){reloadUntil=performance.now()+1200;setTimeout(()=>{if(playing&&ammo===0){ammo=12;updateHUD();flash('MAGAZINE READY')}},1200)}
}
function getAim(controller){const p=new THREE.Vector3(),q=new THREE.Quaternion();controller.getWorldPosition(p);controller.getWorldQuaternion(q);const dir=new THREE.Vector3(0,0,-1).applyQuaternion(q).normalize();return {p,dir}}
function getGunMuzzle(gun,origin,direction){if(!gun)return origin.clone().addScaledVector(direction,.35);gun.updateWorldMatrix(true,false);return gun.localToWorld(new THREE.Vector3(0,.044,-.45))}
function fireFromController(controller){
 const {p,dir}=getAim(controller),gun=controllerGuns[controllers.indexOf(controller)];
 fire(p,dir,getGunMuzzle(gun,p,dir));
}
const triggerWasDown=new WeakMap();
const controllers=[renderer.xr.getController(0),renderer.xr.getController(1)];controllers.forEach(c=>{
 playerRig.add(c);
 c.addEventListener('connected',event=>{c.userData.xrInputSource=event.data});
 c.addEventListener('disconnected',()=>{delete c.userData.xrInputSource});
 c.addEventListener('selectstart',()=>fireFromController(c));
});
// Detailed original sidearm, kept low-poly for smooth standalone Quest rendering.
function createHandgun(handedness=1){
 const gun=new THREE.Group();
 const bodyMat=new THREE.MeshStandardMaterial({color:0x262a29,metalness:.62,roughness:.34});
 const slideMat=new THREE.MeshStandardMaterial({color:0x111414,metalness:.74,roughness:.3});
 const blackMat=new THREE.MeshStandardMaterial({color:0x090b0b,metalness:.38,roughness:.46});
 const gripMat=new THREE.MeshStandardMaterial({color:0x171918,metalness:.08,roughness:.94});
 const edgeMat=new THREE.MeshStandardMaterial({color:0x454b49,metalness:.68,roughness:.38});
 const accentMat=new THREE.MeshStandardMaterial({color:0x89918d,metalness:.42,roughness:.42});
 const gloveMat=new THREE.MeshStandardMaterial({color:0x111313,roughness:.57,metalness:.04});
 const gloveLight=new THREE.MeshStandardMaterial({color:0x242726,roughness:.5,metalness:.06});
 const seamMat=new THREE.MeshStandardMaterial({color:0x353a38,roughness:.8,metalness:0});
 const skinMat=new THREE.MeshStandardMaterial({color:0xb77a58,roughness:.78,metalness:0});
 const skinLight=new THREE.MeshStandardMaterial({color:0xc58a67,roughness:.73,metalness:0});
 const addBox=(size,pos,material,rot)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);if(rot)m.rotation.set(...rot);gun.add(m);return m};
 const profile=(points,depth,material,offsetX=0,bevel=.003)=>{
  const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelSegments:2,bevelThickness:bevel,bevelSize:bevel,curveSegments:5});
  geo.rotateY(Math.PI/2);geo.translate(-depth/2,0,0);
  const mesh=new THREE.Mesh(geo,material);mesh.position.x=offsetX;gun.add(mesh);return mesh;
 };
 // Slim steel slide with a softened, tapered muzzle and rear tang.
 profile([[.018,.028],[.035,.075],[.285,.075],[.312,.052],[.304,.012],[.045,.006],[.018,.018]],.086,slideMat,0,.004);
 // Lower frame and forward dust cover.
 profile([[.018,.022],[.055,.02],[.09,-.012],[.21,-.018],[.265,-.003],[.29,.008],[.282,-.042],[.214,-.055],[.174,-.074],[.155,-.12],[.115,-.125],[.092,-.073],[.055,-.043],[.018,-.035]],.078,bodyMat,0,.003);
 // Angled, full-length grip and textured side panels.
 profile([[.025,-.035],[.104,-.046],[.155,-.245],[.137,-.278],[.063,-.255],[.012,-.095]],.09,blackMat,0,.004);
 profile([[.032,-.055],[.092,-.061],[.132,-.229],[.119,-.25],[.07,-.234],[.026,-.094]],.008,gripMat,.049,.001);
 profile([[.032,-.055],[.092,-.061],[.132,-.229],[.119,-.25],[.07,-.234],[.026,-.094]],.008,gripMat,-.049,.001);
 // Sculpted trigger guard with an open center and a visible curved trigger.
 const guardShape=new THREE.Shape();guardShape.moveTo(.083,-.044);guardShape.lineTo(.185,-.046);guardShape.lineTo(.183,-.112);guardShape.quadraticCurveTo(.178,-.147,.146,-.148);guardShape.lineTo(.105,-.143);guardShape.quadraticCurveTo(.08,-.136,.078,-.109);guardShape.closePath();
 const guardHole=new THREE.Path();guardHole.moveTo(.105,-.07);guardHole.lineTo(.16,-.07);guardHole.lineTo(.158,-.108);guardHole.quadraticCurveTo(.155,-.123,.14,-.124);guardHole.lineTo(.116,-.121);guardHole.quadraticCurveTo(.105,-.119,.105,-.104);guardHole.closePath();guardShape.holes.push(guardHole);
 const guardGeo=new THREE.ExtrudeGeometry(guardShape,{depth:.065,steps:1,bevelEnabled:true,bevelSegments:2,bevelThickness:.003,bevelSize:.002});guardGeo.rotateY(Math.PI/2);guardGeo.translate(-.0325,0,0);
 const guard=new THREE.Mesh(guardGeo,edgeMat);guard.position.x=.008;gun.add(guard);
 const trigger=new THREE.Mesh(new THREE.TorusGeometry(.027,.0045,6,16,Math.PI*1.25),edgeMat);trigger.position.set(.012,-.075,-.126);trigger.rotation.set(0,Math.PI/2,0);gun.add(trigger);
 // Barrel, recessed crown and under-barrel accessory rail.
 const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.018,.02,.17,12),edgeMat);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.044,-.215);gun.add(barrel);
 const suppressor=new THREE.Mesh(new THREE.CylinderGeometry(.023,.025,.145,16),blackMat);suppressor.rotation.x=Math.PI/2;suppressor.position.set(0,.044,-.37);gun.add(suppressor);
 const crown=new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,.008,16),edgeMat);crown.rotation.x=Math.PI/2;crown.position.set(0,.044,-.444);gun.add(crown);
 const bore=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.009,12),blackMat);bore.rotation.x=Math.PI/2;bore.position.set(0,.044,-.45);gun.add(bore);
 addBox([.055,.018,.13],[0,-.061,-.202],blackMat);
 for(let i=0;i<4;i++)addBox([.062,.008,.012],[0,-.073,-.16-i*.025],edgeMat);
 // Ejection port, slide serrations, sight dots and small controls on both sides.
 profile([[.115,.049],[.203,.049],[.196,.022],[.12,.022]],.004,blackMat,.046,.001);
 profile([[.115,.049],[.203,.049],[.196,.022],[.12,.022]],.004,blackMat,-.046,.001);
 // Slide serrations, sights and fasteners on both sides.
 for(let side of [-1,1]){
  for(let i=0;i<5;i++)addBox([.003,.052,.006],[side*.047,.045,-.052-i*.011],edgeMat);
  addBox([.012,.021,.022],[side*.047,.082,-.026],blackMat);
  addBox([.012,.021,.022],[side*.047,.082,-.279],blackMat);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.004,8,6),accentMat);dot.position.set(side*.054,.083,-.279);gun.add(dot);
  for(const z of [-.055,-.12]){const screw=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.005,12),edgeMat);screw.rotation.z=Math.PI/2;screw.position.set(side*.054,-.12,z);gun.add(screw)}
 }
 // Low iron sights and a plain rear notch, matching a service-pistol profile.
 addBox([.022,.014,.026],[0,.09,-.277],edgeMat);
 addBox([.043,.018,.036],[0,.09,-.045],blackMat);
 addBox([.018,.003,.012],[0,.101,-.046],accentMat);
 // Subtle grip grooves add texture without costly image maps.
 for(let i=0;i<5;i++){
  const z=-.078-i*.025;
  for(const side of [-1,1])addBox([.003,.004,.052],[side*.054,-.118,z],edgeMat,[0,0,-.2]);
 }
 // Human-shaped hand wrapped around the grip. The thumb mirrors for left/right hands.
 const hand=new THREE.Group();gun.add(hand);
 const capsule=(radius,length,material)=>new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,4,8),material);
 const sphere=(scale,pos,material)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),material);m.scale.set(...scale);m.position.set(...pos);hand.add(m);return m};
 const palm=sphere([.047,.082,.031],[0,-.157,.024],gloveMat);palm.rotation.z=-.12;
 const palmBack=sphere([.041,.069,.012],[0,-.151,.048],gloveLight);palmBack.rotation.z=-.12;
 const wrist=capsule(.027,.07,gloveMat);wrist.scale.set(.82,1,.7);wrist.position.set(0,-.071,.084);hand.add(wrist);
 const thumbSide=handedness<0?-1:1;
 sphere([.024,.043,.022],[thumbSide*.027,-.121,-.001],gloveLight).rotation.z=-thumbSide*.28;
 sphere([.017,.039,.018],[-thumbSide*.029,-.16,.015],gloveMat);
 for(const x of [-.012,.012]){const tendon=capsule(.0024,.058,gloveLight);tendon.scale.z=.58;tendon.position.set(x,-.061,.057);tendon.rotation.z=x<0?-.08:.08;hand.add(tendon)}
 const up=new THREE.Vector3(0,1,0);
 function fingerBone(start,end,radius,material){
  const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),delta=b.clone().sub(a);
  const bone=capsule(radius,Math.max(.012,delta.length()-radius*1.4),material);
  bone.position.copy(a).add(b).multiplyScalar(.5);bone.quaternion.setFromUnitVectors(up,delta.normalize());hand.add(bone);
 }
 const fingerXs=[-.027,-.009,.009,.027],fingerYs=[-.112,-.145,-.178,-.211];
 for(let i=0;i<4;i++){
  const x=fingerXs[i],y=fingerYs[i];
  sphere([.011,.012,.009],[x,y,.032],gloveLight);
  fingerBone([x,y,.044],[x*1.08,y-.004,-.025],.009,gloveMat);
  fingerBone([x*1.08,y-.004,-.025],[x*.94,y-.009,-.093],.0085,gloveMat);
  sphere([.0085,.009,.007],[x*1.08,y-.004,-.025],gloveLight);
  sphere([.008,.008,.007],[x*.94,y-.009,-.088],gloveLight);
 }
 // Gloved palm stitching and padded knuckle seams.
 for(const x of [-.025,-.008,.009,.026]){const seam=capsule(.0015,.027,seamMat);seam.position.set(x,-.102,.054);seam.rotation.z=-.12;hand.add(seam)}
 fingerBone([thumbSide*.037,-.093,.035],[thumbSide*.052,-.105,-.025],.012,gloveLight);
 fingerBone([thumbSide*.052,-.105,-.025],[thumbSide*.052,-.09,-.104],.011,skinMat);
 sphere([.012,.012,.011],[thumbSide*.052,-.105,-.025],gloveLight);
 sphere([.011,.011,.01],[thumbSide*.052,-.09,-.09],skinLight);
 const thumbTip=capsule(.011,.024,skinMat);thumbTip.position.set(thumbSide*.05,-.086,-.119);thumbTip.rotation.x=Math.PI/2;hand.add(thumbTip);
 sphere([.006,.002,.009],[thumbSide*.05,-.083,-.132],skinLight);
 gun.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 return gun;
}
const controllerGuns=[];
controllers.forEach(controller=>{
 const handGun=createHandgun(controller===controllers[0]?-1:1);
 // Controller local -Z is the pointing direction; the model's barrel follows it.
 handGun.position.set(0,-.045,-.12);
 handGun.visible=false;
 controller.add(handGun);
 controllerGuns.push(handGun);
});
const desktopGun=createHandgun(1);
desktopGun.position.set(.27,-.25,-.62);
desktopGun.rotation.set(-.04,-.07,0);
desktopGun.scale.setScalar(1.15);
camera.add(desktopGun);
// Move the player rig (the XR camera parent), keeping headset height and view intact.
playerRig.add(camera);
const xrCamera=renderer.xr.getCamera(camera);
const moveAxes=new THREE.Vector2();
function applyMovement(dt){
 moveAxes.set(0,0);
 let turnAxis=0,crouching=false;
 if(moveKeys.has('KeyA')||moveKeys.has('ArrowLeft'))moveAxes.x-=1;
 if(moveKeys.has('KeyD')||moveKeys.has('ArrowRight'))moveAxes.x+=1;
 if(moveKeys.has('KeyW')||moveKeys.has('ArrowUp'))moveAxes.y+=1;
 if(moveKeys.has('KeyS')||moveKeys.has('ArrowDown'))moveAxes.y-=1;
 if(renderer.xr.isPresenting){
  const session=renderer.xr.getSession();
  for(const source of session?.inputSources??[]){
   const pad=source.gamepad;if(!pad)continue;
   const triggerDown=Boolean(pad.buttons[0]?.pressed);
   const triggerWasPressed=triggerWasDown.get(source)??false;
   if(triggerDown&&!triggerWasPressed){const controller=controllers.find(c=>c.userData.xrInputSource===source);if(controller)fireFromController(controller)}
   triggerWasDown.set(source,triggerDown);
   const x=pad.axes.length>=4?pad.axes[2]:pad.axes[0];
   const y=pad.axes.length>=4?pad.axes[3]:pad.axes[1];
   if(source.handedness==='left'){
    if(Math.abs(x)>.14)moveAxes.x+=x;
    if(Math.abs(y)>.14)moveAxes.y-=y;
   }else if(source.handedness==='right'){
    if(Math.abs(x)>.2)turnAxis=x;
    crouching=Boolean(pad.buttons[3]?.pressed)||y>.72;
   }
  }
 }
 if(renderer.xr.isPresenting){
  playerRig.rotation.y-=turnAxis*2.2*dt;
  playerRig.position.y=crouching?-.48:0;
 }
 if(moveAxes.lengthSq()===0)return;
 moveAxes.clampLength(0,1);
 // Translate along the rotated player body, keeping locomotion aligned with snap/smooth turning.
 playerRig.updateMatrixWorld(true);
 if(renderer.xr.isPresenting)playerRig.getWorldQuaternion(bodyQuaternion);
 else camera.getWorldQuaternion(bodyQuaternion);
 moveForward.set(0,0,-1).applyQuaternion(bodyQuaternion);moveForward.y=0;
 moveForward.normalize();
 moveRight.crossVectors(moveForward,moveUp).normalize();
 moveDelta.copy(moveForward).multiplyScalar(moveAxes.y).addScaledVector(moveRight,moveAxes.x).multiplyScalar(moveSpeed*dt);
 playerRig.position.add(moveDelta);
 playerRig.position.x=THREE.MathUtils.clamp(playerRig.position.x,moveBounds.minX,moveBounds.maxX);
 playerRig.position.z=THREE.MathUtils.clamp(playerRig.position.z,moveBounds.minZ,moveBounds.maxZ);
}
addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){moveKeys.add(e.code);if(playing)e.preventDefault()}});
addEventListener('keyup',e=>moveKeys.delete(e.code));
addEventListener('blur',()=>moveKeys.clear());
// Desktop: click-drag to look; a click without dragging fires through the center reticle.
let pointerDown=null;
renderer.domElement.addEventListener('pointerdown',e=>{if(!playing||renderer.xr.isPresenting)return;pointerDown={x:e.clientX,y:e.clientY,moved:false};lastPointerX=e.clientX;lastPointerY=e.clientY;mouseLooking=true;renderer.domElement.setPointerCapture?.(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!mouseLooking||!pointerDown)return;const dx=e.clientX-lastPointerX,dy=e.clientY-lastPointerY;lastPointerX=e.clientX;lastPointerY=e.clientY;if(Math.abs(e.clientX-pointerDown.x)+Math.abs(e.clientY-pointerDown.y)>4)pointerDown.moved=true;if(!pointerDown.moved)return;camera.rotation.y-=dx*.003;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x-dy*.003,-Math.PI*.46,Math.PI*.46)});
function releasePointer(){if(!pointerDown)return;const wasClick=!pointerDown.moved;pointerDown=null;mouseLooking=false;if(wasClick&&playing&&!renderer.xr.isPresenting){camera.updateWorldMatrix(true,false);raycaster.setFromCamera(new THREE.Vector2(0,0),camera);fire(raycaster.ray.origin.clone(),raycaster.ray.direction.clone(),getGunMuzzle(desktopGun,raycaster.ray.origin,raycaster.ray.direction))}}
addEventListener('pointerup',releasePointer);
renderer.domElement.addEventListener('pointercancel',()=>{pointerDown=null;mouseLooking=false});
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{if(e.code==='Space'&&playing){e.preventDefault();camera.updateWorldMatrix(true,false);const origin=camera.getWorldPosition(new THREE.Vector3()),direction=camera.getWorldDirection(new THREE.Vector3());fire(origin,direction,getGunMuzzle(desktopGun,origin,direction))}});
const vrButton=VRButton.createButton(renderer);vrButton.id='vr-button';vrButton.textContent='ENTER VR';document.body.appendChild(vrButton);
document.querySelector('#start-button').addEventListener('click',async()=>{
 newRound();overlay.classList.add('hidden');
 if(navigator.xr){
  try{
   // Request immersive VR directly in the click handler to preserve headset user activation.
   const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});
   await renderer.xr.setSession(session);
  }catch{hint.textContent='Desktop · drag to look · reticle + click to fire'}
 }else hint.textContent='Desktop · drag to look · reticle + click to fire';
});
renderer.xr.addEventListener('sessionstart',()=>{
 // The separate VRButton can enter XR without pressing the range start card first.
 if(!playing){newRound();overlay.classList.add('hidden')}
 desktopGun.visible=false;controllerGuns.forEach(g=>g.visible=true);latencyMesh.visible=true;renderer.shadowMap.enabled=false;
 hint.textContent='Left stick: move · right stick: turn · trigger: fire';
});
renderer.xr.addEventListener('sessionend',()=>{controllerGuns.forEach(g=>g.visible=false);desktopGun.visible=true;latencyMesh.visible=false;renderer.shadowMap.enabled=true;playerRig.position.y=0;hint.textContent='WASD / arrows: move · drag: look · click: fire'});
function animate(){
 const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 applyMovement(dt);updateEffects(dt);
 for(const target of targets){
  if(target.state==='up'){
   if(target.moving)target.group.position.x=target.homeX+Math.sin(t*target.speed+target.phase)*target.amplitude;
   target.group.rotation.y=Math.sin(t*.8+target.phase)*.06;
  }else if(target.state==='falling'){
   target.fallAngle=Math.min(Math.PI*.48,target.fallAngle+dt*5.5);
   target.hinge.rotation.x=-target.fallAngle;
   if(target.fallAngle>=Math.PI*.48){target.state='down';target.downTime=.85}
  }else if(target.state==='down'){
   target.downTime-=dt;if(target.downTime<=0)target.state='rising';
  }else if(target.state==='rising'){
   target.fallAngle=Math.max(0,target.fallAngle-dt*2.8);
   target.hinge.rotation.x=-target.fallAngle;
   if(target.fallAngle===0){target.hinge.rotation.set(0,0,0);target.state='up';target.alive=true}
  }
 }
 renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight)});
