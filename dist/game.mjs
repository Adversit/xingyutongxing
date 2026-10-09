import {TYPES,MOVES,SPECIES,NATURES,TRAINING,REGIONS,WEATHER,ITEMS,RECIPES,QUESTS,FIELD_EVENTS} from './data.mjs';
import {CHAPTERS,STORY,ENDINGS,EQUIPMENT,TREATS,EGG_GROUPS,bondTier} from './content.mjs';
import {WORLD,walkable,spawnAt} from './world.mjs';
export {CHAPTERS,STORY,ENDINGS,EQUIPMENT,TREATS,EGG_GROUPS,bondTier};
export {TYPES,MOVES,SPECIES,NATURES,TRAINING,REGIONS,WEATHER,ITEMS,RECIPES,QUESTS,FIELD_EVENTS};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const clone=s=>JSON.parse(JSON.stringify(s));
export function random(s){let n=s.seed|0;n^=n<<13;n^=n>>>17;n^=n<<5;s.seed=n>>>0;return s.seed/4294967296}
const pick=(s,list)=>list[Math.floor(random(s)*list.length)];
const unique=(list,v)=>{if(!list.includes(v))list.push(v)};
export const title=m=>m.nickname||SPECIES[m.species].name;
export const xpNeeded=m=>18+m.level*9;
export function stats(m){
 const d=SPECIES[m.species],b=d.base,l=m.level;
 const v={hp:b[0]+l*6,attack:b[1]+l*3,defense:b[2]+l*2.6,spirit:b[3]+l*3,speed:b[4]+l*2.4};
 const n=NATURES[m.nature];if(n)v[n.stat]*=1.08;
 if(m.training==='power'){v.attack*=1.08;v.spirit*=1.08}if(m.training==='heart')v.hp*=1.12;if(m.training==='swift')v.speed*=1.15;
 if(d.trait==='轻灵')v.speed*=1.1;if(m.gear==='swiftFeather')v.speed*=1.08;
 return Object.fromEntries(Object.entries(v).map(([k,n])=>[k,Math.round(n)]));
}
export const learned=m=>SPECIES[m.species].learn.filter(([l])=>l<=m.level).map(([,id])=>id);
export const moves=m=>{const ready=(m.loadout||learned(m).slice(0,4)).filter(id=>(m.pp[id]??0)>0);return ready.some(id=>MOVES[id].power)?ready:[...ready,'struggle']};
export function createCreature(s,species,level=3){
 const m={uid:s.nextId++,species,level,xp:0,hp:1,pp:{},nature:pick(s,Object.keys(NATURES)),bond:0,mood:70,lastCare:-3,bondStories:[],gear:null,loadout:[],training:null,nickname:'',status:null,statusTurns:0,stages:{attack:0,defense:0,speed:0},shield:0,reflect:false,hit:false};
 m.hp=stats(m).hp;for(const id of learned(m))m.pp[id]=MOVES[id].pp;m.loadout=learned(m).slice(0,4);return m;
}
export function newGame(seed=Date.now()){return {version:2,story:{index:0,done:[],choices:{},ending:null,finalWon:false},eggs:[],nextEgg:1,positions:Object.fromEntries(Object.keys(WORLD).map(id=>[id,spawnAt(id)])),seed:(seed>>>0)||741395,nextId:1,name:'旅行者',started:false,roster:[],team:[],seen:[],caught:[],bag:{...Object.fromEntries(Object.keys(ITEMS).map(id=>[id,0])),capsule:10,focusCapsule:2,potion:8,revive:2,antidote:3,candy:2,herb:3,fruit:2,crystal:3},coins:250,badges:[],region:'town',steps:{forest:0,bay:0,volcano:0,sky:0},secrets:[],claimed:[],weather:'clear',log:[],battle:null,event:null,report:null,stats:{wins:0,captures:0,steps:0,crafted:0,effective:0,walked:0,hatched:0,resonances:0},test:false};}
export const team=s=>s.team.map(id=>s.roster.find(m=>m.uid===id)).filter(Boolean);
export const player=s=>s.roster.find(m=>m.uid===s.battle?.active);
export const enemy=s=>s.battle?.opponents[s.battle.enemyIndex];
export const isNight=s=>Math.floor(s.stats.steps/6)%2===1;
export const available=(s,region)=>region==='core'?s.story.done.includes('star-chart'):!!REGIONS[region]&&s.badges.length>=REGIONS[region].gate;
export function addLog(s,text){s.log.unshift(text);s.log=s.log.slice(0,50)}
function battleLog(s,text){s.battle.log.push(text);s.battle.log=s.battle.log.slice(-35)}
function consume(s,key,n=1){if(s.test)return true;if((s.bag[key]??0)<n)return false;s.bag[key]-=n;return true}
function resetBattleStats(m){m.stages={attack:0,defense:0,speed:0};m.shield=0;m.reflect=false;m.hit=false}
export function heal(m){m.hp=stats(m).hp;m.status=null;m.statusTurns=0;resetBattleStats(m);for(const id of learned(m))m.pp[id]=MOVES[id].pp}
export function addXp(s,m,amount){
 if(m.level>=25)return;
 m.xp+=amount;const before=m.level,old=stats(m).hp;
 while(m.level<25&&m.xp>=xpNeeded(m)){m.xp-=xpNeeded(m);m.level++}
 if(m.level===25)m.xp=0;
 if(m.level>before){m.hp=clamp(m.hp+stats(m).hp-old,0,stats(m).hp);for(const id of learned(m))if(!(id in m.pp)){m.pp[id]=MOVES[id].pp;if(m.loadout.length<4)m.loadout.push(id)}addLog(s,`${title(m)}升到 ${m.level} 级${canEvolve(m)?'，可以进化了':''}。`)}
}
export const canEvolve=m=>SPECIES[m.species].evolves!==undefined&&m.level>=SPECIES[m.species].evolveLevel;
export function effectiveness(type,target){const t=TYPES[type];return t.strong.includes(target)?2:t.weak.includes(target)?.5:1}
export function weatherPower(type,weather){if(weather==='rain')return type==='tide'?1.2:type==='fire'?.8:1;if(weather==='sun')return type==='fire'?1.2:type==='tide'?.8:1;return weather==='wind'&&type==='wind'?1.2:1}
const stage=n=>n>=0?1+n*.35:1/(1-n*.35);
export function estimatedDamage(a,d,id,weather='clear'){
 const move=MOVES[id];if(!move?.power)return 0;
 const ast=stats(a),dst=stats(d),atk=move.category==='special'?ast.spirit:ast.attack;
 let n=(5+a.level*1.25)*(move.power/40)*(atk/dst.defense)*stage(a.stages?.attack||0)/stage(move.pierce?Math.min(0,d.stages?.defense||0):d.stages?.defense||0);
 n*=effectiveness(move.type,SPECIES[d.species].type)*weatherPower(move.type,weather)*(SPECIES[a.species].type===move.type?1.2:1);
 if(SPECIES[a.species].trait==='余烬'&&a.hp<ast.hp/3&&move.type==='fire')n*=1.25;
 if(a.gear==='emberPin')n*=1.08;if(move.bonusStatus&&d.status)n*=1.5;
 if(a.status==='burn'&&move.category==='physical')n*=.8;
 return Math.max(1,Math.round(n));
}
export function captureChance(s,kind='capsule'){
 const e=enemy(s);if(!e||s.battle.kind!=='wild')return 0;
 const base=SPECIES[e.species].catchRate,health=e.hp/stats(e).hp;
 return clamp((base+(1-health)*.4+(e.status ? .12 : 0)+Math.min(.12,(s.battle.turn-1)*.012))*(kind==='focusCapsule'?1.6:1)+(player(s)?.gear==='catchRibbon'?.08:0),.08,.95);
}
function chooseIntent(s){
 const b=s.battle,a=enemy(s),d=player(s);if(!a||!d)return 'tap';
 const choices=moves(a).map(id=>{const m=MOVES[id];let score=estimatedDamage(a,d,id,b.weather);if(m.effect==='heal')score=a.hp<stats(a).hp*.45?23:0;if(m.effect==='cleanse')score=a.status?23:a.hp<stats(a).hp*.45?14:0;if(m.effect==='guard')score=a.shield?0:8;if(m.effect==='focus')score=(a.stages.attack||0)<1?15:0;if(m.effect==='defense')score=(a.stages.defense||0)<1?12:0;if(m.effect==='sleep')score=d.status?0:18;if(m.effect==='weaken')score=d.stages.attack>-1?15:0;if(m.effect==='weather')score=b.weather===m.weather?0:12;if(m.effect==='mirror')score=a.shield?0:10;if(m.effect==='speed')score=a.stages.speed<1?10:0;if(m.effect==='chorus')score=a.hp<stats(a).hp*.5?20:0;return {id,score:score*(.75+random(s)*.5)}});
 choices.sort((a,b)=>b.score-a.score);return choices[0]?.id||'struggle';
}
function startBattle(s,kind,specs){
 const ready=team(s).find(m=>m.hp>0);if(!ready)return '伙伴需要休息，先回岸灯镇恢复吧。';
 for(const m of team(s))resetBattleStats(m);
 const opponents=specs.map(([id,level])=>createCreature(s,id,level));for(const m of opponents){m.loadout=learned(m).slice(-4);unique(s.seen,m.species)}
 const region=s.region;s.battle={kind,region,opponents,enemyIndex:0,active:ready.uid,turn:1,weather:kind==='core'?'rain':s.weather,resonance:0,resonated:false,log:[],forceSwitch:false,intent:null,terminal:null};
 battleLog(s,kind==='wild'?`野生的${title(opponents[0])}出现了。`:kind==='guardian'?`${REGIONS[region].guardian}发起挑战。`:kind==='core'?'溯打开了三相回路。雨之回路：森语鹿。':'路过的旅人想和你切磋。');
 s.battle.intent=chooseIntent(s);s.event=null;s.report=null;return null;
}
function finish(s,outcome,captured=null){
 const b=s.battle;
 if(b.terminal)return;
 b.terminal=outcome;
 let coins=0,xp=0;const lines=[];
 if(outcome==='win'||outcome==='catch'){
  s.stats.wins++;coins=b.opponents.reduce((n,m)=>n+12+m.level*4,0)*(b.kind==='guardian'?2:1);s.coins+=coins;
  xp=Math.round(b.opponents.reduce((n,m)=>n+18+m.level*8,0)*(outcome==='catch'?.8:1));
  for(const m of team(s)){if(m.uid!==captured?.uid){addXp(s,m,Math.round(xp*(m.uid===b.active?1:.7)));m.bond=clamp(m.bond+2,0,100);if(m.gear==='tideBell'&&m.hp>0)m.hp=clamp(m.hp+Math.round(stats(m).hp*.08),0,stats(m).hp);if(SPECIES[m.species].trait==='水润'&&m.hp>0)m.hp=clamp(m.hp+Math.round(stats(m).hp*.12),0,stats(m).hp)}}
  if(b.kind==='core'){s.story.finalWon=true;lines.push('三相回路恢复流动。暮星龙终于能再次听见外面的海风。回到溯身边，决定记忆灯芯的去处。')}
  s.bag.herb++;if(random(s)<.4)s.bag.crystal++;
  lines.push(`旅费 +${coins}，出战伙伴经验 +${xp}，其余同行伙伴获得 70% 经验。`);
  if(b.kind==='guardian'&&!s.badges.includes(b.region)){s.badges.push(b.region);s.bag.focusCapsule+=2;s.bag.candy+=2;s.bag.crystal+=3;lines.push(`获得${REGIONS[b.region].badge}，澄光共鸣石 ×2、成长星糖 ×2。`);if(s.badges.length===4)lines.push('四座灯塔重新亮起。星穹鹿正在观星原等待与你相遇。');else lines.push('新的群岛区域已经开放。')}
 }
 if(outcome==='lose'){for(const m of team(s))heal(m);s.region='town';lines.push('巡岛员将你和伙伴送回岸灯镇，队伍已全部恢复。准备好后可以再次出发。')}
 if(outcome==='run')lines.push('安全离开了这次相遇，没有失去物品。');
 if(captured)lines.unshift(`${title(captured)}加入${s.team.includes(captured.uid)?'同行队伍':'精灵驿站'}。`);
 for(const m of team(s))resetBattleStats(m);
 s.report={outcome,title:outcome==='catch'?'新的朋友，新的旅程':outcome==='win'?(b.kind==='guardian'?'灯塔，为你亮起':'默契又近了一点'):outcome==='lose'?'休息一下，再出发':'顺利离开',lines,creature:captured?.species??player(s)?.species??0};
 addLog(s,lines[0]||s.report.title);
}
function checkFaints(s){
 const b=s.battle;if(b.terminal)return;
 const e=enemy(s),p=player(s);
 if(e.hp<=0){battleLog(s,`${title(e)}暂时失去了战斗能力。`);if(b.enemyIndex+1>=b.opponents.length){finish(s,'win');return}else{b.enemyIndex++;if(b.kind==='core'){b.weather=['rain','sun','wind'][b.enemyIndex];battleLog(s,`回路切换为${WEATHER[b.weather].name}。`)}battleLog(s,`对手派出了${title(enemy(s))}。`)}}
 if(p.hp<=0){battleLog(s,`${title(p)}需要休息了。`);const ready=team(s).filter(m=>m.hp>0);if(!ready.length)finish(s,'lose');else b.forceSwitch=true}
}
function executeMove(s,a,d,id){
 const b=s.battle,move=MOVES[id];if(!move||a.hp<=0||d.hp<=0)return;
 if(a.status==='sleep'){a.statusTurns--;if(a.statusTurns<=0){a.status=null;battleLog(s,`${title(a)}醒来了。`)}else{battleLog(s,`${title(a)}还在安睡。`);return}}
 if(id!=='struggle'){if((a.pp[id]??0)<=0)return;a.pp[id]--}
 battleLog(s,`${title(a)}使用了「${move.name}」。`);
 const accuracy=id==='thunder'&&b.weather==='rain'?1:move.accuracy;
 if(random(s)>accuracy){battleLog(s,'招式擦身而过。');return}
 if(move.effect){
  if(move.effect==='weather'){b.weather=move.weather;battleLog(s,`战场转为${WEATHER[b.weather].name}。`)}
  if(move.effect==='weaken')d.stages.attack=clamp(d.stages.attack-1,-2,2);
  if(move.effect==='speed')a.stages.speed=clamp(a.stages.speed+1,-2,2);
  if(move.effect==='mirror'){a.shield=1;a.reflect=true}
  if(move.effect==='chorus'){const allies=a.uid===b.active?team(s):b.opponents;for(const m of allies)if(m.hp>0)m.hp=clamp(m.hp+Math.round(stats(m).hp*.2),0,stats(m).hp);battleLog(s,'合唱温暖了所有仍能战斗的伙伴。')}
  if(move.effect==='guard'){a.shield=1;battleLog(s,'下一次受击伤害降低 60%。')}
  if(move.effect==='focus')a.stages.attack=clamp(a.stages.attack+1,-2,2);
  if(move.effect==='defense')a.stages.defense=clamp(a.stages.defense+1,-2,2);
  if(move.effect==='heal')a.hp=clamp(a.hp+Math.round(stats(a).hp*.35),0,stats(a).hp);
  if(move.effect==='cleanse'){a.status=null;a.statusTurns=0;a.hp=clamp(a.hp+Math.round(stats(a).hp*.2),0,stats(a).hp)}
  if(move.effect==='sleep'){if(!d.status){d.status='sleep';d.statusTurns=2+Math.floor(random(s)*2);battleLog(s,`${title(d)}陷入了安眠。`)}else battleLog(s,'对手已有异常状态，花粉没有额外效果。')}
  return;
 }
 let damage=estimatedDamage(a,d,id,b.weather),crit=random(s)<.055+(a.gear==='focusLens'?.06:0)+(a.bond/2000)*(SPECIES[a.species].trait==='共鸣'?2:1);
 damage=Math.max(1,Math.round(damage*(.9+random(s)*.2)*(crit?1.5:1)));
 const reflect=d.shield&&d.reflect&&!move.pierce;if(d.shield&&!move.pierce){damage=Math.max(1,Math.round(damage*.4));d.shield=0;d.reflect=false}
 if(!d.hit&&SPECIES[d.species].trait==='硬壳')damage=Math.max(1,Math.round(damage*.75));d.hit=true;
 if(move.mercy&&b.kind==='wild'&&a.uid===b.active)damage=Math.min(damage,Math.max(0,d.hp-1));
 damage=Math.min(damage,d.hp);d.hp-=damage;if(reflect){const reflected=Math.max(1,Math.round(damage*.4));a.hp=Math.max(0,a.hp-reflected);battleLog(s,`晶霜镜反射了 ${reflected} 点伤害。`)}if(move.debuff)d.stages[move.debuff]=clamp(d.stages[move.debuff]-1,-2,2);if(move.cleanseSelf){a.status=null;a.statusTurns=0}
 const eff=effectiveness(move.type,SPECIES[d.species].type);if(a.uid===b.active&&eff>1)s.stats.effective++;
 battleLog(s,`${crit?'会心一击！':''}${eff>1?'属性克制！':eff<1?'效果较弱。':''}${title(d)}受到 ${damage} 点伤害。`);
 if(move.drain)a.hp=clamp(a.hp+Math.round(damage*move.drain),0,stats(a).hp);
 if(move.recoil)a.hp=Math.max(0,a.hp-Math.max(1,Math.round(stats(a).hp*move.recoil)));
 if(move.status&&d.hp>0&&!d.status&&random(s)<move.chance){d.status=move.status;d.statusTurns=3;battleLog(s,`${title(d)}陷入${statusName(d.status)}。`)}
}
export const statusName=s=>({burn:'灼伤',poison:'中毒',slow:'迟缓',sleep:'安眠'}[s]||'健康');
function endTurn(s){
 const b=s.battle;if(b.terminal)return;
 for(const m of [player(s),enemy(s)]){
  if(m.hp<=0)continue;
  if(m.status&&m.status!=='sleep'){
   if(m.status==='burn'||m.status==='poison'){const n=Math.max(1,Math.round(stats(m).hp*(m.status==='poison'?.09:.06)));m.hp=Math.max(0,m.hp-n);battleLog(s,`${title(m)}因${statusName(m.status)}损失 ${n} 点生命。`)}
   if(--m.statusTurns<=0){m.status=null;m.statusTurns=0}
  }
  if(m.hp>0&&m.gear==='mossCharm')m.hp=clamp(m.hp+Math.max(1,Math.round(stats(m).hp*.03)),0,stats(m).hp);
  if(m.hp>0&&SPECIES[m.species].trait==='雨露'&&b.weather==='rain')m.hp=clamp(m.hp+Math.max(1,Math.round(stats(m).hp*.04)),0,stats(m).hp);
 }
 checkFaints(s);if(!b.terminal){b.turn++;b.resonance=clamp(b.resonance+25,0,100);b.intent=chooseIntent(s)}
}
function speed(m){return stats(m).speed*stage(m.stages?.speed||0)*(m.status==='slow'?(SPECIES[m.species].trait==='冷静'?.75:.5):1)}
function battleAction(s,a){
 const b=s.battle;if(b.terminal)return '先收下本场旅途记录。';
 if(b.forceSwitch&&a.type!=='switch')return '请先选择一位能继续战斗的伙伴。';
 let p=player(s),e=enemy(s);const intent=b.intent||chooseIntent(s);
 if(a.type==='switch'){
  const m=team(s).find(m=>m.uid===a.uid);if(!m||m.hp<=0||m.uid===b.active)return '请选择另一位有战斗能力的同行伙伴。';
  b.active=m.uid;battleLog(s,`${title(m)}接过了战斗。`);if(b.forceSwitch){b.forceSwitch=false;b.intent=chooseIntent(s);return null}
  executeMove(s,e,m,intent);checkFaints(s);endTurn(s);return null;
 }
 if(a.type==='resonate'){
  if(b.resonated||b.resonance<100||p.bond<30)return '需要 100 共鸣能量、出战伙伴羁绊 30；每场战斗只能使用一次。';
  b.resonated=true;b.resonance=0;s.stats.resonances++;p.hp=clamp(p.hp+Math.round(stats(p).hp*.3),0,stats(p).hp);p.status=null;p.statusTurns=0;p.stages.attack=clamp(p.stages.attack+1,-2,2);battleLog(s,`${title(p)}与你心意相通：恢复 30% 生命、净化异常并提升攻击与灵力。`);executeMove(s,e,p,intent);checkFaints(s);endTurn(s);return null;
 }
 if(a.type==='capture'){
  if(b.kind!=='wild')return '只能与野生精灵缔结同行约定。';
  if(!['capsule','focusCapsule'].includes(a.item))return '请选择共鸣石。';
  if(s.roster.length>=100)return '精灵驿站已满（100 位），请先整理伙伴。';
  if(!consume(s,a.item))return '共鸣石不足，可以回镇购买或使用材料制作。';
  if(s.test||random(s)<captureChance(s,a.item)){
   const captured=clone(e);captured.bond=8;heal(captured);s.roster.push(captured);if(s.team.length<6)s.team.push(captured.uid);unique(s.caught,e.species);s.stats.captures++;finish(s,'catch',captured);return null;
  }
  battleLog(s,`${title(e)}暂时还没有回应。再削弱一些，或尝试让它安眠。`);executeMove(s,e,p,intent);checkFaints(s);endTurn(s);return null;
 }
 if(a.type==='run'){
  if(b.kind!=='wild')return '守望者与旅人的切磋需要分出胜负。';
  if(random(s)<clamp(.6+(speed(p)-speed(e))/100+b.turn*.04,.5,.95)){finish(s,'run');return null}
  battleLog(s,'暂时没能脱身。');executeMove(s,e,p,intent);checkFaints(s);endTurn(s);return null;
 }
 if(a.type==='item'){
  const m=team(s).find(m=>m.uid===a.uid)||p;
  const error=useItem(s,a.item,m,true);if(error)return error;
  battleLog(s,`对${title(m)}使用了${ITEMS[a.item].name}。`);executeMove(s,e,p,intent);checkFaints(s);endTurn(s);return null;
 }
 if(a.type!=='move')return '请先完成当前战斗。';
 if(!moves(p).includes(a.move)||(a.move!=='struggle'&&(p.pp[a.move]??0)<=0))return '这个招式暂时不可用。';
 const move=MOVES[a.move];if(move.effect==='heal'&&p.hp>=stats(p).hp)return '生命已满，不必浪费招式次数。';
 if(move.effect==='cleanse'&&!p.status&&p.hp>=stats(p).hp)return '当前无需净化或恢复。';
 const first=(move.priority||0)>(MOVES[intent]?.priority||0)||((move.priority||0)===(MOVES[intent]?.priority||0)&&speed(p)>=speed(e));
 const order=first?[[p,e,a.move],[e,p,intent]]:[[e,p,intent],[p,e,a.move]];
 for(const [actor,target,id] of order){if(actor.hp<=0||target.hp<=0||b.terminal||b.forceSwitch)break;executeMove(s,actor,target,id);checkFaints(s)}
 endTurn(s);return null;
}
export function useItem(s,item,m,inBattle=false){
 if(!m||!ITEMS[item])return '请选择有效的伙伴和道具。';
 if(inBattle&&!['potion','revive','antidote'].includes(item))return '这件道具需要在战斗外使用。';
 if(item==='potion'&&(m.hp<=0||m.hp>=stats(m).hp))return '药水只能用于受伤且未倒下的伙伴。';
 if(item==='revive'&&m.hp>0)return '这位伙伴不需要复苏。';
 if(item==='antidote'&&!m.status)return '这位伙伴没有异常状态。';
 if(item==='candy'&&m.level>=25)return '已经达到本作最高等级 25 级。';
 if(item==='fruit'&&m.hp<=0)return '请先让这位伙伴复苏。';
 if(TREATS[item]&&m.hp<=0)return '请先让这位伙伴复苏。';
 if(!['potion','revive','antidote','candy','fruit',...Object.keys(TREATS)].includes(item))return '这件道具不能直接使用。';
 if(!consume(s,item))return '道具不足。';
 if(item==='potion')m.hp=clamp(m.hp+45,0,stats(m).hp);
 if(item==='revive'){m.hp=Math.ceil(stats(m).hp*.5);m.status=null;m.statusTurns=0}
 if(item==='antidote'){m.status=null;m.statusTurns=0}
 if(item==='candy')addXp(s,m,75);
 if(TREATS[item]){const loved=TREATS[item].favorites.includes(SPECIES[m.species].type);m.bond=clamp(m.bond+(loved?12:8),0,100);m.mood=clamp(m.mood+(loved?30:20),0,100);addLog(s,`${title(m)}${loved?'很喜欢':'吃下了'}${ITEMS[item].name}，羁绊 +${loved?12:8}。`)}
 if(item==='fruit'){m.mood=clamp(m.mood+10,0,100);m.bond=clamp(m.bond+8,0,100);m.hp=clamp(m.hp+Math.round(stats(m).hp*.2),0,stats(m).hp)}
 return null;
}
export const questProgress=(s,q)=>q.metric==='collection'?s.caught.length:q.metric==='badges'?s.badges.length:s.stats[q.metric]||0;
function tick(s){s.stats.steps++;if(REGIONS[s.region]){s.steps[s.region]++;if(s.stats.steps%4===0)s.weather=pick(s,REGIONS[s.region].weather)}for(const m of team(s))m.mood=clamp(m.mood-1,0,100)}
export function act(s,a){
 if(!a||typeof a.type!=='string')return '无效操作。';
 if(a.type==='ack'){if(s.battle?.terminal)s.battle=null;s.report=null;return null}
 if(s.battle)return battleAction(s,a);
 if(a.type==='starter'){
  if(s.started||![0,1,2].includes(a.species))return '旅途已经开始了。';
  s.name=String(a.name||'旅行者').trim().slice(0,12)||'旅行者';const m=createCreature(s,a.species,4);m.bond=10;s.roster.push(m);s.team=[m.uid];s.started=true;unique(s.seen,a.species);unique(s.caught,a.species);addLog(s,`${s.name}与${title(m)}在岸灯镇成为了伙伴。`);return null;
 }
 if(!s.started)return '先选择你的第一位伙伴。';
 if(s.event&&a.type!=='event')return '先回应眼前的相遇吧。';
 const extra=expansionAction(s,a);if(extra!==undefined)return extra;
 if(a.type==='travel'){
  if(a.region!=='town'&&!available(s,a.region))return '先赢得上一座灯塔的徽记。';
  s.region=a.region;s.weather=a.region==='town'||a.region==='core'?'clear':pick(s,REGIONS[a.region].weather);s.report=null;return null;
 }
 if(a.type==='heal'){if(s.region!=='town')return '回到岸灯镇，可以免费恢复全队。';for(const m of s.roster)heal(m);addLog(s,'在岸灯镇休息了一晚，所有伙伴的生命和招式次数已恢复。');return null}
 if(a.type==='explore'||a.type==='forage'){
  const region=REGIONS[s.region];if(!region)return '先在地图上选择一片探索区域。';
  if(!team(s).some(m=>m.hp>0))return '先回岸灯镇照顾伙伴。';
  tick(s);
  if(a.type==='forage'){
   s.bag.herb+=1+Math.floor(random(s)*2)+(team(s).some(m=>SPECIES[m.species].trait==='采集')?1:0);
   s.bag.crystal+=1+(team(s).some(m=>SPECIES[m.species].type==='stone')?1:0);
   if(random(s)<.45||team(s).some(m=>SPECIES[m.species].type==='leaf'))s.bag.fruit++;
   addLog(s,'沿途收集到灵草与碎晶；森属性伙伴更容易找到蜜果，岩属性能找到额外碎晶。');return null;
  }
  const r=random(s);
  if(r<.18){s.event=pick(s,FIELD_EVENTS).id;return null}
  if(r<.29){s.bag.capsule++;s.bag.fruit++;s.coins+=15;addLog(s,'路边的补给箱中有共鸣石、蜜果和 15 枚旅币。');return null}
  let habitat=[...region.habitat];if(s.region==='bay'&&s.weather==='rain')habitat.push(13,13);if(s.region==='sky'&&isNight(s))habitat.push(12,12);
  const id=pick(s,habitat),level=region.level[0]+Math.floor(random(s)*(region.level[1]-region.level[0]+1));
  return startBattle(s,'wild',[[id,level]]);
 }
 if(a.type==='trainer'){
  const r=REGIONS[s.region];if(!r)return '请先前往探索区域。';return startBattle(s,'trainer',[[pick(s,r.habitat),r.level[1]],[pick(s,r.habitat),r.level[1]]]);
 }
 if(a.type==='guardian'){
  const r=REGIONS[s.region];if(!r)return '请先前往灯塔所在区域。';if(s.steps[s.region]<6)return '先在本区域完成 6 次探索或采集，让伙伴熟悉这里。';return startBattle(s,'guardian',r.boss);
 }
 if(a.type==='summon'){
  if(s.region!=='sky'||s.badges.length<4)return '四座灯塔点亮后，在观星原回应星光。';return startBattle(s,'wild',[[15,15]]);
 }
 if(a.type==='secret'){
  const r=REGIONS[s.region];if(!r||s.secrets.includes(r.id))return '这处隐藏路线已经探索过了。';
  if(!team(s).some(m=>SPECIES[m.species].type===r.secretType))return `需要一位${TYPES[r.secretType].name}属性同行伙伴帮助你。`;
  s.secrets.push(r.id);s.coins+=100;s.bag.focusCapsule+=2;s.bag.fruit+=3;addLog(s,`伙伴带你发现${r.secret}，获得 100 旅币、澄光共鸣石 ×2、蜜果 ×3。`);return null;
 }
 if(a.type==='event'){
  const ev=FIELD_EVENTS.find(e=>e.id===s.event),choice=ev?.choices[a.index];if(!choice)return '请选择一个回应。';
  const effect=choice.effect;
  if(effect==='help'){for(const m of team(s))m.bond=clamp(m.bond+3,0,100);s.bag.herb+=2}
  if(effect==='trade')s.bag.capsule++;
  if(effect==='rest')for(const m of team(s))if(m.hp>0)m.hp=clamp(m.hp+Math.round(stats(m).hp*.3),0,stats(m).hp);
  if(effect==='gather'){s.bag.herb+=3;s.bag.crystal++}
  if(effect==='learn')for(const m of team(s))addXp(s,m,35);
  if(effect==='search'){s.bag.crystal+=2;s.bag.fruit++}
  addLog(s,`${ev.title}：${choice.label}。${choice.detail}。`);s.event=null;return null;
 }
 if(a.type==='buy'){
  if(s.region!=='town')return '旅途商店在岸灯镇。';const item=ITEMS[a.item];if(!item?.price)return '这件物品暂不出售。';if(!s.test&&s.coins<item.price)return '旅币不足。';if(!s.test)s.coins-=item.price;s.bag[a.item]++;return null;
 }
 if(a.type==='craft'){
  const recipe=RECIPES[a.item];if(!recipe)return '没有这份配方。';if(!s.test&&Object.entries(recipe).some(([k,v])=>s.bag[k]<v))return '制作材料不足，去野外采集吧。';for(const [k,v]of Object.entries(recipe))consume(s,k,v);s.bag[a.item]++;s.stats.crafted++;addLog(s,`制作了${ITEMS[a.item].name}。`);return null;
 }
 if(a.type==='claim'){
  const q=QUESTS.find(q=>q.id===a.id);if(!q||s.claimed.includes(q.id)||questProgress(s,q)<q.goal)return '这份研究记录尚不能领取。';
  s.claimed.push(q.id);for(const [k,v]of Object.entries(q.reward))if(k==='coins')s.coins+=v;else s.bag[k]+=v;addLog(s,`完成研究记录「${q.name}」。`);return null;
 }
 if(a.type==='test'){s.test=!!a.enabled;addLog(s,s.test?'测试模式开启：道具与旅币不消耗，捕捉必中。':'测试模式关闭，恢复正常规则。');return null}
 const m=s.roster.find(m=>m.uid===a.uid);
 if(!m)return '找不到这位伙伴。';
 if(a.type==='item')return useItem(s,a.item,m);
 if(a.type==='lead'){if(!s.team.includes(m.uid))return '先将伙伴加入同行队伍。';s.team=[m.uid,...s.team.filter(id=>id!==m.uid)];return null}
 if(a.type==='team'){
  if(s.team.includes(m.uid)){if(s.team.length===1)return '至少要留一位同行伙伴。';s.team=s.team.filter(id=>id!==m.uid)}else{if(s.team.length>=6)return '同行队伍最多 6 位，先让一位伙伴在驿站休息。';s.team.push(m.uid)}return null;
 }
 if(a.type==='evolve'){
  if(!canEvolve(m))return '这位伙伴还没有达到进化条件。';const before=title(m),hp=stats(m).hp;m.species=SPECIES[m.species].evolves;for(const id of learned(m))if(!(id in m.pp))m.pp[id]=MOVES[id].pp;m.loadout=m.loadout.filter(id=>learned(m).includes(id));for(const id of learned(m))if(m.loadout.length<4&&!m.loadout.includes(id))m.loadout.push(id);m.hp=clamp(m.hp+stats(m).hp-hp,0,stats(m).hp);unique(s.caught,m.species);unique(s.seen,m.species);addLog(s,`${before}进化成了${title(m)}！`);s.report={outcome:'evolve',title:'熟悉的目光，崭新的模样',creature:m.species,lines:[`${before}进化成了${SPECIES[m.species].name}。能力成长了，与你的羁绊依然如初。`]};return null;
 }
 if(a.type==='train'){if(m.level<5)return '达到 5 级后可以选择专精。';if(!TRAINING[a.path])return '请选择有效专精。';const old=stats(m).hp;m.training=a.path;m.hp=clamp(Math.round(m.hp/old*stats(m).hp),0,stats(m).hp);return null}
 if(a.type==='rename'){m.nickname=String(a.name||'').trim().slice(0,12);return null}
 return '当前不能执行这个操作。';
}

