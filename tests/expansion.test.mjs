import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,restoreSave,clone,createCreature,heal,stats,team,player,enemy,moves,learned,estimatedDamage,captureChance,currentStory,storyStatus,STORY,SPECIES,MOVES,ITEMS,EGG_GROUPS} from '../dist/game.mjs';
import {WORLD,walkable,nearestPoi} from '../dist/world.mjs';
const start=()=>{const s=newGame(445);assert.equal(act(s,{type:'starter',species:0}),null);return s};
const go=(s,type,args={})=>assert.equal(act(s,{type,...args}),null,type);
function encounter(s){go(s,'travel',{region:'forest'});for(let i=0;i<100&&!s.battle;i++){go(s,'explore');if(s.event)go(s,'event',{index:0})}assert(s.battle)}
test('all six maps connect spawn to every landmark and habitats',()=>{
 assert.equal(Object.keys(WORLD).length,6);
 for(const [id,map]of Object.entries(WORLD)){
  const seen=new Set([`${map.spawn.x},${map.spawn.y}`]),queue=[map.spawn];
  for(let i=0;i<queue.length;i++){const p=queue[i];for(const [dx,dy]of [[0,1],[0,-1],[1,0],[-1,0]]){const x=p.x+dx,y=p.y+dy,k=`${x},${y}`;if(!seen.has(k)&&walkable(id,x,y)){seen.add(k);queue.push({x,y})}}}
  for(const p of map.pois)assert(seen.has(`${p.x},${p.y}`),`${id}/${p.id} is unreachable`);
  if(!['town','core'].includes(id))assert([...seen].some(k=>{const[x,y]=k.split(',').map(Number);return map.tiles[y][x]==='grass'}),`${id} needs reachable grass`);
  assert(!walkable(id,0,0));assert(!walkable(id,-1,5));
 }
});
test('movement respects collision, saves position and advances exploration every eight valid steps',()=>{
 const s=start();go(s,'travel',{region:'forest'});const origin=s.stats.steps;
 for(let i=0;i<8;i++)go(s,'walk',{dir:'right'});assert.equal(s.stats.steps,origin+1);assert.equal(s.stats.walked,8);
 assert.deepEqual(restoreSave(clone(s)).positions,s.positions);
 s.positions.forest={x:17,y:18,dir:'down',walked:8,grass:0};assert(!walkable('forest',18,18));go(s,'walk',{dir:'right'});assert.equal(s.positions.forest.x,17);assert.equal(s.stats.walked,8);
 assert.equal(nearestPoi('forest',{x:10,y:9}).id,'qinghe');
});
test('walking four consecutive grass tiles creates a genuine encounter or field event',()=>{
 const s=start();go(s,'travel',{region:'forest'});s.positions.forest={x:24,y:11,dir:'right',walked:0,grass:0};for(let i=0;i<4;i++)go(s,'walk',{dir:'right'});
 assert.equal(s.stats.steps,1);assert(s.battle||s.event||s.bag.capsule===11);
});
test('version one journeys migrate without losing party, PP, badges or items',()=>{
 const s=start();s.roster[0].level=16;heal(s.roster[0]);s.roster[0].pp.leaf=2;s.badges=['forest','bay'];s.region='bay';s.version=1;
 for(const k of ['story','positions','eggs','nextEgg'])delete s[k];for(const m of s.roster)for(const k of ['loadout','gear','mood','lastCare','bondStories','reflect'])delete m[k];
 delete s.roster[0].stages.speed;delete s.roster[0].pp.venomkiss;delete s.roster[0].pp.mossheart;
 const r=restoreSave(s);assert.equal(r.version,2);assert.equal(r.roster[0].pp.leaf,2);assert.equal(r.roster[0].pp.mossheart,MOVES.mossheart.pp);assert.deepEqual(r.badges,s.badges);assert.equal(r.bag.capsule,s.bag.capsule);assert.equal(r.bag.mossCharm,0);assert.equal(r.story.index,0);assert.deepEqual(r.roster[0].loadout,['tap','leaf','pollen','blossom']);
});
test('four-slot loadouts cannot duplicate, invent, replenish PP or change in battle',()=>{
 const s=start(),m=s.roster[0];m.level=16;heal(m);m.pp.leaf=2;
 go(s,'loadout',{uid:m.uid,slot:0,move:'mossheart'});assert.equal(m.pp.leaf,2);assert(!moves(m).includes('tap'));
 assert(act(s,{type:'loadout',uid:m.uid,slot:1,move:'mossheart'}));assert(act(s,{type:'loadout',uid:m.uid,slot:4,move:'leaf'}));assert(act(s,{type:'loadout',uid:m.uid,slot:0,move:'astral'}));
 encounter(s);assert(act(s,{type:'loadout',uid:m.uid,slot:0,move:'tap'}));
});
test('equipment has real effects, returns previous item and cannot duplicate unavailable stock',()=>{
 const s=start(),m=s.roster[0],d=createCreature(s,2,4);const damage=estimatedDamage(m,d,'leaf'),speed=stats(m).speed;
 s.bag.emberPin=1;s.bag.swiftFeather=1;go(s,'equip',{uid:m.uid,item:'emberPin'});assert(estimatedDamage(m,d,'leaf')>damage);assert.equal(s.bag.emberPin,0);
 go(s,'equip',{uid:m.uid,item:'swiftFeather'});assert(stats(m).speed>speed);assert.equal(s.bag.emberPin,1);assert.equal(s.bag.swiftFeather,0);
 assert(act(s,{type:'equip',uid:m.uid,item:'focusLens'}));assert.equal(m.gear,'swiftFeather');go(s,'equip',{uid:m.uid,item:''});assert.equal(s.bag.swiftFeather,1);
});
test('care has a field-step cooldown; favorite food, bond memories and crafting have one-time effects',()=>{
 const s=start(),m=s.roster[0];go(s,'care',{uid:m.uid});assert.equal(m.bond,16);assert(act(s,{type:'care',uid:m.uid}));
 s.bag.herb=3;s.bag.fruit=1;go(s,'craft',{item:'leafCake'});go(s,'item',{item:'leafCake',uid:m.uid});assert.equal(m.bond,28);assert.equal(s.bag.leafCake,0);
 assert(act(s,{type:'item',item:'leafCake',uid:m.uid}));s.stats.steps+=3;go(s,'care',{uid:m.uid});assert.equal(m.bond,34);
 const xp=m.xp;go(s,'bond-story',{uid:m.uid});assert(m.xp>xp);go(s,'ack');assert(act(s,{type:'bond-story',uid:m.uid}));assert.deepEqual(m.bondStories,[30]);
});
test('nursery is limited, paid once and produces a saved level-four companion after twelve explorations',()=>{
 const s=start();const coins=s.coins;go(s,'egg',{group:'woodland'});assert.equal(s.coins,coins-160);assert.equal(s.bag.crystal,0);assert.equal(s.eggs.length,1);
 const id=s.eggs[0].id;assert(act(s,{type:'hatch',id}));assert(act(s,{type:'egg',group:'coast'}));
 go(s,'travel',{region:'forest'});for(let i=0;i<12;i++)go(s,'forage');const r=restoreSave(clone(s));go(r,'hatch',{id});assert.equal(r.eggs.length,0);assert.equal(r.roster.length,2);assert.equal(r.roster[1].level,4);assert.equal(r.roster[1].bond,15);assert.equal(r.stats.hatched,1);assert(act(r,{type:'hatch',id}));
});
test('story requires location and real goals; stale scene clicks never give a second reward',()=>{
 const s=start(),n=currentStory(s);assert(storyStatus(s).ready);go(s,'story',{id:n.id,choice:0});const bag=clone(s.bag);assert(act(s,{type:'story',id:n.id,choice:0}));assert.deepEqual(s.bag,bag);assert.equal(s.story.index,1);
 assert(!storyStatus(s).ready);go(s,'travel',{region:'forest'});assert(!storyStatus(s).ready);for(let i=0;i<3;i++)go(s,'forage');assert(storyStatus(s).ready);go(s,'story',{id:'seed',choice:1});assert(!storyStatus(s).ready);assert.deepEqual(restoreSave(clone(s)),s);
});
test('weather, debuff, pierce and status-combo moves use distinct rules',()=>{
 const s=start();encounter(s);let m=player(s),e=enemy(s);m.level=16;m.species=6;heal(m);m.loadout=['raincall','coralstrike'];s.battle.intent='guard';go(s,'move',{move:'raincall'});assert.equal(s.battle.weather,'rain');
 e.stages.defense=2;const piercing=estimatedDamage(m,e,'coralstrike');e.stages.defense=0;assert.equal(estimatedDamage(m,e,'coralstrike'),piercing);
 e.status=null;const normal=estimatedDamage(m,e,'venomkiss');e.status='slow';assert(estimatedDamage(m,e,'venomkiss')>normal);
 m.species=23;heal(m);m.loadout=['moonpull'];s.battle.intent='guard';e.hp=stats(e).hp;go(s,'move',{move:'moonpull'});assert.equal(e.stages.attack,-1);
});
test('resonance needs both friendship and meter, spends a turn and cannot repeat',()=>{
 const s=start();encounter(s);const m=player(s);m.level=20;heal(m);m.bond=30;m.hp=Math.floor(stats(m).hp*.5);s.battle.intent='guard';assert(act(s,{type:'resonate'}));s.battle.resonance=100;const turn=s.battle.turn,hp=m.hp;
 go(s,'resonate');assert.equal(s.battle.turn,turn+1);assert(m.hp>hp);assert.equal(m.stages.attack,1);assert.equal(s.stats.resonances,1);s.battle.resonance=100;assert(act(s,{type:'resonate'}));assert.equal(restoreSave(clone(s)).battle.resonated,true);
});
test('all advertised content has valid data, learned skills and accessible creature sources',()=>{
 assert.equal(SPECIES.length,24);assert.equal(Object.keys(MOVES).length,48);
 const taught=new Set();for(const sp of SPECIES){assert.equal(sp.learn.length,6);for(const [,move] of sp.learn){assert(MOVES[move]);taught.add(move)}if(sp.evolves!==undefined)assert(SPECIES[sp.evolves])}
 // Struggle is a fallback; all other announced moves must actually be learnable.
 for(const id of Object.keys(MOVES))assert(id==='struggle'||taught.has(id),`Unlearnable skill ${id}`);
 for(const group of Object.values(EGG_GROUPS))assert(group.pool.every(id=>SPECIES[id]));
 for(const node of STORY)for(const id of Object.keys(node.reward))assert(['egg','coins'].includes(id)||ITEMS[id]);
});
