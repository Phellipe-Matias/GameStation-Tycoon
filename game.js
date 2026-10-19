const $=id=>document.getElementById(id), V=THREE.Vector3;
const S={open:false,money:1500,trash:8,setups:[],started:false,ui:null,locked:false};
const SLOTS=[-3.4,-1.4,.6,2.6];
const G={h:8,day:1,rev:0,spent:0,over:false,n:0};const lampLights=[];
const skyU={top:{value:new THREE.Color()},hor:{value:new THREE.Color()}};const _c=new THREE.Color(),_c2=new THREE.Color(),_c3=new THREE.Color();

/* ---------- renderer / scene ---------- */
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xe8c9a6,30,150);
const cam=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,500);
const R=new THREE.WebGLRenderer({antialias:true});
R.setSize(innerWidth,innerHeight);R.setPixelRatio(Math.min(devicePixelRatio,2));
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
document.body.appendChild(R.domElement);

scene.add(new THREE.Mesh(new THREE.SphereGeometry(300,24,12),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,fog:false,
 vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top,hor;varying vec3 p;void main(){float h=clamp(normalize(p).y,0.,1.);gl_FragColor=vec4(pow(mix(hor,top,pow(h,.5)),vec3(.4545)),1.);}'})));
const hemi=new THREE.HemisphereLight(0xbfd4ff,0x6a5a48,.7);scene.add(hemi);
const moon=new THREE.DirectionalLight(0x6f86ff,0);moon.position.set(-30,40,-20);scene.add(moon);
function setSky(h){const a=Math.max(0,Math.min(1,(h-6)/14)),el=Math.sin(a*Math.PI),d=Math.min(1,Math.max(0,el*3)),w=1-Math.min(1,el/.7);
 sun.position.set(Math.cos(a*Math.PI)*55,Math.max(el,.02)*45,25);sun.intensity=1.6*d;sun.color.setRGB(1,.82+.14*(1-w),.6+.35*(1-w));
 hemi.intensity=.14+.6*d;moon.intensity=.4*(1-d);
 skyU.top.value.setRGB(.02,.03,.1).lerp(_c.setRGB(.3,.52,.88),d);
 skyU.hor.value.setRGB(.08,.1,.22).lerp(_c2.setRGB(.85,.88,1).lerp(_c3.setRGB(1,.62,.38),w),d);
 scene.fog.color.copy(skyU.hor.value);lampLights.forEach(l=>l.intensity=(1-d)*1.3)}
const sun=new THREE.DirectionalLight(0xffd9a8,1.5);sun.position.set(45,38,28);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,far:160});sun.shadow.bias=-.0004;scene.add(sun);

/* ---------- helpers ---------- */
const solids=[];
function tex(w,h,f,rep){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep)}return t}
function box(w,h,d,c,x,y,z,solid,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||new THREE.MeshStandardMaterial({color:c,roughness:.75}));
 m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);if(solid)solids.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});return m}
function plane(w,h,mat,x,y,z,rx,ry){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);m.receiveShadow=true;scene.add(m);return m}
function sign(txt,col,w,h){const t=tex(512,Math.round(512*h/w),(g,W,H)=>{g.fillStyle='#07080d';g.fillRect(0,0,W,H);g.font='900 '+H*.5+'px Arial';g.textAlign='center';g.textBaseline='middle';
 g.shadowColor=col;g.shadowBlur=24;g.fillStyle=col;g.fillText(txt,W/2,H/2+4);g.fillText(txt,W/2,H/2+4)});
 return new THREE.MeshBasicMaterial({map:t,toneMapped:false})}

/* ---------- ground / street / court ---------- */
const grass=tex(128,128,(g,w,h)=>{g.fillStyle='#5d6b4a';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle=`rgba(${60+Math.random()*40|0},${90+Math.random()*40|0},60,.5)`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}},[60,60]);
plane(400,400,new THREE.MeshStandardMaterial({map:grass,roughness:1}),0,-.02,10,-Math.PI/2);
const asph=tex(256,256,(g,w,h)=>{g.fillStyle='#3a3b41';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle=`rgba(${Math.random()*255|0},${Math.random()*255|0},${Math.random()*255|0},.07)`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}
 g.fillStyle='#e8d36b';g.fillRect(0,h/2-3,128,6)},[64,1]);
