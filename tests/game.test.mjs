import test from 'node:test';
import {currentStory,storyStatus,STORY} from '../dist/game.mjs';
import assert from 'node:assert/strict';
import {newGame,act,clone,restoreSave,createCreature,heal,stats,team,player,enemy,moves,estimatedDamage,captureChance,effectiveness,canEvolve,QUESTS,questProgress,SPECIES} from '../dist/game.mjs';
const start=(seed=123,species=0)=>{const s=newGame(seed);assert.equal(act(s,{type:'starter',species,name:'测试旅人'}),null);return s};
function move(s,type,rest={}){const error=act(s,{type,...rest});assert.equal(error,null,`${type}: ${error}`)}
function wild(s){move(s,'travel',{region:'forest'});for(let i=0;i<40&&!s.battle;i++){move(s,'explore');if(s.event)move(s,'event',{index:0})}assert(s.battle)}
function winBattle(s){
 let turns=0;
 while(s.battle&&!s.battle.terminal&&turns++<200){
  const b=s.battle,p=player(s),e=enemy(s);
  if(b.forceSwitch){const next=team(s).filter(m=>m.hp>0).sort((a,b)=>Math.max(...moves(b).map(id=>estimatedDamage(b,e,id,b.weather)))-Math.max(...moves(a).map(id=>estimatedDamage(a,e,id,b.weather))))[0];move(s,'switch',{uid:next.uid});continue}
  const options=moves(p).map(id=>({id,d:estimatedDamage(p,e,id,b.weather)})).sort((a,b)=>b.d-a.d);
  if(p.hp<stats(p).hp*.35&&s.bag.potion>0)move(s,'item',{item:'potion',uid:p.uid});
  else move(s,'move',{move:options[0].id});
 }
 assert(turns<200,'battle must finish');return s.battle.terminal;
}
test('type relationships, weather and PP fallback have real effects',()=>{
 const s=start();const a=s.roster[0],d=createCreature(s,2,4);
 assert.equal(effectiveness('leaf','tide'),2);assert.equal(effectiveness('tide','leaf'),.5);
 assert(estimatedDamage(d,a,'bubble','rain')>estimatedDamage(d,a,'bubble','sun'));
 for(const k of Object.keys(a.pp))a.pp[k]=0;assert.deepEqual(moves(a),['struggle']);
});
test('capture chance rewards low HP, status and better capsule',()=>{
 const s=start();wild(s);const e=enemy(s),full=captureChance(s);e.hp=1;assert(captureChance(s)>full);const low=captureChance(s);e.status='sleep';assert(captureChance(s)>low);assert(captureChance(s,'focusCapsule')>=captureChance(s));
});
test('capture, party limits and terminal battle survive exact save restoration',()=>{
 const s=start();move(s,'test',{enabled:true});wild(s);move(s,'capture',{item:'capsule'});assert.equal(s.stats.captures,1);assert.equal(s.roster.length,2);assert.equal(s.battle.terminal,'catch');
 const saved=restoreSave(clone(s));assert.deepEqual(saved.team,s.team);assert.equal(saved.roster[1].species,s.roster[1].species);move(saved,'ack');
 for(let i=0;i<6;i++){wild(saved);move(saved,'capture',{item:'capsule'});move(saved,'ack')}
 assert.equal(saved.team.length,6);assert.equal(saved.roster.length,8);
});
test('items cannot be wasted on healthy partners; crafting and claims cannot double spend',()=>{
 const s=start(),m=s.roster[0],n=s.bag.potion;assert.match(act(s,{type:'item',uid:m.uid,item:'potion'}),/只能/);assert.equal(s.bag.potion,n);
 s.bag.herb=0;s.bag.crystal=0;const old=clone(s.bag);assert.match(act(s,{type:'craft',item:'capsule'}),/不足/);assert.deepEqual(s.bag,old);
 s.stats.captures=1;move(s,'claim',{id:'first-friend'});const coins=s.coins;assert(act(s,{type:'claim',id:'first-friend'}));assert.equal(s.coins,coins);
});
test('evolution, specialization and hidden route require their real prerequisites',()=>{
 const s=start(),m=s.roster[0];assert(!canEvolve(m));m.level=7;assert(canEvolve(m));const oldHp=stats(m).hp;move(s,'evolve',{uid:m.uid});assert.equal(m.species,4);assert(stats(m).hp>oldHp);move(s,'ack');
 const before=stats(m);move(s,'train',{uid:m.uid,path:'heart'});assert(stats(m).hp>before.hp);
 move(s,'travel',{region:'forest'});move(s,'secret');const coins=s.coins;assert(act(s,{type:'secret'}));assert.equal(s.coins,coins);assert(act(s,{type:'travel',region:'bay'}));
});
test('mid-battle RNG, PP, HP and opponent intent resume deterministically',()=>{
 const s=start();wild(s);move(s,'move',{move:moves(player(s))[0]});const restored=restoreSave(clone(s));assert.equal(restored.seed,s.seed);
 if(!s.battle.terminal){const action={type:'move',move:moves(player(s))[0]};assert.equal(act(s,action),act(restored,action));assert.deepEqual(restored,s)}
});
test('fainted active partner must be replaced before another action',()=>{
 const s=start();const buddy=createCreature(s,1,5);s.roster.push(buddy);s.team.push(buddy.uid);wild(s);player(s).hp=1;s.battle.opponents=[createCreature(s,2,25)];s.battle.intent='tap';move(s,'move',{move:'tap'});assert(s.battle.forceSwitch);assert(act(s,{type:'capture',item:'capsule'}));const turn=s.battle.turn;move(s,'switch',{uid:buddy.uid});assert.equal(s.battle.turn,turn);
});
test('malformed imports never become valid journeys',()=>{
 assert.throws(()=>restoreSave({version:99}));const s=start();s.team=[999];assert.throws(()=>restoreSave(s));const s2=start();s2.roster[0].species=999;assert.throws(()=>restoreSave(s2));
});
for(const starter of [0,1,2])test(`normal campaign is winnable with starter ${SPECIES[starter].name}`,()=>{
 const s=start(821+starter,starter);let battles=0;
 for(const region of ['forest','bay','volcano','sky']){
  move(s,'travel',{region});for(let i=0;i<6;i++)move(s,'forage');
  let attempts=0;
  while(!s.badges.includes(region)&&attempts++<45){
   move(s,'travel',{region:'town'});move(s,'heal');
   while(s.coins>=25&&s.bag.potion<6)move(s,'buy',{item:'potion'});
   for(const m of team(s)){if(canEvolve(m)){move(s,'evolve',{uid:m.uid});move(s,'ack')}if(m.level>=5)move(s,'train',{uid:m.uid,path:'power'})}
   move(s,'travel',{region});
   if(attempts%4===0)move(s,'guardian');else {move(s,'explore');if(s.event)move(s,'event',{index:0})}
   if(!s.battle)continue;
   if(s.battle.kind==='wild'&&s.roster.length<6&&s.bag.capsule>0&&!s.caught.includes(enemy(s).species)){
    for(let j=0;j<4&&s.bag.capsule>0&&s.battle&&!s.battle.terminal&&!s.battle.forceSwitch;j++)move(s,'capture',{item:'capsule'});
   }
   if(!s.battle.terminal)winBattle(s);move(s,'ack');battles++;
   for(const q of QUESTS)if(!s.claimed.includes(q.id)&&questProgress(s,q)>=q.goal)move(s,'claim',{id:q.id});
  }
  assert(s.badges.includes(region),`${region} could not be cleared after ${attempts} attempts; levels ${team(s).map(m=>m.level)}`);
 }
 assert.equal(s.badges.length,4);assert.equal(s.test,false);assert(battles<180);move(s,'travel',{region:'sky'});move(s,'summon');assert.equal(enemy(s).species,15);winBattle(s);move(s,'ack');
 while(currentStory(s)){
  const node=currentStory(s);if(s.region!==node.place)move(s,'travel',{region:node.place});
  if(node.condition.bond)while(!team(s).some(m=>m.bond>=node.condition.bond)){if(s.bag.fruit)move(s,'item',{item:'fruit',uid:s.team[0]});else move(s,'forage')}
  if(node.condition.finalWon){
   let attempts=0;
   while(!s.story.finalWon&&attempts++<6){
    move(s,'travel',{region:'town'});move(s,'heal');while(s.coins>=25&&s.bag.potion<12)move(s,'buy',{item:'potion'});
    if(attempts>1){move(s,'travel',{region:'sky'});move(s,'trainer');winBattle(s);move(s,'ack');move(s,'travel',{region:'town'});move(s,'heal')}
    move(s,'travel',{region:'core'});move(s,'corebattle');winBattle(s);move(s,'ack');
   }
   assert(s.story.finalWon,`core challenge could not be cleared by ${SPECIES[starter].name}`);move(s,'travel',{region:'core'});
  }
  assert(storyStatus(s).ready,storyStatus(s).reason);move(s,'story',{id:node.id,choice:starter===1?1:0});if(s.report)move(s,'ack');
 }
 assert.equal(s.story.index,STORY.length);assert.equal(s.story.ending,starter===1?'lantern':'dawn');assert.equal(s.test,false);assert.deepEqual(restoreSave(clone(s)),s);
 move(s,'travel',{region:'core'});move(s,'dragon');assert.equal(enemy(s).species,23);
 console.log(`${SPECIES[starter].name}: six chapters and ${s.story.ending} ending completed under normal rules`);
 console.log(`${SPECIES[starter].name}: ${battles} battles to four beacons; party levels ${team(s).map(m=>m.level).join(', ')}`);
});