// Restore only known fields. Saves remain portable; malformed imports never replace a valid run.
export function restoreSave(input){
 if(!input||![1,2].includes(input.version)||!Array.isArray(input.roster)||input.roster.length>100)throw Error('不支持的存档格式');
 const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
 const s=newGame(input.seed);if(!integer(input.nextId,1,100000000)||!integer(input.seed,1,4294967295))throw Error('存档数据不完整');
 const creature=raw=>{
  if(!raw||!SPECIES[raw.species]||!integer(raw.species,0,SPECIES.length-1)||!integer(raw.uid,1,100000000)||!integer(raw.level,1,25)||!NATURES[raw.nature])throw Error('伙伴数据损坏');
  const m={uid:raw.uid,species:raw.species,level:raw.level,xp:clamp(Number(raw.xp)||0,0,100000),nature:raw.nature,bond:clamp(Number(raw.bond)||0,0,100),mood:clamp(Number(raw.mood??70)||0,0,100),lastCare:clamp(Number(raw.lastCare??-3)||0,-3,1000000),bondStories:[...new Set((Array.isArray(raw.bondStories)?raw.bondStories:[]).filter(n=>[30,60,90].includes(n)))],gear:EQUIPMENT[raw.gear]?raw.gear:null,loadout:[],reflect:!!raw.reflect,training:TRAINING[raw.training]?raw.training:null,nickname:String(raw.nickname||'').slice(0,12),hp:0,pp:{},status:['burn','poison','slow','sleep'].includes(raw.status)?raw.status:null,statusTurns:clamp(Number(raw.statusTurns)||0,0,4),stages:{attack:clamp(Number(raw.stages?.attack)||0,-2,2),defense:clamp(Number(raw.stages?.defense)||0,-2,2),speed:clamp(Number(raw.stages?.speed)||0,-2,2)},shield:raw.shield?1:0,hit:!!raw.hit};
  m.hp=clamp(Number(raw.hp)||0,0,stats(m).hp);for(const id of learned(m))m.pp[id]=clamp(Number(raw.pp?.[id]??(input.version===1?MOVES[id].pp:0))||0,0,MOVES[id].pp);m.loadout=Array.isArray(raw.loadout)?[...new Set(raw.loadout.filter(id=>learned(m).includes(id)))].slice(0,4):learned(m).slice(0,4);if(!m.loadout.length)m.loadout=learned(m).slice(0,4);return m;
 };
 s.roster=input.roster.map(creature);const ids=s.roster.map(m=>m.uid);if(new Set(ids).size!==ids.length)throw Error('伙伴编号重复');
 if(!Array.isArray(input.team)||input.team.length>6||input.team.some(id=>!ids.includes(id))||new Set(input.team).size!==input.team.length)throw Error('队伍数据损坏');
 s.started=!!input.started;if(s.started&&!input.team.length)throw Error('同行队伍为空');s.team=[...input.team];s.name=String(input.name||'旅行者').slice(0,12);s.seed=input.seed;s.nextId=input.nextId;
 s.region=WORLD[input.region]?input.region:'town';
 for(const key of ['seen','caught'])s[key]=[...new Set((Array.isArray(input[key])?input[key]:[]).filter(id=>integer(id,0,SPECIES.length-1)))];
 for(const m of s.roster){unique(s.seen,m.species);unique(s.caught,m.species)}
 s.badges=[...new Set((input.badges||[]).filter(id=>REGIONS[id]))];s.secrets=[...new Set((input.secrets||[]).filter(id=>REGIONS[id]))];s.claimed=[...new Set((input.claimed||[]).filter(id=>QUESTS.some(q=>q.id===id)))];
 for(const key of Object.keys(ITEMS))s.bag[key]=Math.floor(clamp(Number(input.bag?.[key])||0,0,1000000));
 s.coins=Math.floor(clamp(Number(input.coins)||0,0,10000000));for(const id of Object.keys(REGIONS))s.steps[id]=Math.floor(clamp(Number(input.steps?.[id])||0,0,100000));
 for(const k of Object.keys(s.stats))s.stats[k]=Math.floor(clamp(Number(input.stats?.[k])||0,0,1000000));
 s.weather=WEATHER[input.weather]?input.weather:'clear';s.log=(Array.isArray(input.log)?input.log:[]).filter(x=>typeof x==='string').slice(0,50).map(x=>x.slice(0,250));s.test=!!input.test;s.event=FIELD_EVENTS.some(e=>e.id===input.event)?input.event:null;
 if(input.battle){
  const b=input.battle;if(!['wild','trainer','guardian','core'].includes(b.kind)||!WORLD[b.region]||!Array.isArray(b.opponents)||!b.opponents.length||b.opponents.length>3||!integer(b.enemyIndex,0,b.opponents.length-1)||!s.team.includes(b.active)||!integer(b.turn,1,100000))throw Error('战斗记录损坏');
  const opponents=b.opponents.map(creature);if(opponents.some((m,i)=>ids.includes(m.uid)&&!(b.terminal==='catch'&&i===b.enemyIndex))||new Set(opponents.map(m=>m.uid)).size!==opponents.length)throw Error('对手编号损坏');
  s.battle={kind:b.kind,region:b.region,opponents,enemyIndex:b.enemyIndex,active:b.active,turn:b.turn,resonance:clamp(Number(b.resonance)||0,0,100),resonated:!!b.resonated,weather:WEATHER[b.weather]?b.weather:'clear',log:(Array.isArray(b.log)?b.log:[]).filter(x=>typeof x==='string').slice(-35).map(x=>x.slice(0,250)),forceSwitch:!!b.forceSwitch,intent:MOVES[b.intent]?b.intent:'tap',terminal:['win','lose','run','catch'].includes(b.terminal)?b.terminal:null};
  if(!s.battle.terminal&&enemy(s).hp<=0)throw Error('战斗状态不完整');
  if(!s.battle.terminal&&player(s).hp<=0&&!s.battle.forceSwitch)throw Error('战斗状态不完整');
 }
 if(input.report&&typeof input.report.title==='string'&&Array.isArray(input.report.lines))s.report={outcome:String(input.report.outcome).slice(0,15),title:input.report.title.slice(0,80),lines:input.report.lines.filter(x=>typeof x==='string').slice(0,8).map(x=>x.slice(0,250)),creature:integer(input.report.creature,0,SPECIES.length-1)?input.report.creature:0};
 restoreExpansion(s,input);
 const all=[...ids,...(s.battle?.opponents.map(m=>m.uid)||[])];s.nextId=Math.max(s.nextId,...all.map(id=>id+1));return s;
}

