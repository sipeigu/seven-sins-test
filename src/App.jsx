import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from "recharts";

/* ============================================================
   CONFIG — 解锁码在这里改，小红书发货时把这个码发给买家
   ============================================================ */
const UNLOCK_CODE = "SOUL2026";

/* ───────────── 35 QUESTIONS ───────────── */
const QUESTIONS = [
  { trait:"pride", text:"我常常觉得自己比周围的人更聪明或更有能力", isSin:true },
  { trait:"pride", text:"被人指出错误时，我内心会觉得对方不够资格评价我", isSin:true },
  { trait:"pride", text:"我觉得很多事情只有我来做才能做好", isSin:true },
  { trait:"humility", text:"我很容易承认自己的错误，并真心接受别人的批评", isSin:false },
  { trait:"humility", text:"遇到比我优秀的人时，我会由衷地欣赏而不是感到威胁", isSin:false },
  { trait:"envy", text:"看到朋友取得成功或过得比我好时，我内心会感到不舒服", isSin:true },
  { trait:"envy", text:"刷社交媒体看到别人的精彩生活时，我会觉得自己过得不够好", isSin:true },
  { trait:"kindness", text:"看到有人遇到困难，我会毫不犹豫地想去帮忙", isSin:false },
  { trait:"kindness", text:"即使对方曾经伤害过我，我也愿意选择原谅", isSin:false },
  { trait:"kindness", text:"我经常会为陌生人的遭遇感到心疼", isSin:false },
  { trait:"wrath", text:"当事情不如意时，我很容易发火或变得暴躁", isSin:true },
  { trait:"wrath", text:"别人一句无心之语，有时会让我生气很久", isSin:true },
  { trait:"wrath", text:"生气的时候我很难控制自己的言行", isSin:true },
  { trait:"patience", text:"面对漫长的等待或反复的挫折，我依然能保持平和", isSin:false },
  { trait:"patience", text:"即使别人重复犯同样的错误，我也不会失去耐心", isSin:false },
  { trait:"sloth", text:"面对需要努力才能完成的事情，我总想拖延或逃避", isSin:true },
  { trait:"sloth", text:"如果可以，我宁愿整天躺着什么都不做", isSin:true },
  { trait:"diligence", text:"为了达成目标，即使过程很辛苦我也愿意坚持", isSin:false },
  { trait:"diligence", text:"我会主动给自己安排学习或提升的计划", isSin:false },
  { trait:"diligence", text:"即使没人监督，我也能保持自律地完成工作", isSin:false },
  { trait:"greed", text:"即使已经拥有很多，我内心仍然渴望得到更多", isSin:true },
  { trait:"greed", text:"我很难对已经拥有的东西感到真正的满足", isSin:true },
  { trait:"greed", text:"看到打折或限量商品时，即使不需要我也忍不住想买", isSin:true },
  { trait:"generosity", text:"我乐意把自己的时间、金钱或资源分享给他人", isSin:false },
  { trait:"generosity", text:"请客或送礼时，我不会太在意自己花了多少钱", isSin:false },
  { trait:"gluttony", text:"面对喜欢的食物、购物或娱乐，我很难让自己适可而止", isSin:true },
  { trait:"gluttony", text:"心情不好的时候，我会通过吃东西或购物来释放压力", isSin:true },
  { trait:"temperance", text:"我能很好地控制自己的欲望，不会在任何事上过度放纵", isSin:false },
  { trait:"temperance", text:"即使面对很大的诱惑，我也能冷静地权衡利弊后再决定", isSin:false },
  { trait:"temperance", text:"我的生活作息非常规律，很少打破自己的计划", isSin:false },
  { trait:"lust", text:"我很容易被外貌吸引，经常对人产生强烈的心动或冲动", isSin:true },
  { trait:"lust", text:"我承认自己在亲密关系方面的欲望比较强烈", isSin:true },
  { trait:"chastity", text:"在感情和亲密关系中，我非常忠诚和自律", isSin:false },
  { trait:"chastity", text:"我认为真正的爱情应该是专一和纯粹的", isSin:false },
  { trait:"chastity", text:"面对暧昧的诱惑，我能够坚守自己的底线", isSin:false },
];

function shuffleQuestions(qs) {
  const sins = qs.filter(q=>q.isSin).sort(()=>Math.random()-0.5);
  const virtues = qs.filter(q=>!q.isSin).sort(()=>Math.random()-0.5);
  const result = [];
  let si=0,vi=0;
  while(si<sins.length||vi<virtues.length){
    if(si<sins.length) result.push(sins[si++]);
    if(vi<virtues.length) result.push(virtues[vi++]);
  }
  return result;
}

