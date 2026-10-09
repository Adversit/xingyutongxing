import {EQUIPMENT,TREATS} from './content.mjs';
export const TYPES = {
  leaf:{name:'森',color:'#3a9a62',strong:['tide','stone'],weak:['fire','wind','frost','leaf']},
  fire:{name:'焰',color:'#dc6742',strong:['leaf','frost'],weak:['tide','stone','fire']},
  tide:{name:'潮',color:'#418fcb',strong:['fire','stone'],weak:['leaf','spark','tide']},
  spark:{name:'雷',color:'#b99524',strong:['tide','wind'],weak:['stone','leaf','spark']},
  stone:{name:'岩',color:'#92806e',strong:['spark','fire'],weak:['leaf','tide','stone']},
  wind:{name:'岚',color:'#579c98',strong:['leaf','star'],weak:['spark','stone','wind']},
  frost:{name:'霜',color:'#8d83be',strong:['leaf','wind'],weak:['fire','tide','frost']},
  star:{name:'星',color:'#7772b7',strong:['stone','frost'],weak:['star','wind']},
  plain:{name:'素',color:'#77848b',strong:[],weak:[]}
};
export const MOVES = {
  tap:{name:'轻跃撞击',type:'plain',power:32,pp:25,accuracy:1,category:'physical',desc:'可靠的普通攻击。'},
  quick:{name:'疾步',type:'plain',power:30,pp:15,accuracy:1,priority:1,category:'physical',desc:'优先行动，适合抢先收尾。'},
  guard:{name:'守护姿态',type:'plain',power:0,pp:10,accuracy:1,effect:'guard',desc:'抵挡下一次攻击的 60% 伤害。'},
  focus:{name:'凝神',type:'star',power:0,pp:8,accuracy:1,effect:'focus',desc:'攻击与灵力提高一阶，最多两阶。'},
  leaf:{name:'叶旋',type:'leaf',power:43,pp:18,accuracy:1,category:'special',desc:'旋叶裹住对手。'},
  pollen:{name:'安眠花粉',type:'leaf',power:0,pp:8,accuracy:.9,effect:'sleep',desc:'90% 命中，使对手沉睡 1–2 次行动。'},
  blossom:{name:'繁花汲取',type:'leaf',power:62,pp:8,accuracy:1,category:'special',drain:.3,desc:'恢复造成伤害的 30% 生命。'},
  ember:{name:'星火',type:'fire',power:43,pp:18,accuracy:1,category:'special',status:'burn',chance:.25,desc:'25% 概率灼伤，持续 3 回合。'},
  flare:{name:'燎原冲刺',type:'fire',power:72,pp:8,accuracy:.9,category:'physical',desc:'威力 72，命中 90%。'},
  warm:{name:'暖焰',type:'fire',power:0,pp:5,accuracy:1,effect:'heal',desc:'恢复最大生命的 35%。'},
  bubble:{name:'潮泡',type:'tide',power:43,pp:18,accuracy:1,category:'special',desc:'以细密潮泡攻击。'},
  wave:{name:'回澜',type:'tide',power:65,pp:9,accuracy:1,category:'special',desc:'稳定而有力的水属性攻击。'},
  mist:{name:'净雾',type:'tide',power:0,pp:6,accuracy:1,effect:'cleanse',desc:'清除自身异常，并恢复 20% 生命。'},
  pebble:{name:'砾石弹',type:'stone',power:45,pp:18,accuracy:.95,category:'physical',desc:'命中 95% 的岩属性攻击。'},
  quake:{name:'地脉震',type:'stone',power:72,pp:8,accuracy:.9,category:'physical',desc:'震动地面，威力 72。'},
  shell:{name:'岩壳加固',type:'stone',power:0,pp:8,accuracy:1,effect:'defense',desc:'防御提高一阶，最多两阶。'},
  spark:{name:'流萤电',type:'spark',power:43,pp:18,accuracy:1,category:'special',status:'slow',chance:.3,desc:'30% 概率迟缓，速度减半 3 回合。'},
  thunder:{name:'晴空雷鸣',type:'spark',power:74,pp:8,accuracy:.85,category:'special',desc:'命中 85%，雨天必中。'},
  gust:{name:'回旋风',type:'wind',power:44,pp:18,accuracy:1,category:'special',desc:'有风天气下伤害提升 20%。'},
  gale:{name:'岚羽穿梭',type:'wind',power:65,pp:9,accuracy:.95,category:'physical',desc:'以轻盈羽翼穿过气流。'},
  frost:{name:'霜粒',type:'frost',power:44,pp:18,accuracy:1,category:'special',status:'slow',chance:.3,desc:'30% 概率迟缓 3 回合。'},
  aurora:{name:'极光幕',type:'frost',power:66,pp:9,accuracy:1,category:'special',desc:'以极光凝成寒流。'},
  sting:{name:'琥珀刺',type:'leaf',power:36,pp:18,accuracy:1,category:'physical',status:'poison',chance:.35,desc:'35% 概率中毒，持续 3 回合。'},
  moon:{name:'月纹',type:'star',power:46,pp:18,accuracy:1,category:'special',desc:'沿着星纹传递灵力。'},
  comet:{name:'星河落',type:'star',power:74,pp:8,accuracy:.9,category:'special',desc:'命中 90%，星属性强力攻击。'},
  mercy:{name:'留手',type:'plain',power:30,pp:20,accuracy:1,category:'physical',mercy:true,desc:'至少为野生对手留下 1 点生命，方便捕捉。'},
  struggle:{name:'奋力一击',type:'plain',power:40,pp:99,accuracy:1,category:'physical',recoil:.12,desc:'攻击招式耗尽时可用，自身损失最大生命的 12%。'}
};
const make=(id,name,type,base,trait,desc,learn,extra={})=>({id,name,type,base,trait,desc,learn,catchRate:.42,...extra});
// Base stats: health, attack, defense, spirit, speed.
export const SPECIES = [
  make(0,'苔芽狸','leaf',[38,16,15,20,19],'雨露','耳边的蕨芽会在靠近清泉时舒展。喜欢收集形状不同的叶子。',[[1,'tap'],[1,'leaf'],[5,'pollen'],[9,'blossom']],{evolves:4,evolveLevel:7,habitat:'萤叶林',ability:'雨天每回合恢复 4% 生命。'}),
  make(1,'焰团獾','fire',[40,21,16,17,17],'余烬','把温热的石头藏进尾毛，为迷路的旅人照亮归途。',[[1,'tap'],[1,'ember'],[5,'warm'],[9,'flare']],{evolves:5,evolveLevel:7,habitat:'熔光岭',ability:'生命低于三分之一时，焰属性伤害提高 25%。'}),
  make(2,'泡沫獭','tide',[43,16,20,19,15],'水润','用泡泡保存海风的气味。救起落水小物后总会开心地拍掌。',[[1,'tap'],[1,'bubble'],[5,'mist'],[9,'wave']],{evolves:6,evolveLevel:7,habitat:'琉璃湾',ability:'赢得战斗后恢复 12% 生命。'}),
  make(3,'岩铃龟','stone',[47,19,24,12,9],'硬壳','背甲轻碰会响起清脆的铃声。能找到埋在土里的晶石。',[[1,'pebble'],[1,'guard'],[5,'shell'],[9,'quake']],{evolves:7,evolveLevel:7,habitat:'萤叶林、熔光岭',ability:'每场战斗第一次受击减伤 25%。'}),
  make(4,'茶蕨灵','leaf',[55,24,22,32,30],'雨露','角上的新芽记录着伙伴一起走过的季节。',[[1,'tap'],[1,'leaf'],[5,'pollen'],[9,'blossom']],{habitat:'苔芽狸达到 7 级进化',ability:'雨天每回合恢复 4% 生命。'}),
  make(5,'曜尾獾','fire',[59,34,25,28,27],'余烬','在暴风中也不熄灭的尾焰，象征着坚定的陪伴。',[[1,'tap'],[1,'ember'],[5,'warm'],[9,'flare']],{habitat:'焰团獾达到 7 级进化',ability:'生命低于三分之一时，焰属性伤害提高 25%。'}),
  make(6,'澜冠獭','tide',[62,25,31,31,25],'水润','额前的潮冠随月相泛起微光，是海湾出色的领航员。',[[1,'tap'],[1,'bubble'],[5,'mist'],[9,'wave']],{habitat:'泡沫獭达到 7 级进化',ability:'赢得战斗后恢复 12% 生命。'}),
  make(7,'苍岳龟','stone',[68,31,38,22,16],'硬壳','背负着一座微小的山，走得慢，却从不让同伴掉队。',[[1,'pebble'],[1,'guard'],[5,'shell'],[9,'quake']],{habitat:'岩铃龟达到 7 级进化',ability:'每场战斗第一次受击减伤 25%。'}),
  make(8,'萤电雀','spark',[34,14,13,24,29],'轻灵','双翼拍动时会洒下流萤一样的电光。爱在雨前鸣唱。',[[1,'quick'],[1,'spark'],[5,'focus'],[9,'thunder']],{habitat:'萤叶林、琉璃湾',ability:'速度额外提高 10%。'}),
  make(9,'岚羽鸮','wind',[41,20,17,19,24],'轻灵','能读懂风在树叶上写下的方向，常为旅行者领路。',[[1,'tap'],[1,'gust'],[5,'guard'],[9,'gale']],{habitat:'萤叶林、观星原',ability:'速度额外提高 10%。'}),
  make(10,'绒霜兔','frost',[39,17,19,23,22],'冷静','踩过的草尖会留下短暂的霜花。总把最甜的果子留给朋友。',[[1,'quick'],[1,'frost'],[5,'mist'],[9,'aurora']],{habitat:'琉璃湾、观星原',ability:'被迟缓时仍保留 75% 速度。'}),
  make(11,'琥珀蜂','leaf',[37,25,14,15,25],'采集','将花蜜封存在琥珀般的甲壳中，是可靠的林间小向导。',[[1,'quick'],[1,'sting'],[5,'pollen'],[9,'blossom']],{habitat:'萤叶林',ability:'在队伍中时，采集额外获得 1 份灵草。'}),
  make(12,'月绫狐','star',[42,17,19,29,27],'共鸣','尾尖的绫带只在安静的夜色中展开，会记得每一位善待它的人。',[[1,'mercy'],[1,'moon'],[5,'pollen'],[9,'comet']],{habitat:'观星原（夜晚更常见）',catchRate:.28,ability:'羁绊带来的暴击加成提高一倍。'}),
  make(13,'潮灯鲸','tide',[60,16,24,28,12],'水润','把海面倒映的星光装进腹中的小灯，缓缓浮游。',[[1,'bubble'],[1,'guard'],[5,'mist'],[9,'wave']],{habitat:'琉璃湾（雨天更常见）',catchRate:.3,ability:'赢得战斗后恢复 12% 生命。'}),
  make(14,'磁壳蟹','stone',[44,27,29,17,13],'硬壳','喜欢把亮晶晶的矿石排成整齐的小队。双钳能感知地下矿脉。',[[1,'pebble'],[1,'spark'],[5,'shell'],[9,'quake']],{habitat:'熔光岭',ability:'每场战斗第一次受击减伤 25%。'}),
  make(15,'星穹鹿','star',[66,29,30,36,29],'共鸣','当四座灯塔再次亮起，它会循着星路来到真诚的旅人身边。',[[1,'moon'],[1,'guard'],[5,'warm'],[9,'comet']],{habitat:'四座灯塔点亮后的观星原',catchRate:.18,ability:'羁绊带来的暴击加成提高一倍。'})
];
export const NATURES={steady:{name:'沉稳',stat:'defense'},lively:{name:'活泼',stat:'speed'},brave:{name:'勇敢',stat:'attack'},curious:{name:'好奇',stat:'spirit'}};
export const TRAINING={power:{name:'进攻专精',desc:'攻击、灵力提升 8%'},heart:{name:'守护专精',desc:'最大生命提升 12%'},swift:{name:'灵巧专精',desc:'速度提升 15%'}};
export const REGIONS={
 forest:{id:'forest',name:'萤叶林',subtitle:'新芽与萤光的起点',color:'#549772',level:[2,5],gate:0,habitat:[0,3,8,9,11],weather:['clear','rain','wind'],guardian:'林间守望者 · 青禾',badge:'森芽徽记',boss:[[3,6],[4,6]],secretType:'leaf',secret:'藤蔓后的小药园',lore:'青禾请你找回散落林间的灯种。先与新伙伴熟悉彼此，再试着捕捉一位不同属性的朋友。',x:26,y:43},
 bay:{id:'bay',name:'琉璃湾',subtitle:'潮汐送来新的相遇',color:'#498ebe',level:[5,8],gate:1,habitat:[2,8,10,13],weather:['rain','clear','wind'],guardian:'潮汐守望者 · 澄音',badge:'潮汐徽记',boss:[[10,9],[6,10]],secretType:'tide',secret:'退潮后的贝壳洞',lore:'澄音正在修复海湾灯塔。萤电雀擅长应对潮属性，而岩属性伙伴应避开湍急的海浪。',x:73,y:68},
 volcano:{id:'volcano',name:'熔光岭',subtitle:'余烬之下仍有生机',color:'#cc7955',level:[8,11],gate:2,habitat:[1,3,14,8],weather:['sun','clear','wind'],guardian:'熔岩守望者 · 岩舟',badge:'余焰徽记',boss:[[14,12],[5,13]],secretType:'stone',secret:'矿脉深处的旧营地',lore:'岩舟不相信蛮力能解决一切。带上潮或森属性伙伴，并留意晴热天气对焰属性的增强。',x:77,y:27},
 sky:{id:'sky',name:'观星原',subtitle:'所有旅途都通向星光',color:'#7b79ab',level:[11,14],gate:3,habitat:[9,10,12,14],weather:['wind','clear','rain'],guardian:'观星守望者 · 星遥',badge:'星穹徽记',boss:[[12,15],[9,15],[15,16]],secretType:'wind',secret:'风中悬桥的星图匣',lore:'星遥守着最后一座灯塔。用岚属性应对星灵，同时为轮换与恢复留出余地。',x:48,y:15}
};
export const WEATHER={clear:{name:'晴朗',desc:'所有属性正常发挥。'},rain:{name:'细雨',desc:'潮伤害 +20%，焰伤害 −20%；晴空雷鸣必中。'},sun:{name:'晴热',desc:'焰伤害 +20%，潮伤害 −20%。'},wind:{name:'微风',desc:'岚伤害 +20%。'}};
export const ITEMS={capsule:{name:'共鸣石',desc:'捕捉野生精灵；血量越低越容易。',price:30},focusCapsule:{name:'澄光共鸣石',desc:'捕捉成功率为普通共鸣石的 1.6 倍。',price:80},potion:{name:'旅途药水',desc:'恢复 45 点生命。',price:25},revive:{name:'复苏露',desc:'让一位倒下的伙伴恢复一半生命。',price:70},antidote:{name:'清心叶',desc:'解除一位伙伴的异常状态。',price:20},candy:{name:'成长星糖',desc:'增加 75 点经验。',price:100},herb:{name:'灵草',desc:'可制作药水和共鸣石。'},fruit:{name:'蜜果',desc:'喂食恢复 20% 生命，羁绊 +8。'},crystal:{name:'碎晶',desc:'共鸣石的制作材料。'}};
export const RECIPES={capsule:{herb:1,crystal:1},focusCapsule:{herb:2,crystal:3},potion:{herb:2},antidote:{herb:1}};
export const QUESTS=[
 {id:'first-friend',name:'不止一位朋友',desc:'成功捕捉 1 次野生精灵。',metric:'captures',goal:1,reward:{coins:70,capsule:3}},
 {id:'collector',name:'口袋里的小世界',desc:'图鉴收集 6 种精灵（包括进化）。',metric:'collection',goal:6,reward:{coins:150,focusCapsule:3}},
 {id:'tactician',name:'读懂元素',desc:'以属性克制命中 5 次。',metric:'effective',goal:5,reward:{coins:100,candy:2}},
 {id:'maker',name:'野外手作',desc:'制作 3 件道具。',metric:'crafted',goal:3,reward:{coins:80,crystal:5}},
 {id:'traveler',name:'风与脚印',desc:'完成 20 次探索或采集。',metric:'steps',goal:20,reward:{coins:150,fruit:5}},
 {id:'beacons',name:'让群岛重新发光',desc:'赢得四位守望者的认可。',metric:'badges',goal:4,reward:{coins:400,focusCapsule:6,candy:4}},
 {id:'all-friends',name:'完整的同行图鉴',desc:'收集全部 16 种精灵。',metric:'collection',goal:16,reward:{coins:600,candy:8}}
];
export const FIELD_EVENTS=[
 {id:'traveler',title:'背包散开的旅人',text:'坡道上，一位旅人的材料散了一地。伙伴已经凑过去闻了闻。',choices:[{label:'一起帮忙整理',detail:'羁绊 +3，获得 2 份灵草',effect:'help'},{label:'交换旅途见闻',detail:'获得 1 枚共鸣石',effect:'trade'}]},
 {id:'spring',title:'藏在石缝中的泉',text:'清泉映出伙伴的模样。水边还有几株带着露珠的草。',choices:[{label:'让队伍休息片刻',detail:'全队恢复 30% 生命',effect:'rest'},{label:'采下清露灵草',detail:'灵草 +3、碎晶 +1',effect:'gather'}]},
 {id:'trace',title:'旧灯塔的刻痕',text:'一块石碑刻着古老的群岛航线。你和伙伴在风里读了很久。',choices:[{label:'描下星路',detail:'全队获得 35 经验',effect:'learn'},{label:'寻找石碑周围',detail:'获得 2 份碎晶和 1 枚蜜果',effect:'search'}]}
];