export const currentStory=s=>STORY[s.story.index]||null;
export function storyStatus(s){
 const node=currentStory(s);if(!node)return {ready:false,reason:'主线已完成。自由探索、收集图鉴，或在星潮核心寻找暮星龙。'};
 const c=node.condition;
 if(s.region!==node.place)return {ready:false,reason:`前往${WORLD[node.place].name}：${node.goal}`};
 if(c.steps&&(s.steps[node.place]||0)<c.steps)return {ready:false,reason:`${WORLD[node.place].name}探索进度 ${s.steps[node.place]||0}/${c.steps}；道路每走 8 格也计一次探索。`};
 if(c.badge&&!s.badges.includes(c.badge))return {ready:false,reason:`先挑战${REGIONS[c.badge].guardian}，取得${REGIONS[c.badge].badge}。`};
 if(c.bond&&!team(s).some(m=>m.bond>=c.bond))return {ready:false,reason:`一位同行伙伴的羁绊需达到 ${c.bond}。战斗、喂食和营地照料都会增进感情。`};
 if(c.cost&&!s.test&&Object.entries(c.cost).some(([id,n])=>s.bag[id]<n))return {ready:false,reason:'需要交付 3 份碎晶，沿途采集可以获得。'};
 if(c.finalWon&&!s.story.finalWon)return {ready:false,reason:'前往核心北端，与溯完成三阶段挑战。'};
 return {ready:true,reason:node.goal};
}
function giveEgg(s,species,group){s.eggs.push({id:s.nextEgg++,species,group,hatchAt:s.stats.steps+12})}
function expansionAction(s,a){
 if(a.type==='walk'){
  const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[a.dir];if(!delta)return '请选择移动方向。';
  const pos=s.positions[s.region],x=pos.x+delta[0],y=pos.y+delta[1];pos.dir=a.dir;
  if(!walkable(s.region,x,y))return null;
  pos.x=x;pos.y=y;pos.walked++;s.stats.walked++;
  if(REGIONS[s.region]&&pos.walked%8===0)tick(s);
  pos.grass=WORLD[s.region].tiles[y][x]==='grass'?pos.grass+1:0;
  if(pos.grass>=4&&REGIONS[s.region]){pos.grass=0;return act(s,{type:'explore'})}
  return null;
 }
 if(a.type==='story'){
  const node=currentStory(s);if(!node||a.id!==node.id||![0,1].includes(a.choice))return '这一页已经翻过，请查看当前的旅途记录。';
  const status=storyStatus(s);if(!status.ready)return status.reason;
  if(node.reward.egg!==undefined&&s.eggs.length>=3)return '育幼篮最多放 3 枚蛋，先迎接一位已孵化的小伙伴吧。';
  for(const [id,n] of Object.entries(node.condition.cost||{}))consume(s,id,n);
  for(const [id,n] of Object.entries(node.reward)){if(id==='egg')giveEgg(s,n,'青禾的托付');else if(id==='coins')s.coins+=n;else s.bag[id]+=n}
  s.story.done.push(node.id);s.story.choices[node.id]=a.choice;s.story.index++;
  for(const m of team(s)){m.bond=clamp(m.bond+2,0,100);m.mood=clamp(m.mood+5,0,100)}
  if(node.id==='choice')s.story.ending=a.choice===0?'dawn':'lantern';
  addLog(s,`第${node.chapter+1}章 · ${node.title}：${node.choices[a.choice]}。`);
  if(node.id==='choice'||node.id==='postscript')s.report={outcome:'story',title:node.id==='choice'?ENDINGS[s.story.ending].name:'明天，也一起走吧',creature:s.team.length?s.roster.find(m=>m.uid===s.team[0]).species:0,lines:[ENDINGS[s.story.ending].text,node.id==='postscript'?`${s.name}与伙伴完成了六章旅途。暮星龙的相遇已开放，新的故事从空白页开始。`:'回到岸灯镇，给这段旅途写一封回信。']};
  return null;
 }
 if(a.type==='corebattle'){
  if(s.region!=='core'||!s.story.done.includes('threshold'))return '先在星潮核心与溯交谈。';
  if(s.story.finalWon)return '回路已经恢复，请与溯继续完成最后的约定。';
  return startBattle(s,'core',[[17,16],[19,17],[23,18]]);
 }
 if(a.type==='core-rest'){
  if(s.region!=='core')return '回声泉位于星潮核心。';for(const m of team(s))heal(m);addLog(s,'回声泉恢复了同行伙伴的生命与招式次数。');return null;
 }
 if(a.type==='dragon'){
  if(s.region!=='core'||s.story.index<STORY.length)return '完成六章故事与回信后，暮星龙才会回应你的邀请。';return startBattle(s,'wild',[[23,18]]);
 }
 if(a.type==='egg'){
  const group=EGG_GROUPS[a.group];if(!group||s.badges.length<group.gate)return '这片区域的育幼委托尚未开放。';
  if(s.eggs.length>=3)return '育幼篮最多照料 3 枚蛋。';
  if(!s.test&&(s.coins<160||s.bag.crystal<3))return '照料委托需要 160 旅币和 3 份碎晶。';
  if(!s.test)s.coins-=160;consume(s,'crystal',3);giveEgg(s,pick(s,group.pool),group.name);addLog(s,`领养了一枚${group.name}，再完成 12 次野外探索即可孵化。`);return null;
 }
 if(a.type==='hatch'){
  const egg=s.eggs.find(e=>e.id===a.id);if(!egg||s.stats.steps<egg.hatchAt)return '小生命还需要一些时间。野外探索、采集或沿道路行走可推进孵化。';
  if(s.roster.length>=100)return '精灵驿站已满。';
  const m=createCreature(s,egg.species,4);m.bond=15;s.roster.push(m);if(s.team.length<6)s.team.push(m.uid);unique(s.seen,m.species);unique(s.caught,m.species);s.eggs=s.eggs.filter(e=>e.id!==a.id);s.stats.hatched++;
  s.report={outcome:'hatch',title:'世界又多了一位小小的朋友',creature:m.species,lines:[`${title(m)}从蛋壳中探出头，第一次看见了你。初始等级 4，羁绊 15。`,s.team.includes(m.uid)?'它已加入同行队伍。':'同行队伍已满，它正在精灵驿站等你。']};return null;
 }
 if(!['loadout','equip','care','bond-story'].includes(a.type))return undefined;
 const m=s.roster.find(m=>m.uid===a.uid);if(!m)return '找不到这位伙伴。';
 if(a.type==='loadout'){
  if(!Number.isInteger(a.slot)||a.slot<0||a.slot>3||!learned(m).includes(a.move))return '只能装备已经学会的招式。';
  if(m.loadout.includes(a.move)&&m.loadout[a.slot]!==a.move)return '这招已经在另一个栏位中。';
  if(a.slot>m.loadout.length)return '请先填满前面的招式栏。';
  m.loadout[a.slot]=a.move;return null;
 }
 if(a.type==='equip'){
  const id=a.item||null;if(id!==null&&!EQUIPMENT[id])return '请选择有效的护符。';if(id===m.gear)return null;
  if(id&&!s.test&&s.bag[id]<1)return '行囊中没有这件装备。';
  const hp=stats(m).hp;if(id)consume(s,id);if(m.gear)s.bag[m.gear]++;m.gear=id;m.hp=clamp(Math.round(m.hp/hp*stats(m).hp),0,stats(m).hp);return null;
 }
 if(a.type==='care'){
  if(s.stats.steps-m.lastCare<3)return `刚刚照料过；再完成 ${3-(s.stats.steps-m.lastCare)} 次野外探索后，陪它玩一会儿。`;
  if(m.bond>=100&&m.mood>=100)return '伙伴现在已经心满意足了。';
  m.lastCare=s.stats.steps;m.bond=clamp(m.bond+6,0,100);m.mood=clamp(m.mood+20,0,100);addLog(s,`你为${title(m)}梳理毛发、检查爪垫。羁绊 +6，心情 +20。`);return null;
 }
 if(a.type==='bond-story'){
  const mark=[30,60,90].find(n=>m.bond>=n&&!m.bondStories.includes(n));if(!mark)return '羁绊达到 30、60、90 时，会出现一段新的伙伴心声。';
  m.bondStories.push(mark);addXp(s,m,45);const lines=mark===30?[`${title(m)}把一路上珍藏的小石子放到你手心。你第一次发现，它也在认真记住与你同行的每一天。`]:mark===60?[`你停下脚步时，${title(m)}也跟着停下来。无需招呼，它已经知道什么时候该向前，什么时候该陪你坐一会儿。`]:[`${title(m)}望着远方，又回头看了看你。你们都知道，无论下一条路通向哪里，总有人愿意一起出发。`];s.report={outcome:'bond',title:`${title(m)} · ${bondTier(m)}`,creature:m.species,lines:[...lines,'伙伴获得 45 经验。这段心声已收录，奖励仅领取一次。']};return null;
 }
}
function restoreExpansion(s,input){
 const story=input.story;
 if(story){
  if(!Number.isInteger(story.index)||story.index<0||story.index>STORY.length||!Array.isArray(story.done)||story.done.length!==story.index||story.done.some((id,i)=>id!==STORY[i].id))throw Error('故事进度损坏');
  s.story.index=story.index;s.story.done=[...story.done];s.story.finalWon=!!story.finalWon;
  for(const id of s.story.done){const choice=story.choices?.[id];if(![0,1].includes(choice))throw Error('故事选择损坏');s.story.choices[id]=choice}
  s.story.ending=s.story.done.includes('choice')?(s.story.choices.choice===0?'dawn':'lantern'):null;
  if(s.story.done.includes('core-duel')&&!s.story.finalWon)throw Error('核心挑战记录损坏');
 }
 if(input.eggs!==undefined){
  if(!Array.isArray(input.eggs)||input.eggs.length>3)throw Error('育幼记录损坏');
  s.eggs=input.eggs.map(e=>{if(!Number.isInteger(e.id)||e.id<1||!Number.isInteger(e.species)||!SPECIES[e.species]||e.species===23||!Number.isInteger(e.hatchAt)||e.hatchAt<0||e.hatchAt>1000012)throw Error('育幼记录损坏');return {id:e.id,species:e.species,group:String(e.group||'同行之卵').slice(0,20),hatchAt:e.hatchAt}});
  if(new Set(s.eggs.map(e=>e.id)).size!==s.eggs.length)throw Error('育幼编号重复');
 }
 s.nextEgg=Math.max(1,Math.floor(clamp(Number(input.nextEgg)||1,1,1000000)),...s.eggs.map(e=>e.id+1));
 for(const id of Object.keys(WORLD)){const raw=input.positions?.[id];if(raw&&Number.isInteger(raw.x)&&Number.isInteger(raw.y)&&walkable(id,raw.x,raw.y))s.positions[id]={x:raw.x,y:raw.y,dir:['up','down','left','right'].includes(raw.dir)?raw.dir:'down',walked:Math.floor(clamp(Number(raw.walked)||0,0,10000000)),grass:Math.floor(clamp(Number(raw.grass)||0,0,3))}}
 if(s.region==='core'&&!available(s,'core'))s.region='sky';
}