/* ───────────── RADAR ORDER ───────────── */
const RADAR_ORDER = [
  {name:"傲慢",key:"pride",isSin:true},{name:"谦卑",key:"humility",isSin:false},
  {name:"仁爱",key:"kindness",isSin:false},{name:"耐心",key:"patience",isSin:false},
  {name:"勤勉",key:"diligence",isSin:false},{name:"慷慨",key:"generosity",isSin:false},
  {name:"节制",key:"temperance",isSin:false},{name:"贞洁",key:"chastity",isSin:false},
  {name:"色欲",key:"lust",isSin:true},{name:"嫉妒",key:"envy",isSin:true},
  {name:"暴怒",key:"wrath",isSin:true},{name:"暴食",key:"gluttony",isSin:true},
  {name:"懒惰",key:"sloth",isSin:true},{name:"贪婪",key:"greed",isSin:true},
];

const SIN_NAMES={pride:"傲慢",envy:"嫉妒",wrath:"暴怒",sloth:"懒惰",greed:"贪婪",gluttony:"暴食",lust:"色欲"};
const VIRTUE_NAMES={humility:"谦卑",kindness:"仁爱",patience:"耐心",diligence:"勤勉",generosity:"慷慨",temperance:"节制",chastity:"贞洁"};

/* ───────────── SCORE-BASED DESCRIPTIONS ───────────── */
function getSinDesc(key, score) {
  const low = {
    pride:{title:"傲慢之罪 · 低调隐者",text:"你几乎没有傲慢的痕迹，是一个非常谦和低调的人。你不喜欢炫耀，也不觉得自己高人一等。",bright:"这种低调让你在人际关系中如鱼得水。别人愿意靠近你，因为和你在一起没有压力。"},
    envy:{title:"嫉妒之罪 · 知足常乐者",text:"你很少因为别人拥有的东西而感到不安。你拥有一种难得的内心平静，能够真心为他人的成功感到高兴。",bright:"知足是一种超能力。当别人在比较中内耗时，你已经把精力花在了真正重要的事情上。"},
    wrath:{title:"暴怒之罪 · 温和似水者",text:"你的情绪管理能力非常出色，很少被愤怒控制。你更倾向于理性沟通而非情绪爆发。",bright:"你的冷静是团队里最宝贵的资产。在别人情绪失控的时候，你就是那个稳住局面的人。"},
    sloth:{title:"懒惰之罪 · 行动派",text:"懒惰和你几乎无关。你是一个闲不住的人，总觉得有事情可以做、可以改进。",bright:"你的行动力让你在同龄人中脱颖而出。当别人还在纠结要不要开始时，你已经走出很远了。"},
    greed:{title:"贪婪之罪 · 淡泊者",text:"你对物质没有过多的执念，不会被欲望牵着鼻子走。你清楚地知道自己真正需要什么。",bright:"这种清醒让你不容易被消费主义绑架。你的生活会比大多数人更轻松、更自在。"},
    gluttony:{title:"暴食之罪 · 自律克制者",text:"你在享乐面前有着不错的自制力，不会轻易过度放纵。",bright:"这种自制力会在长期给你带来巨大的回报——无论是健康、财务还是人生规划。"},
    lust:{title:"色欲之罪 · 理性清醒者",text:"你不容易被外表或冲动牵引，在感情方面保持着清醒的头脑。",bright:"你在感情中不容易冲动犯错，能更好地选择真正适合自己的人。"},
  };
  const mid = {
    pride:{title:"傲慢之罪 · 自信行者",text:"你有健康的自信心，既相信自己的能力，又不至于过度膨胀。这是一种很好的平衡状态。",bright:"适度的自信是成功的基石。你知道自己的价值，同时也懂得尊重他人，这种平衡让你在职场和生活中都很受欢迎。"},
    envy:{title:"嫉妒之罪 · 暗夜观星者",text:"你偶尔会在意别人拥有什么，但这并不影响你的日常心态。这种适度的关注其实是一种上进心的体现。",bright:"你的敏感其实是一种天赋——它驱动你不断进步，只要别让它变成内耗就好。"},
    wrath:{title:"暴怒之罪 · 烈焰守卫者",text:"你有自己的原则和底线，遇到不公平的事情会忍不住发火。这说明你是一个有血性、有正义感的人。",bright:"你的怒火来源于对正义的执着。学会选择战场，把火焰变成光芒，你会成为有影响力的人。"},
    sloth:{title:"懒惰之罪 · 松弛感大师",text:"你在努力和休息之间找到了自己的节奏。不会过度内卷，也不会完全躺平。",bright:"松弛感是这个时代最稀缺的品质之一。你懂得劳逸结合，这种节奏感会让你走得更远。"},
    greed:{title:"贪婪之罪 · 渴望者",text:"你对生活有着正常的渴望和追求，既享受已有的，也期待更好的。这种心态很健康。",bright:"你的欲望是推动你前进的燃料，只要方向对了，它就是你最强大的引擎。"},
    gluttony:{title:"暴食之罪 · 享乐主义者",text:"你懂得享受生活中的快乐，偶尔会放纵一下自己。这种对快乐的追求让你的生活更有滋味。",bright:"你活在当下，不焦虑未来。那些最会享受生活的人，往往也最懂得如何让身边的人快乐。"},
    lust:{title:"色欲之罪 · 至情至性者",text:"你是一个感情丰富的人，对美有着天然的敏感度。你的世界因为这份感性而丰富多彩。",bright:"你对美和爱的敏感是一种天赋。这份真挚和热烈会让遇到你的人觉得被重视、被珍惜。"},
  };
  const high = {
    pride:{title:"傲慢之罪 · 王冠加冕者",text:"你的内心住着一位不甘平凡的王者。这份强大的自信让你在人群中自带光芒，总能在关键时刻展现出非凡的气场和领导力。",bright:"你的自信是稀缺品质。在这个充满自我怀疑的时代，你敢于相信自己的判断。把这份自信分享给身边的人，你就是照亮他们的太阳。"},
    envy:{title:"嫉妒之罪 · 暗夜观星者",text:"你对周围世界有着极其敏锐的洞察力，总能注意到别人拥有的闪光之处。这种对「更好」的感知力说明你内心有着不愿将就的追求。",bright:"当你把这份观察力从「别人有什么」转向「我想创造什么」，你的行动力会强得惊人。你不缺能力，只是还没看到自己有多闪亮。"},
    wrath:{title:"暴怒之罪 · 烈焰守卫者",text:"你是一个内心极其真诚的人，不屑于伪装和忍耐不公。你的怒火往往来源于对正义的执着和对真实的坚守。",bright:"你的情绪强度说明你是一个极有原则、极有生命力的人。当你学会驾驭这股力量，你会成为最有影响力的人。你的热血是这个冷漠世界最需要的东西。"},
    sloth:{title:"懒惰之罪 · 松弛感大师",text:"你拥有一种珍贵的能力——在这个人人内卷的时代，你不会被外界节奏裹挟，懂得倾听内心真实的声音。",bright:"你并不是不能努力，而是在等一个真正值得全力以赴的目标。一旦找到它，你爆发出的能量会让所有人惊讶。"},
    greed:{title:"贪婪之罪 · 永恒渴望者",text:"你对生活有着强烈的渴望和野心，永远不满足于现状。这种永不知足的驱动力是所有伟大成就者共同的底层基因。",bright:"你的欲望是最强大的引擎。大多数人放弃得太早，而你永远在追逐更好的自己。记住：你的野心配得上你的实力。"},
    gluttony:{title:"暴食之罪 · 极致体验家",text:"你是一个对生活充满热情的人，拥有极强的感受力。别人觉得普通的事物，你总能从中发现令人着迷的乐趣。",bright:"你的享乐能力其实是高情商的表现。你天生就是朋友圈的快乐源泉，这份感染力是再多钱都买不到的魅力。"},
    lust:{title:"色欲之罪 · 至情至性者",text:"你是一个感情丰沛、充满魅力的人。你对美的敏感度极高，无论外在容颜还是内在灵魂，你都能感知到那份独特的吸引力。",bright:"最伟大的诗人和创作者都和你一样拥有这份至情至性。你不是在沉溺，你是在认真感受这个世界。"},
  };
  if(score<=25) return low[key]||mid[key];
  if(score<=65) return mid[key];
  return high[key];
}