plane(320,14,new THREE.MeshStandardMaterial({map:asph,roughness:.9}),0,.01,16.2,-Math.PI/2);
const pave=tex(128,128,(g,w,h)=>{g.fillStyle='#b9b6ae';g.fillRect(0,0,w,h);g.strokeStyle='#8d8a82';g.lineWidth=2;g.strokeRect(0,0,w,h)},[160,2]);
box(320,.16,4,0,0,.08,7.2,0,new THREE.MeshStandardMaterial({map:pave}));
box(320,.16,4,0,0,.08,25.2,0,new THREE.MeshStandardMaterial({map:pave}));
box(320,.2,.25,0xa09d95,0,.1,9.3);box(320,.2,.25,0xa09d95,0,.1,23.1);

const courtT=tex(1024,600,(g,w,h)=>{g.fillStyle='#c0612b';g.fillRect(0,0,w,h);g.fillStyle='#2f5fa8';g.fillRect(40,40,w-80,h-80);
 g.strokeStyle='#fff';g.lineWidth=6;g.strokeRect(40,40,w-80,h-80);g.beginPath();g.moveTo(w/2,40);g.lineTo(w/2,h-40);g.stroke();
 g.beginPath();g.arc(w/2,h/2,70,0,7);g.stroke();for(const s of[0,1]){const x=s?w-40:40,d=s?-1:1;g.fillStyle='#c0612b';g.fillRect(s?x-190:x,h/2-90,190,180);g.strokeRect(s?x-190:x,h/2-90,190,180);g.beginPath();g.arc(x+d*190,h/2,70,0,7);g.stroke()}});
plane(30,18,new THREE.MeshStandardMaterial({map:courtT,roughness:.6}),0,.03,36,-Math.PI/2);
for(const s of[-1,1]){box(.2,3.4,.2,0x444a55,s*14.2,1.7,36);box(.1,1.1,1.8,0xf4f4f4,s*13.9,3.4,36);
 const r=new THREE.Mesh(new THREE.TorusGeometry(.4,.04,8,20),new THREE.MeshStandardMaterial({color:0xff5a1f}));r.rotation.x=Math.PI/2;r.position.set(s*13.3,3.05,36);scene.add(r);
 const n=new THREE.Mesh(new THREE.CylinderGeometry(.4,.22,.5,10,1,true),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true}));n.position.set(s*13.3,2.8,36);scene.add(n)}
// alambrado da quadra (com entrada de 6m no meio da frente)
box(30,2.4,.08,0x20242e,0,1.2,45,1);box(12,2.4,.08,0x20242e,-9,1.2,27,1);box(12,2.4,.08,0x20242e,9,1.2,27,1);
box(.08,2.4,18,0x20242e,-15,1.2,36,1);box(.08,2.4,18,0x20242e,15,1.2,36,1);

/* ---------- buildings ---------- */
const awn=new THREE.MeshStandardMaterial({map:tex(64,16,g=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#ffffff':'#e63946';g.fillRect(i*8,0,8,16)}},[3,1])});
function facade(base,cols,rows){return tex(256,256,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){g.fillStyle=Math.random()<.4?'#ffd98a':'#27384f';g.fillRect(14+c*(228/cols),16+r*(224/rows),228/cols-14,224/rows-16)}})}
[[-12,'MERCADO','#ffd166','#8f4a3a',9],[-22.5,'FARMÁCIA','#57f2a0','#3d6a5c',11],[12,'PIZZARIA','#ff7aa8','#40597a',10],[22.5,'LAN CENTER','#b48cff','#6a4a7a',8]]
.forEach(([x,n,c,col,h])=>{const m=new THREE.MeshStandardMaterial({map:facade(col,3,Math.round(h/2.5)),roughness:.85});
 box(9,h,10,0,x,h/2,0,1,m);plane(7,2.4,new THREE.MeshStandardMaterial({color:0x1a2230,emissive:0xffcf8a,emissiveIntensity:.55}),x,1.6,5.02);
 plane(4,.9,sign(n,c,4,.9),x,3.4,5.05);box(7.4,.18,1.5,0,x,2.95,5.75,0,awn);box(9.4,.3,10.4,0x22252d,x,h+.15,0)});
box(9,10,10,0,-32,5,0,1,new THREE.MeshStandardMaterial({map:facade('#554a5e',3,4)}));
box(9,12,10,0,32,6,0,1,new THREE.MeshStandardMaterial({map:facade('#6b5d4a',3,5)}));
box(290,9,.5,0x2a2e3a,0,4.5,-9.5,1);
const fx=[0,1,2].map(i=>new THREE.MeshStandardMaterial({map:facade(['#c9553d','#3f7fbf','#d9a441'][i],3,3+i),roughness:.7}));
for(let x=-136.5;x<=136.5;x+=10.5){const k=Math.abs(Math.round(x/10.5)),h=7+(k*7)%6;
 if(Math.abs(x)>38){box(9.5,h,10,0,x,h/2,0,1,fx[k%3]);box(9.9,.3,10.4,0x22252d,x,h+.15,0)}
 const h2=8+(k*5)%7;box(9.5,h2,10,0,x,h2/2,52,1,fx[(k+1)%3]);box(9.9,.3,10.4,0x22252d,x,h2+.15,52)}
const cw=new THREE.MeshBasicMaterial({color:0xf2f2f2});for(let i=-3;i<=3;i++)plane(.8,13.6,cw,i*1.6,.02,16.2,-Math.PI/2);
const bush=new THREE.MeshStandardMaterial({color:0x3f9a45,roughness:.8,flatShading:true});
for(const z of[8.9,24.4])for(let x=-130;x<=130;x+=7)if(Math.abs(x)>3.2){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,1),bush);b.scale.y=.8;b.position.set(x+(z>20?2:0),.45,z);b.castShadow=true;scene.add(b)}

