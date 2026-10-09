// Hand-authored road networks over deterministic tile terrain. Shared by rendering,
// collision, save validation and reachability tests; no browser dependencies.
export const WORLD_WIDTH=40,WORLD_HEIGHT=28;
const themes={town:['#96ba86','#87ad7b','#e5c694','#bb9673','#5c9fa7'],forest:['#73955d','#62864f','#c5b684','#a48b67','#569699'],bay:['#e4d3a1','#d7c18e','#f4dfa9','#c6a875','#589cad'],volcano:['#a5826b','#98715e','#c5a17b','#765d51','#dd7347'],sky:['#a2acaf','#949cac','#d4cbd2','#9e8d9f','#798eaf'],core:['#555776','#484b6b','#b9b0d1','#7b7394','#666da2']};
const rect=(map,x,y,w,h,t)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i>0&&j>0&&i<39&&j<27)map.tiles[j][i]=t};
const line=(map,a,b,w=2)=>{let [x,y]=a;const [tx,ty]=b;while(x!==tx||y!==ty){rect(map,x,y,w,w,'path');if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y)}rect(map,x,y,w,w,'path')};
function build(id,name,subtitle,spawn,roads,pois){
 const map={id,name,subtitle,spawn,colors:themes[id],pois,tiles:Array.from({length:28},(_,y)=>Array.from({length:40},(_,x)=>x===0||y===0||x===39||y===27?'edge':'ground'))};
 // Individual biomes, waterways and walkable bridges.
 if(id==='town'){rect(map,1,19,38,8,'water');rect(map,2,2,7,6,'tree');rect(map,27,2,10,6,'tree');rect(map,25,20,8,5,'dock')}
 if(id==='forest'){rect(map,2,2,11,6,'tree');rect(map,23,3,14,6,'tree');rect(map,27,18,10,7,'tree');rect(map,18,1,3,26,'water');rect(map,3,17,10,8,'grass');rect(map,24,10,12,6,'grass');rect(map,5,10,8,4,'flowers')}
 if(id==='bay'){rect(map,1,19,38,8,'water');rect(map,1,1,8,18,'water');rect(map,27,3,9,6,'water');rect(map,23,10,13,5,'grass');rect(map,11,3,9,4,'flowers');rect(map,23,20,13,4,'dock')}
 if(id==='volcano'){rect(map,18,1,3,26,'water');rect(map,24,3,12,5,'rocks');rect(map,2,2,8,7,'rocks');rect(map,25,11,12,5,'grass');rect(map,3,18,11,7,'grass');rect(map,27,21,9,4,'rocks')}
 if(id==='sky'){rect(map,1,1,8,8,'water');rect(map,18,1,3,26,'water');rect(map,27,1,11,7,'rocks');rect(map,2,19,11,6,'grass');rect(map,24,10,13,5,'grass');rect(map,4,10,9,6,'flowers')}
 if(id==='core'){rect(map,1,1,38,26,'water');rect(map,2,20,12,5,'ground');rect(map,3,10,10,6,'ground');rect(map,24,11,12,6,'ground');rect(map,14,2,13,7,'ground');rect(map,11,17,18,5,'ground')}
 const waterTiles=new Set();map.tiles.forEach((row,y)=>row.forEach((t,x)=>{if(t==='water')waterTiles.add(`${x},${y}`)}));
 for(const [a,b] of roads)line(map,a,b,2);
 // Roads and POI clearings always take precedence over decorations.
 for(const p of pois){rect(map,p.x-1,p.y-1,3,3,'path');if(p.kind==='house')rect(map,p.x-2,p.y-4,5,3,'house')}
 rect(map,spawn.x,spawn.y,2,2,'path');map.bridges=[...waterTiles].filter(k=>{const[x,y]=k.split(',').map(Number);return map.tiles[y][x]==='path'});return map;
}
const p=(id,name,x,y,kind,action,args={},text='')=>({id,name,x,y,kind,action,args,text});
export const WORLD={
 town:build('town','岸灯镇','花园小径 · 修灯工坊 · 海风码头',{x:18,y:16},[
  [[4,15],[34,15]],[[18,5],[18,22]],[[6,8],[31,8]],[[6,8],[6,15]],[[31,8],[31,15]],[[18,22],[31,22]],[[10,15],[10,18]]
 ],[p('alan','阿岚 · 主线',18,8,'npc','story'),p('rest','精灵休憩所',6,8,'house','heal'),p('shop','海风商店',31,8,'house','shop'),p('camp','伙伴营地',10,18,'camp','camp'),p('forest','萤叶林入口',4,15,'gate','travel',{region:'forest'}),p('harbor','群岛航船',31,22,'boat','atlas'),p('board','岸灯镇路牌',24,15,'sign','sign',{},'沿路向西进入萤叶林；北边是阿岚，海边码头可乘船前往已开放的岛。')]),
 forest:build('forest','萤叶林','铃兰步道 · 萤光溪 · 青禾灯塔',{x:4,y:15},[
  [[3,15],[34,15]],[[10,8],[10,22]],[[10,8],[30,8]],[[30,8],[30,22]],[[10,22],[30,22]],[[5,20],[10,20]],[[16,15],[16,5]]
 ],[p('return','返回岸灯镇',3,15,'gate','travel',{region:'town'}),p('qinghe','青禾 · 主线',10,8,'npc','story'),p('beacon','森芽灯塔',30,8,'tower','guardian'),p('herbs','溪边药园',10,22,'gather','forage'),p('secret','藤蔓后的药园',16,5,'secret','secret'),p('trainer','林间旅人',30,22,'npc','trainer'),p('wild','铃兰栖息地',34,15,'grass','explore'),p('bay','前往琉璃湾',30,15,'gate','travel',{region:'bay'})]),
 bay:build('bay','琉璃湾','贝壳浅滩 · 珊瑚石桥 · 听潮港',{x:12,y:15},[
  [[11,15],[35,15]],[[15,8],[15,22]],[[15,8],[30,8]],[[30,8],[30,22]],[[15,22],[34,22]],[[23,8],[23,4]],[[12,15],[12,18]]
 ],[p('return','返回岸灯镇',12,15,'boat','travel',{region:'town'}),p('chengyin','澄音 · 主线',15,8,'npc','story'),p('beacon','潮汐灯塔',30,8,'tower','guardian'),p('herbs','浅滩拾贝处',15,22,'gather','forage'),p('secret','退潮贝壳洞',23,4,'secret','secret'),p('trainer','码头旅人',30,22,'npc','trainer'),p('wild','珊瑚栖息地',35,15,'grass','explore'),p('next','前往熔光岭',24,22,'gate','travel',{region:'volcano'})]),
 volcano:build('volcano','熔光岭','铜铃矿道 · 余烬工坊 · 玻璃火山',{x:4,y:15},[
  [[3,15],[35,15]],[[12,7],[12,22]],[[12,7],[30,7]],[[30,7],[30,23]],[[12,22],[30,22]],[[6,22],[12,22]],[[24,7],[24,3]]
 ],[p('return','返回岸灯镇',3,15,'gate','travel',{region:'town'}),p('yanzhou','岩舟 · 主线',12,7,'npc','story'),p('beacon','余焰灯塔',30,7,'tower','guardian'),p('herbs','旧矿车',12,22,'gather','forage'),p('secret','旧营地',24,3,'secret','secret'),p('trainer','工坊旅人',30,22,'npc','trainer'),p('wild','灰烬栖息地',35,15,'grass','explore'),p('next','前往观星原',6,22,'gate','travel',{region:'sky'})]),
 sky:build('sky','观星原','雪灯花田 · 星桥 · 风语观测台',{x:4,y:16},[
  [[3,16],[35,16]],[[12,7],[12,23]],[[12,7],[30,7]],[[30,7],[30,23]],[[12,23],[30,23]],[[22,7],[22,3]],[[5,21],[12,21]],[[35,16],[35,20]]
 ],[p('return','返回岸灯镇',3,16,'gate','travel',{region:'town'}),p('xingyao','星遥 · 主线',12,7,'npc','story'),p('beacon','星穹灯塔',30,7,'tower','guardian'),p('herbs','星砂花田',12,23,'gather','forage'),p('secret','悬桥星图匣',22,3,'secret','secret'),p('trainer','观星旅人',30,23,'npc','trainer'),p('wild','雪灯栖息地',35,16,'grass','explore'),p('deer','回应星穹鹿',5,21,'star','summon'),p('core','星潮之门',35,20,'gate','travel',{region:'core'})]),
 core:build('core','星潮核心','回声环廊 · 三相回路 · 记忆之心',{x:6,y:22},[
  [[6,22],[20,22]],[[20,5],[20,22]],[[7,13],[31,13]],[[7,13],[7,22]],[[31,13],[31,20]],[[20,20],[31,20]],[[16,5],[24,5]]
 ],[p('return','返回观星原',6,22,'gate','travel',{region:'sky'}),p('su','溯 · 主线',20,13,'npc','story'),p('trial','三相核心',20,5,'tower','corebattle'),p('rest','回声泉',7,13,'camp','core-rest'),p('dragon','暮星龙的回声',31,13,'star','dragon'),p('memory','记忆石碑',31,20,'sign','sign',{},'雨水滋养森林，炉火照亮归途，微风让星光继续流动。核心的三位对手会改变战场天气。')])
};
const details={
 town:[['well',14,11],['bench',21,11],['stall',27,12],['stall',31,12],['lamp',16,7],['lamp',20,7],['pot',4,8],['pot',8,8],['pot',29,8],['pot',33,8],['fence',10,10],['fence',11,10],['fence',12,10],['flowers',10,11],['flowers',11,11],['flowers',12,11],['bench',23,17],['lamp',20,19],['boat',26,24]],
 forest:[['tree',14,10],['tree',22,19],['log',7,12],['mushroom',7,13],['mushroom',8,12],['well',14,20],['bench',7,8],['lamp',28,8],['lamp',32,8],['flowers',14,6],['flowers',14,7],['crystal',23,5],['fence',7,23],['fence',8,23],['fence',9,23],['log',33,18]],
 bay:[['coral',10,5],['coral',10,7],['coral',25,17],['coral',27,17],['shell',17,18],['shell',20,18],['stall',20,9],['bench',18,6],['lamp',28,8],['lamp',32,8],['boat',34,24],['boat',29,24],['pot',16,6],['shell',24,24],['shell',26,24]],
 volcano:[['cart',8,11],['rail',8,12],['rail',8,13],['rail',8,14],['crystal',10,4],['crystal',14,5],['crystal',27,19],['crystal',29,19],['forge',13,9],['bench',9,7],['lamp',28,7],['lamp',32,7],['cart',14,23],['ruin',24,19],['ruin',25,19],['crystal',34,9]],
 sky:[['telescope',15,5],['telescope',27,7],['crystal',25,4],['crystal',24,18],['ruin',8,9],['ruin',9,9],['ruin',10,9],['well',14,20],['bench',27,23],['lamp',28,7],['lamp',32,7],['flowers',14,11],['flowers',15,11],['flowers',14,12],['crystal',33,22]],
 core:[['crystal',17,4],['crystal',24,4],['ruin',16,7],['ruin',25,7],['lamp',18,11],['lamp',23,11],['crystal',26,15],['crystal',34,15],['well',8,11],['flowers',11,23],['crystal',14,19],['crystal',27,19]]
};
for(const [id,map] of Object.entries(WORLD)){
 map.decor=[];
 const add=(kind,x,y)=>{if(!map.tiles[y]?.[x]||['path','house','edge','tree','rocks'].includes(map.tiles[y][x]))return;map.decor.push({kind,x,y});if(!['flowers','shell','mushroom','rail','boat'].includes(kind))map.tiles[y][x]='prop'};
 for(const [kind,x,y]of details[id])add(kind,x,y);
 // Small meadow details stay passable; larger scenery never obstructs authored roads.
 for(let y=3;y<26;y+=3)for(let x=3;x<38;x+=3)if(map.tiles[y][x]==='ground'&&(x*7+y*11)%5<3)add(id==='volcano'?'crystal':id==='core'?'flowers':id==='bay'?'shell':(x+y)%2?'flowers':'mushroom',x,y);
}
export const walkable=(region,x,y)=>!!WORLD[region]&&['ground','path','grass','flowers','dock'].includes(WORLD[region].tiles[y]?.[x]);
export const nearestPoi=(region,pos)=>WORLD[region]?.pois.filter(p=>Math.abs(p.x-pos.x)+Math.abs(p.y-pos.y)<=2).sort((a,b)=>(Math.abs(a.x-pos.x)+Math.abs(a.y-pos.y))-(Math.abs(b.x-pos.x)+Math.abs(b.y-pos.y)))[0]||null;
export const spawnAt=region=>({...WORLD[region].spawn,dir:'down',walked:0,grass:0});