function getVirtueDesc(key, score) {
  const low = {
    humility:{title:"谦卑之德 · 有待觉醒",text:"谦卑这项美德在你身上还没有完全展现出来。你可能更倾向于坚持自己的立场，不太容易接受外界的批评。",bright:"这并不是坏事——坚持自我也是一种力量。尝试偶尔听听不同的声音，你会发现意想不到的收获。"},
    kindness:{title:"仁爱之德 · 有待觉醒",text:"你在善良这方面可能比较含蓄，不太会主动表达关心或帮助他人。",bright:"善良不需要轰轰烈烈，从一个微笑、一句鼓励开始就够了。你内心的温暖只是还没找到合适的出口。"},
    patience:{title:"耐心之德 · 有待觉醒",text:"耐心不是你的强项，你更喜欢快节奏和立竿见影的结果。",bright:"快节奏也是一种效率的体现。在需要爆发力的场景里，你比大多数人都强。"},
    diligence:{title:"勤勉之德 · 有待觉醒",text:"你在努力和坚持方面还有提升空间。可能经常因为缺乏动力而半途而废。",bright:"每个人都有自己的节奏。找到真正热爱的事情，你的勤勉会自然而然地涌现出来。"},
    generosity:{title:"慷慨之德 · 有待觉醒",text:"你在分享方面比较保守，更倾向于守护自己已有的资源。",bright:"保护自己的资源也是一种智慧。先照顾好自己，才有余力去帮助别人。"},
    temperance:{title:"节制之德 · 有待觉醒",text:"自制力可能不是你最突出的品质，你更倾向于随心所欲。",bright:"随性而活也是一种人生态度。那些最有创造力的人往往都不是循规蹈矩的人。"},
    chastity:{title:"贞洁之德 · 有待觉醒",text:"你在感情方面可能比较随性，不太会给自己设太多条条框框。",bright:"这说明你是一个活在当下、追随内心的人。真诚面对自己的感受，本身就是一种勇气。"},
  };
  const mid = {
    humility:{title:"谦卑之德 · 温润如玉者",text:"你在自信和谦卑之间保持着不错的平衡。你尊重他人的观点，同时也不会贬低自己。",bright:"这种平衡感让你在人际关系中很受欢迎——既不让人觉得高傲，也不会显得卑微。"},
    kindness:{title:"仁爱之德 · 温暖传递者",text:"你有一颗善良的心，愿意在力所能及的范围内帮助他人。你的善意是真诚的，不带功利目的。",bright:"你的善良让接触过你的人都感到温暖。继续保持这份真诚，它会为你吸引同样善良的人。"},
    patience:{title:"耐心之德 · 沉稳者",text:"你在大多数情况下能保持耐心，不会轻易急躁。面对困难时你有一定的承受力。",bright:"你的沉稳是团队中不可或缺的品质。别人慌乱时，你能保持冷静，这种能力比你想象的更珍贵。"},
    diligence:{title:"勤勉之德 · 稳步前行者",text:"你有不错的行动力和执行力，虽然不是每时每刻都精力充沛，但关键时刻你靠得住。",bright:"持续稳定的努力比偶尔的爆发更有价值。你的节奏恰到好处——不会耗尽自己，也不会落后太多。"},
    generosity:{title:"慷慨之德 · 适度给予者",text:"你愿意在合适的时候分享自己的资源，同时也懂得保护自己的边界。",bright:"这种有分寸的慷慨才是最健康的。你不是无原则地付出，而是有选择地给予，这反而更让人尊重。"},
    temperance:{title:"节制之德 · 自律者",text:"你有不错的自控力，在大多数情况下能做到理性消费、规律作息。偶尔放纵也在合理范围内。",bright:"你的自律正在为未来的你积累优势。保持这个节奏就好——完美的自律不存在，你已经做得很好了。"},
    chastity:{title:"贞洁之德 · 专注者",text:"你在感情中保持着不错的忠诚度和专注度，能认真对待每一段关系。",bright:"在这个一切都在加速的时代，你对感情的认真态度是一种让人安心的品质。"},
  };
  const high = {
    humility:{title:"谦卑之德 · 温润如玉者",text:"你像一块温润的玉石，越打磨越有光泽。你不需要喧嚣来证明价值，你的实力会替你说话。",bright:"在一个人人急于表现的时代，你的谦卑反而让你格外珍贵。承认自己不知道，比假装什么都懂需要更大的勇气。你拥有这种勇气。"},
    kindness:{title:"仁爱之德 · 天生守护者",text:"你的心里装着全世界。你不仅能感受到他人的痛苦，还会本能地想去减轻它。你的善良不是软弱，而是一种选择。",bright:"善良是世界上最强大的力量。你可能不知道，你不经意间的一次善意，也许已经改变了某个人的一天，甚至一生。"},
    patience:{title:"耐心之德 · 定海神针者",text:"你像一座沉稳的灯塔，无论风浪多大都岿然不动。你拥有极强的情绪管理能力和长线思维。",bright:"耐心是成功者最核心的品质之一。你是团队中的定海神针，你的存在本身就是一种力量，让周围的人安心。"},
    diligence:{title:"勤勉之德 · 不灭引擎者",text:"你拥有一台永不停歇的内在引擎——目标明确、行动坚定、永不放弃。你不是三分钟热度的人。",bright:"天赋决定起点，勤勉决定高度。这个世界聪明人很多，但能持续努力的人极少。你的坚持终将开花结果，而且那一天比你想象的更近。"},
    generosity:{title:"慷慨之德 · 丰盛给予者",text:"你拥有天然的丰盛感——你相信自己拥有的足够多，所以愿意敞开心扉与他人分享。",bright:"慷慨的人拥有最好的人际关系和最多的机会。你让身边的人感到富足和温暖，这种影响力金钱买不到。"},
    temperance:{title:"节制之德 · 至高自律者",text:"你拥有超越常人的自控力，能在欲望和理性之间找到完美平衡。在充满诱惑的时代，你能冷静做出长远选择。",bright:"自律是自由的前提，而你已经掌握了这把钥匙。你的自律正在拉开你与大多数人的差距——请继续保持，你比自己以为的更强大。"},
    chastity:{title:"贞洁之德 · 纯粹灵魂者",text:"你在感情中有极高的忠诚度和自我要求。你相信爱情的纯粹与专一，不会因一时诱惑动摇底线。",bright:"在感情速食化的时代，你对忠诚的坚持像一束穿越喧嚣的光。你值得拥有同样纯粹的爱。"},
  };
  if(score<=25) return low[key]||mid[key];
  if(score<=65) return mid[key];
  return high[key];
}