/* ---------- GAMESTATION store ---------- */
const wallM=new THREE.MeshStandardMaterial({color:0xe9e6df,roughness:.85});
const wood=tex(256,256,(g,w,h)=>{g.fillStyle='#c89a62';g.fillRect(0,0,w,h);for(let i=0;i<8;i++){g.fillStyle='rgba(90,55,20,.55)';g.fillRect(0,i*32,w,2);g.fillStyle='rgba(120,80,40,.25)';g.fillRect(Math.random()*w,i*32+8,60,2)}},[5,5]);
plane(10,10,new THREE.MeshStandardMaterial({map:wood,roughness:.45}),0,.03,0,-Math.PI/2);
box(10.3,4.4,.3,0,0,2.2,-5,1,wallM);box(.3,4.4,10,0,-5,2.2,0,1,wallM);box(.3,4.4,10,0,5,2.2,0,1,wallM);
box(3.5,4.4,.3,0,-3.25,2.2,5,1,wallM);box(3.5,4.4,.3,0,3.25,2.2,5,1,wallM);box(3,1.2,.3,0,0,3.8,5,0,wallM);
box(10.6,.3,10.6,0x2a2d38,0,4.55,0);
box(6.4,1.3,.2,0x07080d,0,5.4,5.1);plane(6,1.1,sign('GAMESTATION','#00e5ff',6,1.1),0,5.4,5.21);
for(const x of[-2.2,2.2]){box(1.6,.05,.5,0xffffff,x,4.38,0,0,new THREE.MeshBasicMaterial({color:0xfff2d6,toneMapped:false}));
 const l=new THREE.PointLight(0xffe2b8,.9,12);l.position.set(x,4,0);scene.add(l)}
// porta de vidro (abre sozinha) + placa ABERTO/FECHADO
const glass=new THREE.MeshStandardMaterial({color:0x9fe8ff,transparent:true,opacity:.28,roughness:.05,metalness:.2}),dm=new THREE.MeshStandardMaterial({color:0x1d2230,roughness:.5});
const sgO=sign('ABERTO','#38d47a',1,.45),sgC=sign('FECHADO','#ff4d5e',1,.45),signFaces=[];let doorT=0;
const leaves=[-1,1].map(s=>{const g=new THREE.Group(),add=(w,hh,x,y)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,.08),dm);m.position.set(x,y,0);g.add(m)};
 const gl=new THREE.Mesh(new THREE.BoxGeometry(1.46,3.1,.04),glass);gl.position.y=1.55;g.add(gl);
 add(1.5,.1,0,.05);add(1.5,.1,0,3.1);add(.08,3.1,-.71,1.55);add(.08,3.1,.71,1.55);add(.05,.5,-s*.55,1.1);
 if(s===1)for(const f of[0,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.4),sgC);m.position.set(.2,1.9,f?-.03:.03);m.rotation.y=f?Math.PI:0;g.add(m);signFaces.push(m)}
 g.position.set(s*.75,0,5.2);scene.add(g);return{g,x0:s*.75,s}});
function setSign(o){signFaces.forEach(m=>m.material=o?sgO:sgC)}
function toggleOpen(){if(!S.open&&!S.setups.length){toast('Compre um setup antes de abrir!','#ff6b6b');return}
 S.open=!S.open;setSign(S.open);toast(S.open?'Loja ABERTA!':'Loja FECHADA',S.open?'#38d47a':'#ff6b6b');
 if(S.open)mission('Loja aberta! O tempo começou a correr. Atenda os clientes e cobre no <b>caixa</b>.')}
