import {WORLD,WORLD_WIDTH,WORLD_HEIGHT,nearestPoi} from './world.mjs';
const T=32,cache=new Map();
const rect=(x,y,w,h,c,o='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${o}/>`;
const pixelPerson=(x,y,color='#b75c48',dir='down',step=0)=>{
 const skin='#e9bc90',hair='#453d4c',pants='#394959';
 let art=rect(4,34,24,5,'#273c41','opacity=".2"')+rect(9,1,15,4,hair)+rect(6,5,21,7,hair)+rect(8,10,17,10,skin)+rect(6,7,22,4,'#e8cb8b')+rect(7,18,19,13,color)+rect(3,21,5,9,skin)+rect(25,21,4,9,skin)+rect(10,28,6,8+(step%2?2:0),pants)+rect(20,28,6,8-(step%2?2:0),pants)+rect(8,35+(step%2?2:0),9,3,hair)+rect(19,35-(step%2?2:0),9,3,hair);
 if(dir!=='up'){art+=rect(dir==='left'?8:12,13,2,3,hair);if(dir!=='left')art+=rect(21,13,2,3,hair)}else art+=rect(8,10,17,6,hair)+rect(11,20,12,12,'#ae915a');
 art+=rect(dir==='up'?11:8,20,4,10,'#e9ca91');
 return `<g transform="translate(${x} ${y})" shape-rendering="crispEdges">${art}</g>`;
};
function tree(x,y,c){return rect(x+5,y+24,26,8,'#314f49','opacity=".18"')+rect(x+13,y+17,7,16,'#846849')+rect(x+3,y+5,28,19,c)+rect(x+7,y-3,20,27,c)+rect(x+10,y,14,6,'#a9c58a')+rect(x+2,y+14,6,7,'#446f50')+rect(x+23,y+12,8,9,'#446f50')}
function tower(x,y,id){const c=id==='core'?'#9b94c5':'#d9d1b5';return `<g>${rect(x-16,y+14,65,9,'#425650','opacity=".2"')}${rect(x-7,y-46,42,68,c)}${rect(x-11,y-20,50,6,'#b0ad98')}${rect(x-12,y-47,52,7,'#7f9182')}${rect(x-4,y-69,36,23,'#e5bf6e')}${rect(x+1,y-64,26,14,'#fff0b0')}${rect(x+11,y-64,4,14,'#c29250')}${rect(x-8,y-74,44,6,'#537477')}${rect(x-2,y-81,32,7,'#65878a')}${rect(x+7,y-37,14,15,'#64818b')}${rect(x+5,y-2,18,23,'#725e56')}${rect(x-13,y+22,55,6,'#bab69c')}</g>`}
function house(x,y){return rect(x-51,y-87,107,74,'#e6d6b2')+rect(x+26,y-118,12,31,'#a8866c')+rect(x+24,y-123,16,6,'#c5b18c')+rect(x-58,y-87,121,12,'#914f43')+rect(x-47,y-100,99,16,'#b36851')+rect(x-34,y-114,73,16,'#c67b5c')+rect(x-21,y-124,47,12,'#cd8d67')+rect(x-43,y-98,90,3,'#d79772')+rect(x-28,y-111,61,3,'#e0a17a')+rect(x-51,y-28,107,5,'#c5ae86')+rect(x-35,y-64,23,20,'#6b9eac')+rect(x+19,y-64,23,20,'#6b9eac')+rect(x-28,y-64,4,20,'#efe0b3')+rect(x+26,y-64,4,20,'#efe0b3')+rect(x-38,y-45,29,4,'#a5805d')+rect(x+16,y-45,29,4,'#a5805d')+rect(x-7,y-42,23,29,'#80634e')+rect(x+8,y-27,3,3,'#e5c688')+rect(x-12,y-13,33,8,'#d1bf9a')}
function decorArt(d,id){const x=d.x*T,y=d.y*T,r=(a,b,w,h,c,o='')=>rect(x+a,y+b,w,h,c,o);switch(d.kind){
 case 'flowers':return [[3,6],[16,3],[8,20],[23,17]].map(([a,b],i)=>r(a+2,b+5,2,8,'#608565')+r(a,b,7,7,['#efcda4','#e2b5a6','#dfd6ee','#efdf9c'][i])+r(a+2,b+2,3,3,'#fff2c9')).join('');
 case 'mushroom':return r(8,14,4,13,'#e4d2ac')+r(3,12,14,6,'#b67758')+r(6,8,8,6,'#d59b76')+r(7,11,3,3,'#edd4a8')+r(22,19,3,8,'#e4d2ac')+r(18,15,12,5,'#b78960');
 case 'tree':return tree(x-6,y-13,'#567f5b')+tree(x+11,y,'#719768');
 case 'log':return r(-3,11,38,16,'#866d4a')+r(-5,14,6,11,'#d7bb82')+r(0,17,3,5,'#ab8b5d')+r(6,12,27,3,'#a89060')+r(25,7,5,9,'#678354');
 case 'fence':return r(1,10,30,5,'#b49969')+r(1,21,30,4,'#b49969')+r(4,5,5,25,'#ceb88d')+r(24,5,5,25,'#ceb88d');
 case 'bench':return r(-4,11,40,5,'#997852')+r(-4,18,40,5,'#c3a476')+r(-4,25,40,5,'#b39465')+r(1,5,5,29,'#795f48')+r(26,5,5,29,'#795f48');
 case 'lamp':return r(13,-8,5,38,'#677373')+r(7,-24,18,18,'#d5b574')+r(10,-21,12,12,'#ffefb3')+r(5,-29,22,5,'#63797a')+r(10,28,12,4,'#7f8980');
 case 'pot':return r(6,15,22,17,'#b9815c')+r(3,12,28,5,'#d5a67c')+r(12,0,5,17,'#668c5a')+r(5,2,11,8,'#90a772')+r(16,-3,12,9,'#789967')+r(15,5,8,7,'#e7c992');
 case 'well':return r(-7,10,46,20,'#98a198')+r(-2,14,36,9,'#4e7f85')+r(0,17,32,3,'#99bbba')+r(-7,9,6,24,'#c4c5ac')+r(33,9,6,24,'#c4c5ac')+r(-9,26,50,6,'#b3b8a5')+r(-4,-13,4,25,'#917953')+r(31,-13,4,25,'#917953')+r(-8,-20,47,7,'#d0b988')+r(13,-13,3,30,'#a38558');
 case 'stall':return r(-6,6,45,27,'#a88860')+r(-10,3,53,6,'#d5b381')+r(-8,-18,48,16,'#eee0b1')+r(-8,-18,8,16,'#a96659')+r(8,-18,8,16,'#a96659')+r(24,-18,8,16,'#a96659')+r(-8,-2,3,32,'#836848')+r(38,-2,3,32,'#836848')+r(1,6,8,6,'#a7b777')+r(13,6,8,6,'#d5a365')+r(26,6,8,6,'#8ab9b8');
 case 'boat':return r(-9,12,52,8,'#8a6950')+r(-2,20,38,7,'#b39465')+r(1,7,31,5,'#cfb57e')+r(12,1,4,12,'#80654c');
 case 'coral':return r(13,5,7,23,'#c98985')+r(2,11,27,5,'#e5aaa0')+r(3,3,5,13,'#daa399')+r(25,-3,5,18,'#e8b1a4')+r(10,-3,5,12,'#dc9b90')+r(1,27,31,4,'#c4b28c');
 case 'shell':return r(7,18,17,5,'#f6e5c3')+r(9,12,14,6,'#e5c7ad')+r(12,8,8,8,'#f4dfc0')+r(16,10,2,12,'#d3ad97')+r(25,26,4,3,'#b3a692');
 case 'rail':return r(6,0,3,32,'#726356')+r(24,0,3,32,'#726356')+[2,12,23].map(a=>r(3,a,28,4,'#b69877')).join('');
 case 'cart':return r(0,8,35,18,'#8b8173')+r(3,10,28,10,'#655e56')+r(3,27,7,7,'#534f4a')+r(26,27,7,7,'#534f4a')+r(9,3,8,14,'#d8b679')+r(20,0,7,18,'#c19072');
 case 'crystal':{const c=id==='volcano'?'#e4b279':id==='sky'?'#d5def0':'#b9c1e8';return r(8,3,10,27,c)+r(11,-4,5,8,c)+r(3,16,7,18,id==='volcano'?'#c98d6d':'#929dc5')+r(20,7,9,24,c)+r(23,0,4,9,c)+r(10,7,3,15,'#f5eccf')+r(1,31,32,4,'#777689')}
 case 'forge':return r(-7,0,46,34,'#817568')+r(-2,5,36,23,'#4e4b47')+r(3,16,26,11,'#d78554')+r(8,11,17,13,'#ecc57e')+r(-7,-7,46,8,'#ad9272')+r(20,-24,12,18,'#96816c');
 case 'ruin':return r(5,-2,20,30,'#bbb9b1')+r(2,-8,26,7,'#d4d0c2')+r(2,28,27,5,'#a29e9a')+r(10,2,3,24,'#93979a')+r(18,2,3,24,'#93979a');
 case 'telescope':return r(13,7,5,26,'#85829a')+r(6,29,22,4,'#aaa0a5')+r(3,-6,26,11,'#d0bea0')+r(24,-12,12,12,'#c4a674')+r(31,-10,5,8,'#728c9f')+r(1,3,14,5,'#9694a8');
 default:return '';
}}
function poiArt(p,map){const x=p.x*T,y=p.y*T;let art='';
 if(p.kind==='npc')art=pixelPerson(x,y-12,map.id==='forest'?'#518467':map.id==='bay'?'#578cad':map.id==='volcano'?'#a86645':map.id==='core'?'#787098':'#85659d');
 if(p.kind==='tower')art=tower(x,y,map.id);
 if(p.kind==='house')art=house(x+15,y+18);
 if(p.kind==='grass')art=rect(x+7,y+3,17,23,'#56875c')+rect(x+3,y+11,25,10,'#78a26a')+rect(x+13,y-2,6,21,'#99bd77');
 if(p.kind==='camp')art=rect(x-8,y+5,50,23,'#768d73')+rect(x,y-8,34,35,'#e5bd7e')+rect(x+8,y-16,18,43,'#ecd19c')+rect(x+10,y+5,14,24,'#78634d')+rect(x+12,y+5,6,24,'#a98962');
 if(p.kind==='gather')art=rect(x+3,y+11,29,17,'#a5835b')+rect(x+7,y+15,21,3,'#d4b187')+rect(x+8,y+1,6,16,'#668d5b')+rect(x+17,y-1,9,18,'#87ac6c')+rect(x+25,y+5,7,12,'#a7c480');
 if(p.kind==='gate')art=rect(x+1,y-17,7,43,'#7d8170')+rect(x+26,y-17,7,43,'#7d8170')+rect(x-2,y-23,38,8,map.id==='sky'||map.id==='core'?'#bbb0d9':'#c5ab78')+rect(x+8,y-16,18,29,'#ddcf99','opacity=".35"');
 if(p.kind==='boat')art=rect(x-14,y+18,64,11,'#805f46')+rect(x-7,y+29,49,7,'#a18053')+rect(x+14,y-21,4,43,'#74573f')+rect(x+19,y-18,28,20,'#ece1be')+rect(x+19,y+2,17,7,'#ece1be');
 if(p.kind==='secret')art=rect(x-1,y-1,38,28,'#918c7c')+rect(x+5,y-10,27,12,'#aaa390')+rect(x+9,y+7,16,21,'#485a57')+rect(x+1,y+1,8,9,'#7b9868');
 if(p.kind==='sign')art=rect(x+13,y+9,5,20,'#93774e')+rect(x+1,y-5,30,19,'#d5b982')+rect(x+6,y+1,20,3,'#896d49')+rect(x+6,y+7,13,2,'#896d49');
 if(p.kind==='star')art=rect(x+7,y+16,20,10,'#b9b7bf')+rect(x+12,y-14,9,34,'#ead393')+rect(x+1,y-2,31,9,'#efdfad')+rect(x+10,y-5,12,14,'#fff5cd');
 const labelWidth=Math.max(58,p.name.length*11+14);
 return `<g>${art}<g class="world-label" transform="translate(${x+16} ${y+48})"><rect x="${-labelWidth/2}" y="-13" width="${labelWidth}" height="20" rx="5" fill="#243f43" opacity=".84"/><text text-anchor="middle" y="1" fill="#fffae9" font-family="system-ui,sans-serif" font-size="10">${p.name}</text></g></g>`;
}
function mapArt(region){if(cache.has(region))return cache.get(region);const m=WORLD[region],[base,alt,path,border,water]=m.colors;let under='',over='';
 for(let y=0;y<WORLD_HEIGHT;y++)for(let x=0;x<WORLD_WIDTH;x++){
  const t=m.tiles[y][x],X=x*T,Y=y*T,n=(x*17+y*31)%11;
  under+=rect(X,Y,32,32,base);
  if(t==='water'){
   under+=rect(X,Y,32,32,water);under+=rect(X+3+n,Y+9,14,2,region==='volcano'?'#f9b461':'#b6d0cb','opacity=".5"')+rect(X+8,Y+25-n,17,2,region==='volcano'?'#f5a053':'#c7dcd5','opacity=".3"');
  }else if(t==='path'||t==='dock'){
   under+=rect(X,Y,32,32,t==='dock'?'#ba946c':path);
   if(t==='dock'||m.bridges.includes(`${x},${y}`)){under+=rect(X,Y,32,32,region==='core'?'#aea5cb':'#c2a77e')+rect(X,Y+1,32,2,border)+rect(X,Y+15,32,2,border)+rect(X+3,Y+4,2,7,'#e0caa2')}
   else{if(m.tiles[y-1]?.[x]!=='path')under+=rect(X,Y,32,2,border);if(m.tiles[y+1]?.[x]!=='path')under+=rect(X,Y+30,32,2,border);if(m.tiles[y]?.[x-1]!=='path')under+=rect(X,Y,2,32,border);if(m.tiles[y]?.[x+1]!=='path')under+=rect(X+30,Y,2,32,border);under+=rect(X+5+n,Y+8,4,2,'#f3e2be')+rect(X+20,Y+22-n,3,2,border)}
  }else if(t==='tree'||t==='edge'){
   if(region==='volcano'||region==='sky'||region==='core'){over+=rect(X+3,Y+9,28,23,region==='volcano'?'#796658':'#7b8496')+rect(X+8,Y+4,18,6,region==='volcano'?'#9b8068':'#aab1bd')+rect(X+7,Y+12,10,4,'#c3baa7','opacity=".5"')}
   else over+=tree(X,Y,region==='bay'?'#88a67b':n<5?'#5e8b5d':'#739760');
  }else if(t==='rocks')over+=rect(X+4,Y+12,24,19,border)+rect(X+8,Y+6,15,8,'#b8aca0')+rect(X+8,Y+15,9,3,'#d6c6b0');
  else if(t==='grass'){under+=rect(X,Y,32,32,alt);for(const [gx,gy]of [[3,8],[16,5],[8,22],[23,20]])under+=rect(X+gx,Y+gy,3,10,'#4d7f64')+rect(X+gx+3,Y+gy+3,3,8,'#b6c28a')}
  else if(t==='flowers'){under+=rect(X+7,Y+14,3,11,'#5e976b')+rect(X+4,Y+11,9,5,n<6?'#f1d6a0':'#dcd4ef')+rect(X+21,Y+24,3,4,'#517c60')+rect(X+19,Y+20,7,6,'#f0e3bd')}
  else if(t!=='house'){under+=rect(X+6+n,Y+14,5,2,alt)+rect(X+23,Y+6+n,3,3,alt);if(n===3)under+=rect(X+9,Y+23,3,3,'#dddfa9')}
 }
 // Flower pots and lamps on the edges of clearings give routes a readable rhythm.
 for(const d of m.decor)over+=decorArt(d,region);
 for(const p of m.pois)over+=poiArt(p,m);
 const art=`<g shape-rendering="crispEdges">${under}${over}</g>`;cache.set(region,art);return art;
}
export function camera(pos){return {x:Math.max(0,Math.min(640,pos.x*T-304)),y:Math.max(0,Math.min(480,pos.y*T-192))}}
export function worldSVG(s,full=false){const pos=s.positions[s.region],c=camera(pos),m=WORLD[s.region];return `<svg id="walking-map" xmlns="http://www.w3.org/2000/svg" viewBox="${full?'0 0 1280 896':`${c.x} ${c.y} 640 416`}" role="img" aria-label="${m.name}可探索地图。道路连接地标，水面、房屋与山林不可穿过。"><g>${mapArt(s.region)}</g><g id="hero-marker">${heroArt(s)}</g></svg>`}
function heroArt(s){const p=s.positions[s.region],x=p.x*T,y=p.y*T;return `<ellipse cx="${x+16}" cy="${y+29}" rx="19" ry="8" fill="#fff1b4" opacity=".8"/>${pixelPerson(x,y-10,'#b95b4a',p.dir,p.walked)}<path d="M${x+11} ${y-23}h10l-5 6z" fill="#fff5d6" stroke="#6c8b72" stroke-width="1"/>`}
export function refreshWorld(s){
 const mount=document.getElementById('world-surface');if(!mount)return;
 if(mount.dataset.region!==s.region||!document.getElementById('walking-map')){mount.innerHTML=worldSVG(s);mount.dataset.region=s.region}else{const c=camera(s.positions[s.region]);document.getElementById('walking-map').setAttribute('viewBox',`${c.x} ${c.y} 640 416`);document.getElementById('hero-marker').innerHTML=heroArt(s)}
 const near=nearestPoi(s.region,s.positions[s.region]),hint=document.getElementById('world-interact'),label=document.getElementById('world-location');
 if(hint){hint.disabled=!near;hint.textContent=near?`互动 · ${near.name}`:'沿道路寻找地标';hint.setAttribute('aria-label',near?`与${near.name}互动`:'附近暂无可互动地点')}
 if(label)label.textContent=`${s.positions[s.region].x}, ${s.positions[s.region].y} · ${near?near.name:'旅途之中'}`;
}