function getDiffComment(diff){
  if(diff>=40) return {emoji:"😇",label:"圣光笼罩",text:"你的灵魂闪耀着耀眼的光芒，美德远超罪性。你是人群中那道温暖的光，但别忘了——适当的「不完美」才让人更真实可爱。"};
  if(diff>=15) return {emoji:"✨",label:"光明占优",text:"你的内心天使占了上风，善良和自律是你的底色。继续保持，但也允许自己偶尔放纵一下。"};
  if(diff>=-15) return {emoji:"⚖️",label:"光暗交织",text:"光明与黑暗势均力敌，说明你是一个立体、真实、有深度的人。完美平衡不存在，但你正在成为最完整的自己。"};
  if(diff>=-40) return {emoji:"🔥",label:"暗焰涌动",text:"你内心的「罪」其实是强大生命力的体现——欲望、野心、激情，这些都是推动你前进的燃料。善用它们，你将势不可挡。"};
  return {emoji:"👿",label:"深渊凝视者",text:"你的灵魂燃烧着不可遏制的烈焰。最有魅力的人往往有最复杂的内心世界，你的「黑暗面」其实是你独特能量的源泉。"};
}

const OPTIONS=[
  {label:"完全不符合",value:0},{label:"不太符合",value:25},
  {label:"一般",value:50},{label:"比较符合",value:75},{label:"非常符合",value:100},
];