// balcão + PCs
box(1.2,1,3.8,0,-4.1,.5,-2,1,new THREE.MeshStandardMaterial({map:wood,roughness:.4}));
const scr=c=>new THREE.MeshStandardMaterial({color:0x0a0c12,emissive:c,emissiveIntensity:1});
for(const [z,c] of[[-2.8,0xffa84a],[-1.2,0x4aa8ff]]){box(.08,.5,.75,0x15171d,-4.35,1.3,z);plane(.68,.4,scr(c),-4.3,1.3,z,0,Math.PI/2)}
box(.2,.08,.3,0x24292e,-3.75,1.04,-.6);box(.4,.12,.4,0x444a55,-3.75,1.06,-1.7);
box(.5,.5,.5,0x1b1d24,-3.1,.25,-2.8);
// lixo
const trash=[];const tm=[0x2b2b2e,0x6b3a2a,0xb02a2a,0x8a8a8a];
for(let i=0;i<S.trash;i++){const m=new THREE.Mesh(i%2?new THREE.IcosahedronGeometry(.28,0):new THREE.CylinderGeometry(.1,.1,.26,8),new THREE.MeshStandardMaterial({color:tm[i%4],roughness:.9,flatShading:true}));
 m.position.set(-2+Math.random()*6,.16,-3.5+Math.random()*7.5);m.rotation.set(Math.random(),Math.random()*6,Math.random());m.castShadow=true;scene.add(m);trash.push(m)}

/* ---------- decor: postes, árvores, carros ---------- */
for(let x=-140;x<=140;x+=14){for(const z of[8.6,23.9]){if(z<10&&Math.abs(x)<=42){const l=new THREE.PointLight(0xffe0a0,0,22);l.position.set(x,4.6,z+.8);scene.add(l);lampLights.push(l)}box(.14,5,.14,0x2a2d33,x,2.5,z);box(.9,.12,.14,0x2a2d33,x,5,z+(z<10?.4:-.4));
 box(.5,.1,.2,0,x,4.92,z+(z<10?.8:-.8),0,new THREE.MeshBasicMaterial({color:0xfff0c0,toneMapped:false}))}}
function tree(x,z){const s=.8+Math.random()*.6;const t=new THREE.Mesh(new THREE.CylinderGeometry(.14*s,.2*s,2.2*s,7),new THREE.MeshStandardMaterial({color:0x5a3d28}));t.position.set(x,1.1*s,z);t.castShadow=true;scene.add(t);
 for(let i=0;i<3;i++){const l=new THREE.Mesh(new THREE.IcosahedronGeometry((1.3-i*.25)*s,1),new THREE.MeshStandardMaterial({color:0x3d7a3a+i*0x0a1408,roughness:.9,flatShading:true}));l.position.set(x,(2.6+i*.7)*s,z);l.castShadow=true;scene.add(l)}}
for(let x=-130;x<=130;x+=10)if(Math.abs(x)>18)tree(x+Math.random()*3,26.2);
for(let x=-130;x<=130;x+=9)tree(x+Math.random()*3,-13+Math.random()*5);
function car(c){const g=new THREE.Group();const M=new THREE.MeshStandardMaterial({color:c,roughness:.3,metalness:.55});
 const b=new THREE.Mesh(new THREE.BoxGeometry(4.2,.8,1.8),M);b.position.y=.65;const k=new THREE.Mesh(new THREE.BoxGeometry(2.2,.7,1.6),new THREE.MeshStandardMaterial({color:0x10151f,roughness:.1,metalness:.8}));k.position.set(-.2,1.3,0);
 g.add(b,k);for(const sx of[-1.4,1.4])for(const sz of[-.9,.9]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.3,14),new THREE.MeshStandardMaterial({color:0x111111}));w.rotation.x=Math.PI/2;w.position.set(sx,.36,sz);g.add(w)}
 for(const sz of[-.6,.6]){const h=new THREE.Mesh(new THREE.BoxGeometry(.05,.15,.35),new THREE.MeshBasicMaterial({color:0xfff6d0,toneMapped:false}));h.position.set(2.12,.7,sz);g.add(h)}
 g.traverse(o=>o.castShadow=true);scene.add(g);return g}
car(0xc0392b).position.set(-14,0,10.9);car(0x2e86de).position.set(15,0,10.9);
solids.push({x0:-16.2,x1:-11.8,z0:10,z1:11.8},{x0:12.8,x1:17.2,z0:10,z1:11.8});
const mv=[car(0xf1c40f),car(0x27ae60),car(0xecf0f1)];mv[0].position.set(-40,0,13.6);mv[1].position.set(30,0,18.8);mv[1].rotation.y=Math.PI;mv[2].position.set(70,0,18.8);mv[2].rotation.y=Math.PI;