// Version 2: every species learns six moves; a companion equips four at a time.
Object.assign(MOVES,{
 raincall:{name:'唤潮雨',type:'tide',power:0,pp:5,accuracy:1,effect:'weather',weather:'rain',desc:'将战场变为细雨，持续到被新的天气替换。'},
 suncall:{name:'晴焰祈愿',type:'fire',power:0,pp:5,accuracy:1,effect:'weather',weather:'sun',desc:'将战场变为晴热，强化焰、削弱潮。'},
 windcall:{name:'借风',type:'wind',power:0,pp:5,accuracy:1,effect:'weather',weather:'wind',desc:'唤来微风，使岚属性招式增强 20%。'},
 rootbind:{name:'缠根低语',type:'leaf',power:0,pp:10,accuracy:1,effect:'weaken',desc:'降低对方攻击与灵力一阶。'},
 crack:{name:'破岩纹',type:'stone',power:42,pp:12,accuracy:1,category:'physical',debuff:'defense',desc:'命中后降低对手防御一阶。'},
 tailwind:{name:'轻羽步',type:'wind',power:0,pp:8,accuracy:1,effect:'speed',desc:'自身速度提升一阶。'},
 chorus:{name:'森林合唱',type:'leaf',power:0,pp:4,accuracy:1,effect:'chorus',desc:'为己方所有未倒下的伙伴恢复 20% 最大生命。'},
 mirror:{name:'晶霜镜',type:'frost',power:0,pp:6,accuracy:1,effect:'mirror',desc:'减轻下一次攻击 60% 伤害，并反射实际伤害的 40%。'},
 venomkiss:{name:'梦痕追击',type:'leaf',power:58,pp:10,accuracy:1,category:'special',bonusStatus:true,desc:'对处于任意异常状态的目标，伤害提升 50%。'},
 mossheart:{name:'森心汲取',type:'leaf',power:72,pp:6,accuracy:1,category:'special',drain:.4,desc:'恢复实际伤害的 40% 生命。'},
 flamedive:{name:'琉焰俯冲',type:'fire',power:94,pp:5,accuracy:.95,category:'physical',recoil:.1,desc:'威力 94；自身损失 10% 最大生命。'},
 thunderclaw:{name:'闪爪',type:'spark',power:46,pp:10,accuracy:1,category:'physical',priority:1,desc:'带有优先权的雷属性攻击。'},
 icefang:{name:'寒月之牙',type:'frost',power:64,pp:9,accuracy:1,category:'physical',status:'slow',chance:.6,desc:'60% 概率让对方迟缓 3 回合。'},
 starveil:{name:'星尘洗礼',type:'star',power:48,pp:8,accuracy:1,category:'special',cleanseSelf:true,desc:'攻击命中后，同时清除自身异常状态。'},
 petalstorm:{name:'花铃旋舞',type:'leaf',power:84,pp:6,accuracy:.9,category:'special',desc:'花铃随叶片起舞，命中 90%。'},
 coralstrike:{name:'珊瑚穿浪',type:'tide',power:63,pp:9,accuracy:1,category:'physical',pierce:true,desc:'穿透守护姿态、晶霜镜和防御阶级提升。'},
 stormeye:{name:'风暴之眼',type:'wind',power:80,pp:6,accuracy:.95,category:'special',desc:'穿过风眼的强力灵术，微风时另有天气加成。'},
 glacial:{name:'雪灯引梦',type:'frost',power:62,pp:8,accuracy:1,category:'special',bonusStatus:true,desc:'对异常状态目标伤害提升 50%。'},
 astral:{name:'星轨交汇',type:'star',power:86,pp:5,accuracy:.95,category:'special',desc:'星光沿古老航线交汇，威力 86。'},
 moonpull:{name:'落月牵引',type:'star',power:42,pp:12,accuracy:1,category:'special',debuff:'attack',desc:'命中后降低对方攻击与灵力一阶。'},
 lantern:{name:'归途灯火',type:'fire',power:70,pp:6,accuracy:1,category:'special',drain:.25,desc:'灯火温暖归途，恢复实际伤害的 25% 生命。'}
});
SPECIES.push(
 make(16,'花铃鹿','leaf',[40,15,18,23,23],'雨露','小小的铃兰会随它的脚步摇晃。把安静的陪伴当作最珍贵的礼物。',[[1,'leaf'],[1,'guard'],[5,'rootbind'],[9,'chorus'],[12,'petalstorm'],[16,'mossheart']],{evolves:17,evolveLevel:10,habitat:'萤叶林、林间之卵',ability:'雨天每回合恢复 4% 生命。'}),
 make(17,'森语鹿','leaf',[61,26,31,38,30],'雨露','角间开着四季不同的花。能让暴风后的林子再次响起鸟鸣。',[[1,'leaf'],[1,'guard'],[5,'rootbind'],[9,'chorus'],[12,'petalstorm'],[16,'mossheart']],{habitat:'花铃鹿达到 10 级进化',ability:'雨天每回合恢复 4% 生命。'}),
 make(18,'灰烬猫','fire',[37,24,14,21,25],'余烬','在熄灭的炉火边蜷成一团，用尾尖温暖遗落的信。',[[1,'quick'],[1,'ember'],[5,'suncall'],[9,'lantern'],[12,'flare'],[16,'flamedive']],{evolves:19,evolveLevel:10,habitat:'熔光岭、余烬之卵',ability:'生命低于三分之一时，焰属性伤害提高 25%。'}),
 make(19,'琉焰狮','fire',[60,40,25,32,35],'余烬','琉璃般的鬃毛收着炉火的颜色。会为需要帮助的旅人守夜。',[[1,'quick'],[1,'ember'],[5,'suncall'],[9,'lantern'],[12,'flare'],[16,'flamedive']],{habitat:'灰烬猫达到 10 级进化',ability:'生命低于三分之一时，焰属性伤害提高 25%。'}),
 make(20,'珊瑚马','tide',[49,28,23,25,28],'水润','以珊瑚编成的鬃毛记录潮汐。会把搁浅的小船推回海里。',[[1,'bubble'],[1,'quick'],[5,'raincall'],[9,'coralstrike'],[12,'mist'],[16,'wave']],{habitat:'琉璃湾、潮汐之卵',ability:'赢得战斗后恢复 12% 生命。'}),
 make(21,'雷绒鼬','spark',[39,29,17,22,35],'轻灵','蓬松尾巴里存着细小的电流。兴奋时会为营地的灯充电。',[[1,'spark'],[1,'quick'],[5,'tailwind'],[9,'thunderclaw'],[12,'focus'],[16,'thunder']],{habitat:'萤叶林、熔光岭、余烬之卵',ability:'速度额外提高 10%。'}),
 make(22,'雪灯蛾','frost',[43,16,23,34,28],'冷静','翅膀落下的粉末像小小雪花。腹中的灯引导夜行的伙伴。',[[1,'frost'],[1,'moon'],[5,'mirror'],[9,'glacial'],[12,'icefang'],[16,'starveil']],{habitat:'观星原、星夜之卵',catchRate:.3,ability:'被迟缓时仍保留 75% 速度。'}),
 make(23,'暮星龙','star',[69,33,32,40,32],'共鸣','曾经守住星潮核心，如今愿意重新认识不断变化的世界。喜欢黎明前的海风。',[[1,'moon'],[1,'mist'],[5,'moonpull'],[9,'comet'],[12,'starveil'],[16,'astral']],{habitat:'完成主线结局后，在星潮核心再次相遇',catchRate:.16,ability:'羁绊带来的暴击加成提高一倍。'})
);
const extraLearn={leaf:['venomkiss','mossheart'],fire:['suncall','flamedive'],tide:['raincall','coralstrike'],spark:['thunderclaw','tailwind'],stone:['crack','focus'],wind:['windcall','stormeye'],frost:['mirror','glacial'],star:['moonpull','astral']};
for(const sp of SPECIES.slice(0,16))sp.learn.push([12,extraLearn[sp.type][0]],[16,extraLearn[sp.type][1]]);
REGIONS.forest.habitat.push(16,21);REGIONS.bay.habitat.push(20);REGIONS.volcano.habitat.push(18,21);REGIONS.sky.habitat.push(22);
QUESTS.find(q=>q.id==='all-friends').goal=24;QUESTS.find(q=>q.id==='all-friends').desc='收集全部 24 种精灵。';
Object.assign(ITEMS,EQUIPMENT,TREATS);
for(const [id,t] of Object.entries(TREATS))RECIPES[id]=t.recipe;
Object.assign(RECIPES,{mossCharm:{herb:6,crystal:3},swiftFeather:{herb:3,crystal:5},catchRibbon:{fruit:3,crystal:5}});