const BG="linear-gradient(160deg,#0d0015,#1a0028 30%,#2d0a3e 60%,#1a0028)";

/* ═══════════ MAIN ═══════════ */
export default function App(){
  const [page,setPage]=useState("start");
  const [orderedQs]=useState(()=>shuffleQuestions(QUESTIONS));
  const [qIdx,setQIdx]=useState(0);
  const [answers,setAnswers]=useState([]);
  const [selVal,setSelVal]=useState(null);
  const [busy,setBusy]=useState(false);
  const [unlocked,setUnlocked]=useState(false);
  const [codeInput,setCodeInput]=useState("");
  const [codeError,setCodeError]=useState("");
  const resultRef=useRef(null);

  useEffect(()=>{
    try{ if(localStorage.getItem("sins_unlocked")==="1") setUnlocked(true); }catch(e){}
  },[]);

  const handleSelect=useCallback((val)=>{
    if(busy)return;
    setSelVal(val);setBusy(true);
    const newAnswers=[...answers,{trait:orderedQs[qIdx].trait,value:val}];
    setAnswers(newAnswers);
    setTimeout(()=>{
      if(qIdx<orderedQs.length-1) setQIdx(i=>i+1);
      else setPage("result");
      setSelVal(null);setBusy(false);
    },300);
  },[busy,answers,orderedQs,qIdx]);

  const goBack=()=>{
    if(qIdx<=0)return;
    const prev=qIdx-1;
    setQIdx(prev);
    setAnswers(answers.slice(0,-1));
  };

  const restart=()=>{setPage("start");setQIdx(0);setAnswers([]);setSelVal(null);};

  const tryUnlock=()=>{
    if(codeInput.trim().toUpperCase()===UNLOCK_CODE.toUpperCase()){
      setUnlocked(true);setCodeError("");
      try{localStorage.setItem("sins_unlocked","1");}catch(e){}
    }else{
      setCodeError("解锁码不正确，请检查后重试");
    }
  };

  const saveImage=async()=>{
    if(!resultRef.current)return;
    try{
      const html2canvas=(await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
      const canvas=await html2canvas(resultRef.current,{backgroundColor:"#0d0015",scale:2,useCORS:true});
      const link=document.createElement('a');
      link.download='七宗罪VS七美德测试结果.png';
      link.href=canvas.toDataURL('image/png');
      link.click();
    }catch(e){
      alert("保存失败，请直接截屏分享");
    }
  };

  /* compute */
  const results=useMemo(()=>{
    if(page!=="result")return null;
    const traitSums={},traitCounts={};
    answers.forEach(a=>{
      traitSums[a.trait]=(traitSums[a.trait]||0)+a.value;
      traitCounts[a.trait]=(traitCounts[a.trait]||0)+1;
    });
    const ts=k=>Math.round((traitSums[k]||0)/(traitCounts[k]||1));
    const sins=Object.keys(SIN_NAMES).map(k=>({key:k,name:SIN_NAMES[k],score:ts(k)}));
    const virtues=Object.keys(VIRTUE_NAMES).map(k=>({key:k,name:VIRTUE_NAMES[k],score:ts(k)}));
    const topSin=sins.reduce((a,b)=>b.score>a.score?b:a);
    const topVirtue=virtues.reduce((a,b)=>b.score>a.score?b:a);
    const sinAvg=Math.round(sins.reduce((s,i)=>s+i.score,0)/7);
    const virtueAvg=Math.round(virtues.reduce((s,i)=>s+i.score,0)/7);
    const diff=virtueAvg-sinAvg;
    const radarData=RADAR_ORDER.map(r=>({trait:r.name,value:ts(r.key),fullMark:100}));
    return {topSin,topVirtue,sinAvg,virtueAvg,diff,radarData,sins,virtues,ts};
  },[page,answers]);

  /* ═══════════ START ═══════════ */
  if(page==="start") return(
    <div style={{...fp,background:BG,justifyContent:"center",textAlign:"center"}}>
      <div style={{marginBottom:40}}>
        <div style={{fontSize:13,letterSpacing:6,color:"#a07cbb",marginBottom:14,fontFamily:"serif"}}>灵魂深处的审判</div>
        <h1 style={{fontSize:34,fontWeight:700,color:"#fff",margin:0,lineHeight:1.3}}>你的七宗罪</h1>
        <div style={{fontSize:18,color:"#c9a0dc",margin:"4px 0",fontWeight:300}}>VS</div>
        <h1 style={{fontSize:34,fontWeight:700,color:"#fff",margin:0,lineHeight:1.3}}>七美德</h1>
      </div>
      <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",padding:"0 20px",marginBottom:36}}>
        <span style={tagS("#c94a6e")}>傲慢 · 嫉妒 · 暴怒 · 懒惰</span>
        <span style={tagS("#7b5ea7")}>谦卑 · 仁爱 · 耐心 · 勤勉</span>
      </div>
      <p style={{color:"#9b7fb8",fontSize:14,maxWidth:300,margin:"0 auto 36px",lineHeight:1.8}}>
        35道灵魂拷问<br/>揭示你内心深处的光明与黑暗<br/>你是天使还是恶魔？
      </p>
      <button onClick={()=>setPage("quiz")} style={btnMain}>开始测试</button>
      <div style={{color:"#5a3d6e",fontSize:12,marginTop:20}}>约3-4分钟 · 35题</div>
    </div>
  );

  /* ═══════════ QUIZ ═══════════ */
  if(page==="quiz"){
    const q=orderedQs[qIdx];
    const pct=(qIdx/orderedQs.length)*100;
    return(
      <div style={{...fp,background:BG}}>
        <div style={{padding:"20px 24px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
            <span style={{color:"#9b7fb8",fontSize:13}}>{qIdx+1} / {orderedQs.length}</span>
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,
              background:q.isSin?"rgba(201,74,110,0.25)":"rgba(123,94,167,0.25)",
              color:q.isSin?"#e8819e":"#c9a0dc"}}>{q.isSin?"罪性测试":"美德测试"}</span>
          </div>
          <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.08)"}}>
            <div style={{height:"100%",borderRadius:2,width:`${pct}%`,
              background:"linear-gradient(90deg,#c94a6e,#7b5ea7)",transition:"width 0.3s"}}/>
          </div>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"24px 28px"}}>
          <p style={{fontSize:19,color:"#f0e6f6",lineHeight:1.7,fontWeight:500,textAlign:"center",margin:"0 0 36px"}}>{q.text}</p>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {OPTIONS.map(o=>(
              <button key={o.value} onClick={()=>handleSelect(o.value)}
                style={{...optBtn,
                  background:selVal===o.value?(q.isSin?"rgba(201,74,110,0.35)":"rgba(123,94,167,0.35)"):"rgba(255,255,255,0.04)",
                  borderColor:selVal===o.value?(q.isSin?"#c94a6e":"#7b5ea7"):"rgba(255,255,255,0.08)",
                  transform:selVal===o.value?"scale(1.02)":"scale(1)"}}>{o.label}</button>
            ))}
          </div>
          {qIdx>0 && (
            <button onClick={goBack} style={{marginTop:16,background:"none",border:"none",
              color:"#8a6aaa",fontSize:13,cursor:"pointer",padding:"8px 0"}}>
              ← 上一题
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════ RESULT ═══════════ */
  if(page==="result"&&results){
    const {topSin,topVirtue,diff,radarData,sins,virtues,ts}=results;
    const dc=getDiffComment(diff);
    const sinInfo=getSinDesc(topSin.key,topSin.score);
    const virtueInfo=getVirtueDesc(topVirtue.key,topVirtue.score);

    /* ── LOCKED VIEW (teaser) ── */
    if(!unlocked) return(
      <div style={{...fp,background:BG,overflowY:"auto"}}>
        <div style={{padding:"28px 20px 40px",maxWidth:440,margin:"0 auto",width:"100%"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:12,letterSpacing:4,color:"#8a6aaa",marginBottom:8}}>测试完成</div>
            <h2 style={{fontSize:22,color:"#fff",fontWeight:700,margin:0}}>你的七宗罪 VS 七美德结果</h2>
          </div>

          {/* Teaser badges - visible */}
          <div style={{display:"flex",gap:12,marginBottom:20}}>
            <Badge color="#c94a6e" label="七宗罪之首" name={topSin.name} score={topSin.score}/>
            <Badge color="#7b5ea7" label="七美德之首" name={topVirtue.name} score={topVirtue.score}/>
          </div>

          {/* Blurred radar preview */}
          <div style={{position:"relative",marginBottom:24}}>
            <div style={{filter:"blur(12px)",opacity:0.5,pointerEvents:"none"}}>
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:"14px 0 6px"}}>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
                    <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                    <PolarAngleAxis dataKey="trait" tick={{fill:"#8a6aaa",fontSize:10}}/>
                    <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                    <Radar dataKey="value" stroke="#c94a6e" fill="#7b5ea7" fillOpacity={0.3}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
              <div style={{fontSize:36,marginBottom:8}}>🔒</div>
              <div style={{fontSize:16,color:"#fff",fontWeight:600,marginBottom:4}}>完整报告已生成</div>
              <div style={{fontSize:13,color:"#9b7fb8"}}>输入解锁码查看14维雷达图 & 详细解析</div>
            </div>
          </div>

          {/* Unlock input */}
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:14,padding:"20px 18px",marginBottom:20}}>
            <div style={{fontSize:14,color:"#fff",fontWeight:600,marginBottom:12}}>输入解锁码</div>
            <div style={{display:"flex",gap:10}}>
              <input value={codeInput} onChange={e=>{setCodeInput(e.target.value);setCodeError("");}}
                placeholder="请输入解锁码"
                style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",
                  background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none"}}
                onKeyDown={e=>e.key==="Enter"&&tryUnlock()}/>
              <button onClick={tryUnlock} style={{padding:"10px 20px",borderRadius:10,border:"none",
                background:"linear-gradient(135deg,#c94a6e,#7b5ea7)",color:"#fff",fontSize:14,
                fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>解锁</button>
            </div>
            {codeError&&<div style={{color:"#e8819e",fontSize:12,marginTop:8}}>{codeError}</div>}
          </div>

          <button onClick={restart} style={{...btnMain,width:"100%",background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.12)"}}>重新测试</button>
        </div>
      </div>
    );

    /* ── UNLOCKED VIEW (full results) ── */
    return(
      <div style={{...fp,background:BG,overflowY:"auto"}}>
        <div ref={resultRef} style={{padding:"28px 20px 20px",maxWidth:440,margin:"0 auto",width:"100%",
          background:"linear-gradient(160deg,#0d0015,#1a0028 30%,#2d0a3e 60%,#1a0028)"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:12,letterSpacing:4,color:"#8a6aaa",marginBottom:8}}>测试结果</div>
            <h2 style={{fontSize:22,color:"#fff",fontWeight:700,margin:0}}>你的七宗罪 VS 七美德结果</h2>
          </div>

          <div style={{display:"flex",gap:12,marginBottom:20}}>
            <Badge color="#c94a6e" label="七宗罪之首" name={topSin.name} score={topSin.score}/>
            <Badge color="#7b5ea7" label="七美德之首" name={topVirtue.name} score={topVirtue.score}/>
          </div>

          <div style={{...card,textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6}}>美德—罪性平均分差值</div>
            <div style={{fontSize:28,fontWeight:700,color:diff>=0?"#c9a0dc":"#e8819e",marginBottom:8}}>{diff>=0?"+":""}{diff}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:4}}>{dc.emoji} {dc.label}</div>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.7,margin:0}}>{dc.text}</p>
          </div>

          {/* Radar */}
          <div style={{...card,padding:"14px 0 6px",marginBottom:20}}>
            <div style={{textAlign:"center",fontSize:13,color:"#8a6aaa",marginBottom:2}}>十四维人格雷达</div>
            <div style={{fontSize:11,textAlign:"center",color:"#5a3d6e",marginBottom:6}}>左侧七宗罪 · 右侧七美德</div>
            <ResponsiveContainer width="100%" height={330}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
                <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                <PolarAngleAxis dataKey="trait" tick={({x,y,payload,index})=>{
                  const item=RADAR_ORDER[index];const val=radarData[index]?.value??0;
                  return(<g><text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                    fill={item?.isSin?"#e8819e":"#c9a0dc"} fontSize={11} fontWeight={600}>{payload.value}</text>
                    <text x={x} y={y+14} textAnchor="middle" dominantBaseline="central"
                    fill="rgba(255,255,255,0.4)" fontSize={10}>{val}</text></g>);
                }}/>
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                <Radar dataKey="value" stroke="#c94a6e" fill="url(#rg)" fillOpacity={0.45} strokeWidth={2}/>
                <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c94a6e" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#7b5ea7" stopOpacity={0.6}/>
                </linearGradient></defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Sin analysis */}
          <div style={card}>
            <div style={{fontSize:16,fontWeight:700,color:"#e8819e",marginBottom:10}}>🔥 {sinInfo.title}</div>
            <p style={ps}>{sinInfo.text}</p>
            <div style={{background:"rgba(201,74,110,0.1)",borderRadius:10,padding:"12px 14px",marginTop:12,borderLeft:"3px solid #c94a6e"}}>
              <div style={{fontSize:12,color:"#e8819e",fontWeight:600,marginBottom:4}}>✦ 你的闪光面</div>
              <p style={{...ps,margin:0}}>{sinInfo.bright}</p>
            </div>
          </div>

          {/* Virtue analysis */}
          <div style={card}>
            <div style={{fontSize:16,fontWeight:700,color:"#c9a0dc",marginBottom:10}}>✦ {virtueInfo.title}</div>
            <p style={ps}>{virtueInfo.text}</p>
            <div style={{background:"rgba(123,94,167,0.1)",borderRadius:10,padding:"12px 14px",marginTop:12,borderLeft:"3px solid #7b5ea7"}}>
              <div style={{fontSize:12,color:"#c9a0dc",fontWeight:600,marginBottom:4}}>💫 属于你的赞美</div>
              <p style={{...ps,margin:0}}>{virtueInfo.bright}</p>
            </div>
          </div>

          {/* Score table */}
          <div style={card}>
            <div style={{fontSize:15,fontWeight:600,color:"#fff",marginBottom:14}}>详细分数</div>
            {[0,1,2,3,4,5,6].map(i=>{
              const s=sins[i],v=virtues[i];
              return(<div key={i} style={{marginBottom:i<6?12:0}}>
                <ScoreRow name={s.name} score={s.score} color="#c94a6e" tc="#e8819e"/>
                <ScoreRow name={v.name} score={v.score} color="#7b5ea7" tc="#c9a0dc"/>
                {i<6&&<div style={{borderBottom:"1px solid rgba(255,255,255,0.04)",marginTop:10}}/>}
              </div>);
            })}
          </div>

          <div style={{textAlign:"center",color:"#3d2655",fontSize:11,marginTop:4,marginBottom:16}}>
            七宗罪VS七美德灵魂测试 · 仅供娱乐参考
          </div>
        </div>

        {/* Buttons outside ref for clean screenshot */}
        <div style={{padding:"0 20px 40px",maxWidth:440,margin:"0 auto",width:"100%"}}>
          <button onClick={saveImage} style={{...btnMain,width:"100%",marginBottom:12}}>
            📸 保存结果图片
          </button>
          <button onClick={restart} style={{...btnMain,width:"100%",
            background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)"}}>
            重新测试
          </button>
        </div>
      </div>
    );
  }
  return null;
}