/* ---------- pessoas ---------- */
function person(c){const g=new THREE.Group(),m=col=>new THREE.MeshStandardMaterial({color:col,roughness:.8});
 const body=new THREE.Mesh(new THREE.BoxGeometry(.5,.7,.3),m(c));body.position.y=1.15;const head=new THREE.Mesh(new THREE.SphereGeometry(.2,14,12),m(0xdcae88));head.position.y=1.7;
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.21,14,8,0,6.3,0,1.2),m(0x2a1c14));hair.position.y=1.72;g.add(body,head,hair);
 const legs=[-.12,.12].map(x=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.2,.8,.22).translate(0,-.4,0),m(0x242a3d));l.position.set(x,.8,0);g.add(l);return l});
 g.userData.legs=legs;g.traverse(o=>o.castShadow=true);scene.add(g);return g}
const hoopers=[0,1,2].map(i=>({g:person([0xe74c3c,0x3498db,0xf1c40f][i]),a:i*2.1,sp:.6+i*.15}));
const ball=new THREE.Mesh(new THREE.SphereGeometry(.24,14,12),new THREE.MeshStandardMaterial({color:0xd2691e}));scene.add(ball);
const walkers=[];for(let i=0;i<22;i++)walkers.push({g:person([0xd94f4f,0x4fa3d9,0xd9c14f,0x8a4fd9,0x4fd98a,0xe27ea1][i%6]),dir:i%3?1:-1,x:-130+Math.random()*260,lane:i%2?7:25.4,sp:1.1+Math.random()*.6,w:Math.random()*9});

/* ---------- NPCs clientes ---------- */
const npcs=[],waitList=[];let spawnT=3;
function go(n,t,dt){const dx=t.x-n.g.position.x,dz=t.z-n.g.position.z,d=Math.hypot(dx,dz);if(d<.12)return true;
 const s=Math.min(d,1.7*dt);n.g.position.x+=dx/d*s;n.g.position.z+=dz/d*s;n.g.rotation.y=Math.atan2(dx,dz);
 n.w=(n.w||0)+dt*8;n.g.userData.legs[0].rotation.x=Math.sin(n.w)*.6;n.g.userData.legs[1].rotation.x=-Math.sin(n.w)*.6;return false}
function spawnNpc(){const slot=S.setups.find(s=>!s.busy);if(!slot)return;const w=walkers.filter(w=>w.lane===7&&Math.abs(w.x)<70).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x))[0];if(!w){spawnT=2;return}walkers.splice(walkers.indexOf(w),1);slot.busy=true;
 const n={g:w.g,slot,st:'walk',next:'play',el:0,t:0,path:[new V(0,0,7),new V(0,0,3.5),new V(2.9,0,slot.z)]};
 npcs.push(n)}
function leave(n){n.st='walk';n.next='gone';const dr=Math.random()<.5?-1:1;n.path=[new V(0,0,3.5),new V(0,0,8),new V(dr*30,0,dr>0?7.6:6.4)]}
function updNpcs(dt){
 if(S.setups.length&&S.open&&G.h<19.5){spawnT-=dt;if(spawnT<=0){spawnT=7+Math.random()*7;if(S.setups.some(s=>!s.busy))spawnNpc()}}
 for(let i=npcs.length-1;i>=0;i--){const n=npcs[i];
  if(n.st==='walk'){if(go(n,n.path[0],dt)){n.path.shift();if(!n.path.length){
    if(n.next==='play'){n.st='play';n.t=9+Math.random()*9;n.g.rotation.y=Math.PI/2;n.g.position.y=.14;n.slot.scr.material.emissiveIntensity=1.6;n.g.userData.legs.forEach(l=>l.rotation.x=-1.2)}
    else{const dr=n.g.position.x>0?1:-1;walkers.push({g:n.g,dir:dr,x:n.g.position.x,lane:7,sp:1.3,w:0});npcs.splice(i,1)}}}}
  else if(n.st==='play'){n.el+=dt;if(n.el>=n.t){n.st='wait';n.g.position.y=0;n.g.userData.legs.forEach(l=>l.rotation.x=0);n.slot.busy=false;n.slot.scr.material.emissiveIntensity=.2;
    n.bill=Math.round((30+n.el*6)*n.slot.m);waitList.push(n);mission('<b>Cliente no caixa!</b> Use o PC do caixa no balcão.')}}
  else if(n.st==='wait')go(n,new V(-2.6,0,.3+waitList.indexOf(n)*.9),dt)}}

/* ---------- jogador ---------- */
const P={x:0,z:9.5,yaw:0,pitch:0,vx:0,vz:0};const keys={};
function hit(x,z){const r=.35;if(x<-135||x>135||z<-12||z>60)return true;for(const s of solids)if(x+r>s.x0&&x-r<s.x1&&z+r>s.z0&&z-r<s.z1)return true;return false}
function move(dt){const f=new V(-Math.sin(P.yaw),0,-Math.cos(P.yaw)),r=new V(Math.cos(P.yaw),0,-Math.sin(P.yaw));
 const w=new V((keys.KeyD?1:0)-(keys.KeyA?1:0),0,(keys.KeyW?1:0)-(keys.KeyS?1:0));
 if(w.lengthSq())w.normalize();const sp=keys.ShiftLeft?7.5:4.4;
 const tx=(f.x*w.z+r.x*w.x)*sp,tz=(f.z*w.z+r.z*w.x)*sp,k=1-Math.exp(-14*dt);
 P.vx+=(tx-P.vx)*k;P.vz+=(tz-P.vz)*k;
 const nx=P.x+P.vx*dt,nz=P.z+P.vz*dt;if(!hit(nx,P.z))P.x=nx;else P.vx=0;if(!hit(P.x,nz))P.z=nz;else P.vz=0;
 const bob=Math.hypot(P.vx,P.vz)>.5?Math.sin(performance.now()/130)*.03:0;
 cam.position.set(P.x,1.7+bob,P.z);cam.rotation.order='YXZ';cam.rotation.set(P.pitch,P.yaw,0)}

/* ---------- interação ---------- */
let cur=null;
function nearest(){const f=new V(-Math.sin(P.yaw),0,-Math.cos(P.yaw));let best=null,bd=9;
 for(const t of trash){if(!t.parent)continue;const dx=t.position.x-P.x,dz=t.position.z-P.z,d=Math.hypot(dx,dz);
  if(d<2.8&&(dx*f.x+dz*f.z)/d>.55&&d<bd){bd=d;best={txt:'Limpar lixo',fn:()=>{scene.remove(t);S.trash--;toast('🗑️ '+(8-S.trash)+'/8','#9aa3c7');
   mission(S.trash?'Limpe o <b>lixo</b> do chão ('+S.trash+' restantes).':'Loja limpa! Use o <b>PC do balcão</b> (esquerda) e compre seu primeiro setup.')}}}}
 if(best)return best;
 let pd=2.2;
 for(const [z,k,txt] of[[-2.8,'shop','Usar o PC (Shopi)'],[-1.2,'cash','Abrir o caixa']]){const d=Math.hypot(P.x+4,P.z-z);if(d<pd){pd=d;
  best=S.trash?{txt:'Limpe o lixo primeiro',fn:()=>{}}:{txt,fn:()=>openUI(k)}}}
 {const d=Math.hypot(P.x-1,P.z-5.2);if(d<2.6&&d<pd)best={txt:S.open?'Virar placa: FECHAR a loja':'Virar placa: ABRIR a loja',fn:toggleOpen}}
 return best}

/* ---------- UI: PC ---------- */
const PROD=[{n:'Setup CPS 477',p:600,m:1,c:0xffa84a,i:'🖥️',d:'PC gamer de entrada'},{n:'Setup Ultra Cyber 88',p:1100,m:1.8,c:0x4affd8,i:'🎮',d:'Alto desempenho, cobra mais'},
 {n:'Pintura Roxa Neon',p:150,paint:0x9a86e6,i:'🎨',d:'Pinta as paredes da loja'},{n:'Pintura Azul Céu',p:150,paint:0x9cc8ee,i:'🎨',d:'Pinta as paredes da loja'},{n:'Pintura Branco Gelo',p:100,paint:0xe9e6df,i:'🎨',d:'Pinta as paredes da loja'}];