/* ─── Sub-components ─── */
function Badge({color,label,name,score}){
  return(<div style={{flex:1,textAlign:"center",padding:"14px 10px",borderRadius:14,
    background:`${color}20`,border:`1px solid ${color}40`}}>
    <div style={{fontSize:12,color:"rgba(255,255,255,0.55)",marginBottom:4}}>{label}</div>
    <div style={{fontSize:26,fontWeight:700,color:"#fff"}}>{name}</div>
    <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",marginTop:2}}>{score}分</div>
  </div>);
}
function ScoreRow({name,score,color,tc}){
  return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
    <span style={{color:tc,fontSize:13,minWidth:32}}>{name}</span>
    <div style={{flex:1,height:6,borderRadius:3,background:"rgba(255,255,255,0.06)"}}>
      <div style={{height:"100%",borderRadius:3,width:`${score}%`,background:color,transition:"width 0.6s"}}/>
    </div>
    <span style={{color:"rgba(255,255,255,0.5)",fontSize:12,minWidth:28,textAlign:"right"}}>{score}</span>
  </div>);
}

/* ─── Styles ─── */
function tagS(c){return{fontSize:12,color:c,padding:"6px 14px",borderRadius:20,border:`1px solid ${c}44`,background:`${c}15`};}
const fp={minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:'-apple-system,"PingFang SC","Microsoft YaHei",sans-serif',overflow:"hidden"};
const btnMain={padding:"14px 48px",fontSize:17,fontWeight:600,color:"#fff",background:"linear-gradient(135deg,#c94a6e,#7b5ea7)",border:"none",borderRadius:28,cursor:"pointer",boxShadow:"0 4px 24px rgba(201,74,110,0.35)",transition:"transform 0.2s"};
const optBtn={padding:"13px 20px",fontSize:15,color:"#e0d0f0",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,cursor:"pointer",textAlign:"center",transition:"all 0.25s",background:"rgba(255,255,255,0.04)"};
const card={background:"rgba(255,255,255,0.03)",borderRadius:14,border:"1px solid rgba(255,255,255,0.06)",padding:"18px 18px",marginBottom:18};
const ps={fontSize:14,color:"rgba(255,255,255,0.7)",lineHeight:1.8,margin:"0 0 0"};