function openUI(k){S.ui=k;for(const c in keys)keys[c]=0;document.exitPointerLock();renderPC()}
function closeUI(){S.ui=null;$('pc').style.display='none';lock();setTimeout(()=>{if(!S.locked&&!S.ui)showMenu()},350)}
window.closeUI=closeUI;
function renderPC(){const el=$('pc');el.style.display='flex';
 if(S.ui==='shop'){el.innerHTML=`<div class="win"><div class="wh"><div class="t">sho<span>pi</span></div><div class="m">R$ ${S.money}</div><button class="x" onclick="closeUI()">✕</button></div><div class="grid">`+
  PROD.map((p,i)=>{const full=!p.paint&&S.setups.length>=4,no=S.money<p.p;return `<div class="card"><div class="i" style="background:#${(p.c||p.paint).toString(16).padStart(6,'0')}33">${p.i}</div><b>${p.n}</b><small>${p.d}</small><div class="p">R$ ${p.p}</div><button class="b" ${full||no?'disabled':''} onclick="buy(${i})">${full?'LOTADO':no?'SEM SALDO':'COMPRAR'}</button></div>`}).join('')+`</div><div style="padding:12px 18px;background:#1d2130;display:flex;justify-content:space-between;align-items:center;color:#8b93ab;font-size:13px"><span>${G.h>=19?'A noite chegou. Hora de fechar as contas.':'Encerrar o dia só fica disponível à noite (19h).'}</span><button class="b" ${G.h>=19?'':'disabled'} onclick="endDay()">🌙 ENCERRAR O DIA</button></div></div>`}
 else if(S.ui==='report')el.innerHTML=reportHTML();else{const n=waitList[0],ok=n&&Math.hypot(n.g.position.x+2.6,n.g.position.z-.3)<.6;
  el.innerHTML=`<div class="win" style="width:min(520px,94vw)"><div class="wh"><div class="t">PDV — Caixa</div><button class="x" onclick="closeUI()">✕</button></div><div class="cx">`+
  (ok?`<div>Cliente aguardando pagamento</div><div class="v">R$ ${n.bill}</div><div class="r"><button class="b" onclick="pay('💵 Dinheiro')">💵 DINHEIRO</button><button class="b" onclick="pay('💳 Cartão')">💳 CARTÃO</button></div>`:`<div style="color:#8b93ab">Nenhum cliente no caixa.</div>`)+`</div></div>`}}
window.buy=i=>{const p=PROD[i];if(S.money<p.p)return;
 if(p.paint){S.money-=p.p;G.spent+=p.p;wallM.color.setHex(p.paint);toast('Paredes pintadas!','#b48cff')}
 else{if(S.setups.length>=4)return;S.money-=p.p;G.spent+=p.p;const z=SLOTS[S.setups.length];
  box(.8,.85,1.6,0x2b2e38,3.8,.425,z,1);box(.08,.5,.75,0x15171d,4,1.1,z);const sc=plane(.68,.4,scr(p.c),3.95,1.1,z,0,-Math.PI/2);sc.material.emissiveIntensity=.2;
  box(.28,.03,.6,0x15171d,3.45,.88,z);box(.5,.5,.5,0x1b1d24,2.95,.25,z);
  S.setups.push({z,m:p.m,busy:false,scr:sc});toast('Setup instalado!','#38d47a');
  if(S.setups.length===1){mission('Setup instalado! Vá até a porta e vire a <b>placa</b> para ABRIR a loja.');spawnT=4}}
 hudMoney();renderPC()};
window.pay=m=>{const n=waitList.shift();if(!n)return;S.money+=n.bill;G.rev+=n.bill;hudMoney();toast(`${m}  +R$ ${n.bill}`,'#ffd166');leave(n);mission('Faturando! Compre mais setups para crescer.');closeUI()};

function reportHTML(){const fix=80+S.setups.length*20,pf=G.rev-G.spent-fix;
 const row=(a,b,c)=>`<div style="display:flex;justify-content:space-between"><span>${a}</span><b style="color:${c}">${b}</b></div>`;
 return `<div class="win" style="width:min(480px,94vw)"><div class="wh"><div class="t">Dia ${G.day} — Fechamento</div></div><div class="cx" style="align-items:stretch;text-align:left">`+
 row('Faturamento','R$ '+G.rev,'#38d47a')+row('Compras do dia','− R$ '+G.spent,'#ff6b6b')+row('Aluguel + energia','− R$ '+fix,'#ff6b6b')+
 `<hr style="width:100%;border-color:#2b3150"><div style="display:flex;justify-content:space-between;font-size:22px"><span>Lucro</span><b style="color:${pf>=0?'#38d47a':'#ff6b6b'}">R$ ${pf}</b></div><button class="b" onclick="nextDay()">☀️ COMEÇAR DIA ${G.day+1}</button></div></div>`}
window.endDay=()=>{if(G.h<19)return;S.ui='report';renderPC()};
window.nextDay=()=>{S.money-=80+S.setups.length*20;hudMoney();G.day++;G.h=8;G.over=false;G.rev=0;G.spent=0;G.n=0;
 npcs.splice(0).forEach(n=>scene.remove(n.g));waitList.length=0;S.setups.forEach(s=>{s.busy=false;s.scr.material.emissiveIntensity=.2});spawnT=4;S.open=false;setSign(false);mission('Novo dia! Prepare a loja e vire a <b>placa</b> na porta para abrir.');closeUI()};
/* ---------- HUD ---------- */
function hudMoney(){$('money').textContent=S.money}
function mission(t){$('mission').innerHTML=t}
let tt;function toast(t,c){const e=$('toast');e.textContent=t;e.style.color=c;e.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>e.style.opacity=0,1700)}
mission('Limpe o <b>lixo</b> do chão (8 restantes).');

/* ---------- input / pointer lock ---------- */
function lock(){try{const p=R.domElement.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
function showMenu(){$('menu').style.display='flex';$('hud').style.display='none'}
$('play').onclick=()=>{if(!S.started){S.started=true;P.x=0;P.z=9.5;P.yaw=0}lock()};
document.addEventListener('pointerlockchange',()=>{S.locked=document.pointerLockElement===R.domElement;
 if(S.locked){$('menu').style.display='none';$('hud').style.display='block';$('play').textContent='CONTINUAR'}
 else if(S.started&&!S.ui)showMenu()});
document.addEventListener('mousemove',e=>{if(!S.locked)return;if(Math.abs(e.movementX)>300||Math.abs(e.movementY)>300)return;
 P.yaw-=e.movementX*.0022;P.pitch=Math.max(-1.4,Math.min(1.4,P.pitch-e.movementY*.0022))});
document.addEventListener('keydown',e=>{if(e.code==='Escape'&&S.ui){closeUI();return}keys[e.code]=1;
 if(e.code==='KeyE'&&S.locked&&cur)cur.fn()});
document.addEventListener('keyup',e=>keys[e.code]=0);
document.addEventListener('mousedown',e=>{if(S.locked&&cur&&e.button===0)cur.fn()});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0});
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});

/* ---------- loop ---------- */
const clock=new THREE.Clock();let gt=0;
(function loop(){requestAnimationFrame(loop);
 const paused=S.started&&!S.locked&&!S.ui;const dt=Math.min(clock.getDelta(),.05)*(paused?0:1);gt+=dt;const t=gt;   // delta atualizado TODO frame e limitado: fim do teletransporte
 if(S.locked&&!S.ui){move(dt);cur=nearest();const p=$('prompt');p.style.display=cur?'block':'none';if(cur)$('ptxt').textContent=cur.txt}
 else if(!S.started){const a=Math.sin(t*.12)*.7;cam.position.set(Math.sin(a)*16,3.4+Math.sin(t*.2)*.6,9+Math.cos(a)*14);cam.lookAt(0,2.6,4)}
 if(S.started&&S.open&&!G.over&&S.ui!=='report'){G.h+=dt/15;
  if(G.h>=19&&!G.n){G.n=1;mission('Anoiteceu! Quando quiser, encerre o dia no <b>PC do balcão</b>.')}
  if(G.h>=22){G.h=22;G.over=true;mission('Fim do expediente! No <b>PC do balcão</b>, encerre o dia.')}}
 setSky(G.h);$('clock').textContent=`Dia ${G.day} · ${String(G.h|0).padStart(2,'0')}:${String((G.h%1*60)|0).padStart(2,'0')} ${G.h>=19?'🌙':'☀️'}`;
 walkers.forEach(w=>{w.x+=w.dir*w.sp*dt;if(w.x>135)w.x=-135;if(w.x<-135)w.x=135;w.w+=dt*7;w.g.position.set(w.x,0,w.lane+(w.dir>0?.6:-.6));w.g.rotation.y=w.dir>0?1.5708:-1.5708;
  w.g.userData.legs[0].rotation.x=Math.sin(w.w)*.6;w.g.userData.legs[1].rotation.x=-Math.sin(w.w)*.6});
 {const nr=[[P.x,P.z],...npcs.map(n=>[n.g.position.x,n.g.position.z])].some(([x,z])=>Math.hypot(x,z-5.2)<2.4);doorT+=((nr?1:0)-doorT)*Math.min(1,dt*6);leaves.forEach(l=>l.g.position.x=l.x0+l.s*1.5*doorT)}
 updNpcs(dt);
 hoopers.forEach(h=>{h.a+=dt*h.sp;const x=Math.cos(h.a)*9,z=36+Math.sin(h.a*1.3)*5;h.g.position.set(x,0,z);h.g.rotation.y=Math.atan2(-Math.sin(h.a)*9,Math.cos(h.a*1.3)*6.5);
  h.g.userData.legs[0].rotation.x=Math.sin(h.a*14)*.7;h.g.userData.legs[1].rotation.x=-Math.sin(h.a*14)*.7});
 ball.position.set(hoopers[0].g.position.x+.5,.3+Math.abs(Math.sin(t*6))*.8,hoopers[0].g.position.z);
 mv.forEach((c,i)=>{c.position.x+=(i?-8:10)*dt;if(c.position.x>150)c.position.x=-150;if(c.position.x<-150)c.position.x=150});
 R.render(scene,cam)})();
