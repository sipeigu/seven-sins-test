import { useState, useMemo, useCallback } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from "recharts";

/* ───────────── 35 QUESTIONS ───────────── */
const QUESTIONS = [
  // ── Pride 傲慢 ×3 ──
  { trait:"pride", text:"我常常觉得自己比周围的人更聪明或更有能力", isSin:true },
  { trait:"pride", text:"被人指出错误时，我内心会觉得对方不够资格评价我", isSin:true },
  { trait:"pride", text:"我觉得很多事情只有我来做才能做好", isSin:true },
  // ── Humility 谦卑 ×2 ──
  { trait:"humility", text:"我很容易承认自己的错误，并真心接受别人的批评", isSin:false },
  { trait:"humility", text:"遇到比我优秀的人时，我会由衷地欣赏而不是感到威胁", isSin:false },
  // ── Envy 嫉妒 ×2 ──
  { trait:"envy", text:"看到朋友取得成功或过得比我好时，我内心会感到不舒服", isSin:true },
  { trait:"envy", text:"刷社交媒体看到别人的精彩生活时，我会觉得自己过得不够好", isSin:true },
  // ── Kindness 仁爱 ×3 ──
  { trait:"kindness", text:"看到有人遇到困难，我会毫不犹豫地想去帮忙", isSin:false },
  { trait:"kindness", text:"即使对方曾经伤害过我，我也愿意选择原谅", isSin:false },
  { trait:"kindness", text:"我经常会为陌生人的遭遇感到心疼", isSin:false },
  // ── Wrath 暴怒 ×3 ──
  { trait:"wrath", text:"当事情不如意时，我很容易发火或变得暴躁", isSin:true },
  { trait:"wrath", text:"别人一句无心之语，有时会让我生气很久", isSin:true },
  { trait:"wrath", text:"生气的时候我很难控制自己的言行", isSin:true },
  // ── Patience 耐心 ×2 ──
  { trait:"patience", text:"面对漫长的等待或反复的挫折，我依然能保持平和", isSin:false },
  { trait:"patience", text:"即使别人重复犯同样的错误，我也不会失去耐心", isSin:false },
  // ── Sloth 懒惰 ×2 ──
  { trait:"sloth", text:"面对需要努力才能完成的事情，我总想拖延或逃避", isSin:true },
  { trait:"sloth", text:"如果可以，我宁愿整天躺着什么都不做", isSin:true },
  // ── Diligence 勤勉 ×3 ──
  { trait:"diligence", text:"为了达成目标，即使过程很辛苦我也愿意坚持", isSin:false },
  { trait:"diligence", text:"我会主动给自己安排学习或提升的计划", isSin:false },
  { trait:"diligence", text:"即使没人监督，我也能保持自律地完成工作", isSin:false },
  // ── Greed 贪婪 ×3 ──
  { trait:"greed", text:"即使已经拥有很多，我内心仍然渴望得到更多", isSin:true },
  { trait:"greed", text:"我很难对已经拥有的东西感到真正的满足", isSin:true },
  { trait:"greed", text:"看到打折或限量商品时，即使不需要我也忍不住想买", isSin:true },
  // ── Generosity 慷慨 ×2 ──
  { trait:"generosity", text:"我乐意把自己的时间、金钱或资源分享给他人", isSin:false },
  { trait:"generosity", text:"请客或送礼时，我不会太在意自己花了多少钱", isSin:false },
  // ── Gluttony 暴食 ×2 ──
  { trait:"gluttony", text:"面对喜欢的食物、购物或娱乐，我很难让自己适可而止", isSin:true },
  { trait:"gluttony", text:"心情不好的时候，我会通过吃东西或购物来释放压力", isSin:true },
  // ── Temperance 节制 ×3 ──
  { trait:"temperance", text:"我能很好地控制自己的欲望，不会在任何事上过度放纵", isSin:false },
  { trait:"temperance", text:"即使面对很大的诱惑，我也能冷静地权衡利弊后再决定", isSin:false },
  { trait:"temperance", text:"我的生活作息非常规律，很少打破自己的计划", isSin:false },
  // ── Lust 色欲 ×2 ──
  { trait:"lust", text:"我很容易被外貌吸引，经常对人产生强烈的心动或冲动", isSin:true },
  { trait:"lust", text:"我承认自己在亲密关系方面的欲望比较强烈", isSin:true },
  // ── Chastity 贞洁 ×3 ──
  { trait:"chastity", text:"在感情和亲密关系中，我非常忠诚和自律", isSin:false },
  { trait:"chastity", text:"我认为真正的爱情应该是专一和纯粹的", isSin:false },
  { trait:"chastity", text:"面对暧昧的诱惑，我能够坚守自己的底线", isSin:false },
];

// Shuffle: interleave sin/virtue, randomize within groups
function shuffleQuestions(qs) {
  const sins = qs.filter(q=>q.isSin).sort(()=>Math.random()-0.5);
  const virtues = qs.filter(q=>!q.isSin).sort(()=>Math.random()-0.5);
  const result = [];
  let si=0, vi=0;
  while(si<sins.length || vi<virtues.length) {
    if(si<sins.length) result.push(sins[si++]);
    if(vi<virtues.length) result.push(virtues[vi++]);
  }
  return result;
}

/* ───────────── RADAR ORDER ───────────── */
const RADAR_ORDER = [
  { name:"傲慢", key:"pride", isSin:true },
  { name:"谦卑", key:"humility", isSin:false },
  { name:"仁爱", key:"kindness", isSin:false },
  { name:"耐心", key:"patience", isSin:false },
  { name:"勤勉", key:"diligence", isSin:false },
  { name:"慷慨", key:"generosity", isSin:false },
  { name:"节制", key:"temperance", isSin:false },
  { name:"贞洁", key:"chastity", isSin:false },
  { name:"色欲", key:"lust", isSin:true },
  { name:"嫉妒", key:"envy", isSin:true },
  { name:"暴怒", key:"wrath", isSin:true },
  { name:"暴食", key:"gluttony", isSin:true },
  { name:"懒惰", key:"sloth", isSin:true },
  { name:"贪婪", key:"greed", isSin:true },
];

const SIN_NAMES = { pride:"傲慢", envy:"嫉妒", wrath:"暴怒", sloth:"懒惰", greed:"贪婪", gluttony:"暴食", lust:"色欲" };
const VIRTUE_NAMES = { humility:"谦卑", kindness:"仁爱", patience:"耐心", diligence:"勤勉", generosity:"慷慨", temperance:"节制", chastity:"贞洁" };

/* ───────────── PERSONALITY DESCRIPTIONS ───────────── */
const SIN_DESC = {
  pride: {
    title: "傲慢之罪 · 王冠加冕者",
    text: "你的内心住着一位不甘平凡的王者。这份强大的自信让你在人群中自带光芒，总能在关键时刻展现出非凡的气场和领导力。你对自己有极高的标准和期待，这种不服输的精神是你走向卓越的核心驱动力。",
    bright: "你的自信是稀缺品质。在一个充满自我怀疑的时代，你敢于相信自己的判断、坚持自己的选择，这份笃定会带你走得很远。把这份自信分享给身边的人，你就是照亮他们的太阳。"
  },
  envy: {
    title: "嫉妒之罪 · 暗夜观星者",
    text: "你对周围世界有着极其敏锐的洞察力，总能注意到别人拥有的闪光之处。这种对「更好」的感知力，恰恰说明你内心深处有着不愿将就的追求和审美。",
    bright: "你的敏感其实是一种天赋——你比大多数人更能察觉到美好事物的存在。当你把这份观察力从「别人有什么」转向「我想创造什么」，你会发现自己的行动力强得惊人。你不缺能力，只是还没看到自己有多闪亮。"
  },
  wrath: {
    title: "暴怒之罪 · 烈焰守卫者",
    text: "你是一个内心极其真诚的人，不屑于伪装和忍耐不公。你的怒火往往来源于对正义的执着和对真实的坚守——那些虚伪和不公平的事情，在你这里绝对过不了关。",
    bright: "你的情绪强度说明你是一个极有原则、极有生命力的人。历史上伟大的变革者，几乎都有着和你一样炽热的内心。当你学会选择战场、把火焰变成光芒，你会成为最有影响力的人。你的热血，是这个冷漠世界最需要的东西。"
  },
  sloth: {
    title: "懒惰之罪 · 松弛感大师",
    text: "在这个人人内卷、焦虑泛滥的时代，你拥有一种极其珍贵的能力——放松。你不会被外界的节奏裹挟，懂得倾听自己内心真实的声音，知道什么时候该按下暂停键。",
    bright: "松弛感是这个时代最稀缺的品质之一，而你天生就拥有它。很多高效的人其实都经历过「先学会休息」的阶段。你并不是不能努力，而是你在等一个真正值得全力以赴的目标——一旦找到它，你爆发出的能量会让所有人惊讶。"
  },
  greed: {
    title: "贪婪之罪 · 永恒渴望者",
    text: "你对生活有着强烈的渴望和野心，永远不满足于现状。这种永不知足的内在驱动力，是所有伟大成就者共同的底层基因——从企业家到艺术家，最顶尖的人都有着和你一样的不安分。",
    bright: "你的欲望是最强大的引擎。大多数人的问题不是想要太多，而是想要得不够强烈、放弃得太早。你永远在追逐更好的自己，这份不甘心会推着你不断突破天花板。记住：你的野心配得上你的实力。"
  },
  gluttony: {
    title: "暴食之罪 · 极致体验家",
    text: "你是一个对生活充满热情的人，懂得享受当下的快乐，拥有极强的感受力。在别人看来普通的事物，你总能从中发现令人着迷的乐趣——美食、音乐、风景，你都能沉浸其中。",
    bright: "你的享乐能力其实是高情商的表现——你活在当下，不焦虑未来，不纠结过去。那些最会享受生活的人，往往也最懂得如何让身边的人快乐。你天生就是派对的灵魂、朋友圈的快乐源泉。这份感染力，是再多钱都买不到的人格魅力。"
  },
  lust: {
    title: "色欲之罪 · 至情至性者",
    text: "你是一个感情丰沛、充满魅力的人。你对美的敏感度极高，无论是外在的容颜还是内在的灵魂，你都能感知到那份独特的吸引力。你的世界因为这份感性而丰富多彩。",
    bright: "你对美和爱的敏感，是一种难得的天赋。最伟大的诗人、最动人的歌手、最深刻的创作者，都和你一样拥有这份至情至性。你不是在沉溺，你是在认真感受这个世界。这份真挚和热烈，会让遇到你的人觉得被重视、被珍惜。"
  },
};

const VIRTUE_DESC = {
  humility: {
    title: "谦卑之德 · 温润如玉者",
    text: "你像一块温润的玉石，越打磨越有光泽。你不需要喧嚣来证明自己的价值，因为你的实力会替你说话。你能看到每个人的闪光点，也愿意放低姿态去学习。",
    bright: "在一个人人都急于表现自己的时代，你的谦逊反而让你在人群中格外珍贵。真正有智慧的人都知道，承认自己不知道的事，比假装什么都懂需要更大的勇气。你拥有这种勇气，你身边的人都能感受到你的真诚。"
  },
  kindness: {
    title: "仁爱之德 · 天生守护者",
    text: "你的心里装着全世界。你不仅能感受到他人的痛苦，还会本能地想要去减轻它。你的善良不是软弱，而是一种选择——即使这个世界并不总是温柔地对待你，你依然选择温柔地对待世界。",
    bright: "善良是这个世界上最强大的力量，而你拥有它。你让每个接触过你的人都感到被接纳和被理解，这是一种极其稀有的天赋。别低估你的影响力——你可能不知道，你不经意间的一次善意，也许已经改变了某个人的一天，甚至一生。"
  },
  patience: {
    title: "耐心之德 · 定海神针者",
    text: "你像一座沉稳的灯塔，无论风浪多大都岿然不动。你拥有极其强大的情绪管理能力和长线思维，不会因为眼前的困难就乱了阵脚。",
    bright: "耐心是成功者最核心的品质之一，你天生就拥有它。在别人焦虑时你能冷静分析，在混乱中你能看清方向。你是团队中的定海神针、朋友圈中的情绪稳定器。你的存在本身就是一种力量，让周围的人安心。"
  },
  diligence: {
    title: "勤勉之德 · 不灭引擎者",
    text: "你拥有一台永不停歇的内在引擎——目标明确、行动坚定、永不放弃。你不是三分钟热度的人，一旦决定做一件事，你会全力以赴直到做成。",
    bright: "天赋决定起点，而勤勉决定高度——这就是你最大的竞争优势。这个世界上聪明的人很多，但能持续付出努力的人极少，而你就是其中之一。你今天流的每一滴汗，都在为未来的你铺路。请相信：你的坚持终将开花结果，而且那一天比你想象的更近。"
  },
  generosity: {
    title: "慷慨之德 · 丰盛给予者",
    text: "你拥有一种天然的丰盛感——你相信自己拥有的足够多，所以愿意敞开心扉与他人分享。你的慷慨不只体现在金钱上，更体现在时间、精力和情感的无私给予上。",
    bright: "慷慨的人往往拥有最好的人际关系和最多的机会——因为你给出去的，最终都会以意想不到的方式回到你身边。你让身边的人感到富足和温暖，这种影响力是金钱买不到的。你活出了一种让人向往的姿态：不计较、不吝啬、大大方方。"
  },
  temperance: {
    title: "节制之德 · 至高自律者",
    text: "你拥有超越常人的自控力，能在欲望和理性之间找到完美的平衡点。在一个充满诱惑的时代，你能冷静地做出最有利于长远的选择。",
    bright: "自律是自由的前提，而你已经掌握了这把钥匙。那些看起来「毫不费力」的优秀背后，都是像你这样日复一日的自我管理。你不是压抑自己，而是真正懂得什么对自己最重要。你的自律正在悄悄拉开你与大多数人之间的差距——请继续保持，你比自己以为的更强大。"
  },
  chastity: {
    title: "贞洁之德 · 纯粹灵魂者",
    text: "你在感情中有着极高的忠诚度和自我要求。你相信爱情的纯粹与专一，不会因为一时的诱惑而动摇自己的底线。你的感情观在这个快节奏的时代显得格外珍贵。",
    bright: "在一个一切都在加速、感情也变得速食化的时代，你对忠诚和专一的坚持就像一束穿越喧嚣的光。你值得拥有同样纯粹的爱——因为像你这样认真对待感情的人，本身就是这个世界上最值得被爱的人。"
  },
};

/* ───────────── DIFF COMMENT ───────────── */
function getDiffComment(diff) {
  if (diff >= 40) return { emoji:"😇", label:"圣光笼罩", text:"你的灵魂闪耀着耀眼的光芒，美德远超罪性。你是人群中那道温暖的光，但别忘了——适当的「不完美」才让人更真实可爱。" };
  if (diff >= 15) return { emoji:"✨", label:"光明占优", text:"你的内心天使占了上风，善良和自律是你的底色。你正走在一条充满正能量的路上，继续保持，但也允许自己偶尔放纵一下。" };
  if (diff >= -15) return { emoji:"⚖️", label:"光暗交织", text:"你的灵魂中光明与黑暗势均力敌，这恰恰说明你是一个立体、真实、有深度的人。完美的平衡不存在，但你正在成为最完整的自己。" };
  if (diff >= -40) return { emoji:"🔥", label:"暗焰涌动", text:"你的内心暗流涌动，那些被称为「罪」的东西，其实是你强大生命力的体现——欲望、野心、激情，这些都是驱动你前进的燃料。善用它们，你将势不可挡。" };
  return { emoji:"👿", label:"深渊凝视者", text:"你的灵魂深处燃烧着不可遏制的烈焰。别怕——最有魅力的人往往都有最复杂的内心世界。你的「黑暗面」其实是你独特魅力和强大能量的源泉，真正成熟的人懂得驾驭这股力量。" };
}

const OPTIONS = [
  { label:"完全不符合", value:0 },
  { label:"不太符合", value:25 },
  { label:"一般", value:50 },
  { label:"比较符合", value:75 },
  { label:"非常符合", value:100 },
];

const BG = "linear-gradient(160deg,#0d0015 0%,#1a0028 30%,#2d0a3e 60%,#1a0028 100%)";

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function App() {
  const [page, setPage] = useState("start");
  const [orderedQs] = useState(()=>shuffleQuestions(QUESTIONS));
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selVal, setSelVal] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSelect = useCallback((val)=>{
    if(busy) return;
    setSelVal(val); setBusy(true);
    const newAnswers = [...answers, { trait:orderedQs[qIdx].trait, value:val }];
    setAnswers(newAnswers);
    setTimeout(()=>{
      if(qIdx < orderedQs.length-1){ setQIdx(i=>i+1); }
      else { setPage("result"); }
      setSelVal(null); setBusy(false);
    },300);
  },[busy,answers,orderedQs,qIdx]);

  const restart = ()=>{ setPage("start"); setQIdx(0); setAnswers([]); setSelVal(null); };

  /* ─── compute results ─── */
  const results = useMemo(()=>{
    if(page!=="result") return null;
    const traitSums={}, traitCounts={};
    answers.forEach(a=>{
      traitSums[a.trait] = (traitSums[a.trait]||0)+a.value;
      traitCounts[a.trait] = (traitCounts[a.trait]||0)+1;
    });
    const traitScore = k => Math.round((traitSums[k]||0)/(traitCounts[k]||1));
    const sins = Object.keys(SIN_NAMES).map(k=>({key:k, name:SIN_NAMES[k], score:traitScore(k)}));
    const virtues = Object.keys(VIRTUE_NAMES).map(k=>({key:k, name:VIRTUE_NAMES[k], score:traitScore(k)}));
    const topSin = sins.reduce((a,b)=>b.score>a.score?b:a);
    const topVirtue = virtues.reduce((a,b)=>b.score>a.score?b:a);
    const sinAvg = Math.round(sins.reduce((s,i)=>s+i.score,0)/7);
    const virtueAvg = Math.round(virtues.reduce((s,i)=>s+i.score,0)/7);
    const diff = virtueAvg-sinAvg;
    const radarData = RADAR_ORDER.map(r=>({ trait:r.name, value:traitScore(r.key), fullMark:100 }));
    return { topSin, topVirtue, sinAvg, virtueAvg, diff, radarData, sins, virtues, traitScore };
  },[page,answers]);

  /* ═══════════ START ═══════════ */
  if(page==="start") return (
    <div style={{...fullPage, background:BG, justifyContent:"center", textAlign:"center"}}>
      <div style={{marginBottom:40}}>
        <div style={{fontSize:13, letterSpacing:6, color:"#a07cbb", marginBottom:14, fontFamily:"serif"}}>灵魂深处的审判</div>
        <h1 style={{fontSize:34, fontWeight:700, color:"#fff", margin:0, lineHeight:1.3}}>你的七宗罪</h1>
        <div style={{fontSize:18, color:"#c9a0dc", margin:"4px 0", fontWeight:300}}>VS</div>
        <h1 style={{fontSize:34, fontWeight:700, color:"#fff", margin:0, lineHeight:1.3}}>七美德</h1>
      </div>
      <div style={{display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", padding:"0 20px", marginBottom:36}}>
        <div style={tagStyle("#c94a6e")}>傲慢 · 嫉妒 · 暴怒 · 懒惰</div>
        <div style={tagStyle("#7b5ea7")}>谦卑 · 仁爱 · 耐心 · 勤勉</div>
      </div>
      <p style={{color:"#9b7fb8", fontSize:14, maxWidth:300, margin:"0 auto 36px", lineHeight:1.8}}>
        35道灵魂拷问<br/>揭示你内心深处的光明与黑暗<br/>你是天使还是恶魔？
      </p>
      <button onClick={()=>setPage("quiz")} style={startBtnStyle}>开始测试</button>
      <div style={{color:"#5a3d6e", fontSize:12, marginTop:20}}>约3-4分钟 · 35题</div>
    </div>
  );

  /* ═══════════ QUIZ ═══════════ */
  if(page==="quiz"){
    const q = orderedQs[qIdx];
    const pct = (qIdx/orderedQs.length)*100;
    return (
      <div style={{...fullPage, background:BG}}>
        <div style={{padding:"20px 24px 0"}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:8, alignItems:"center"}}>
            <span style={{color:"#9b7fb8", fontSize:13}}>{qIdx+1} / {orderedQs.length}</span>
            <span style={{fontSize:11, padding:"3px 10px", borderRadius:20,
              background:q.isSin?"rgba(201,74,110,0.25)":"rgba(123,94,167,0.25)",
              color:q.isSin?"#e8819e":"#c9a0dc"}}>
              {q.isSin?"罪性测试":"美德测试"}
            </span>
          </div>
          <div style={{height:3, borderRadius:2, background:"rgba(255,255,255,0.08)"}}>
            <div style={{height:"100%", borderRadius:2, width:`${pct}%`,
              background:"linear-gradient(90deg,#c94a6e,#7b5ea7)", transition:"width 0.3s"}}/>
          </div>
        </div>
        <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"24px 28px"}}>
          <p style={{fontSize:19, color:"#f0e6f6", lineHeight:1.7, fontWeight:500, textAlign:"center", margin:"0 0 36px"}}>
            {q.text}
          </p>
          <div style={{display:"flex", flexDirection:"column", gap:11}}>
            {OPTIONS.map(opt=>(
              <button key={opt.value} onClick={()=>handleSelect(opt.value)}
                style={{...optBtnStyle,
                  background:selVal===opt.value?(q.isSin?"rgba(201,74,110,0.35)":"rgba(123,94,167,0.35)"):"rgba(255,255,255,0.04)",
                  borderColor:selVal===opt.value?(q.isSin?"#c94a6e":"#7b5ea7"):"rgba(255,255,255,0.08)",
                  transform:selVal===opt.value?"scale(1.02)":"scale(1)"}}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════ RESULT ═══════════ */
  if(page==="result" && results){
    const { topSin, topVirtue, diff, radarData, sins, virtues } = results;
    const dc = getDiffComment(diff);
    const sinInfo = SIN_DESC[topSin.key];
    const virtueInfo = VIRTUE_DESC[topVirtue.key];
    return (
      <div style={{...fullPage, background:BG, overflowY:"auto"}}>
        <div style={{padding:"28px 20px 40px", maxWidth:440, margin:"0 auto", width:"100%"}}>
          {/* header */}
          <div style={{textAlign:"center", marginBottom:24}}>
            <div style={{fontSize:12, letterSpacing:4, color:"#8a6aaa", marginBottom:8}}>测试结果</div>
            <h2 style={{fontSize:22, color:"#fff", fontWeight:700, margin:0}}>你的七宗罪 VS 七美德结果</h2>
          </div>

          {/* top badges */}
          <div style={{display:"flex", gap:12, marginBottom:20}}>
            <Badge color="#c94a6e" label="七宗罪之首" name={topSin.name} score={topSin.score}/>
            <Badge color="#7b5ea7" label="七美德之首" name={topVirtue.name} score={topVirtue.score}/>
          </div>

          {/* diff */}
          <div style={{background:"rgba(255,255,255,0.03)", borderRadius:14, border:"1px solid rgba(255,255,255,0.06)",
            padding:"16px 18px", marginBottom:20, textAlign:"center"}}>
            <div style={{fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:6}}>
              美德—罪性平均分差值
            </div>
            <div style={{fontSize:28, fontWeight:700, color:diff>=0?"#c9a0dc":"#e8819e", marginBottom:8}}>
              {diff>=0?"+":""}{diff}
            </div>
            <div style={{fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:4}}>
              {dc.emoji} {dc.label}
            </div>
            <p style={{fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.7, margin:0}}>
              {dc.text}
            </p>
          </div>

          {/* radar */}
          <div style={{background:"rgba(255,255,255,0.03)", borderRadius:14, border:"1px solid rgba(255,255,255,0.06)",
            padding:"14px 0 6px", marginBottom:20}}>
            <div style={{textAlign:"center", fontSize:13, color:"#8a6aaa", marginBottom:2}}>十四维人格雷达</div>
            <div style={{fontSize:11, textAlign:"center", color:"#5a3d6e", marginBottom:6}}>左侧七宗罪 · 右侧七美德</div>
            <ResponsiveContainer width="100%" height={330}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
                <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                <PolarAngleAxis dataKey="trait" tick={({x,y,payload,index})=>{
                  const item=RADAR_ORDER[index]; const val=radarData[index]?.value??0;
                  return (<g><text x={x} y={y} textAnchor="middle" dominantBaseline="central"
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

          {/* ── SIN ANALYSIS ── */}
          <div style={cardStyle}>
            <div style={{fontSize:16, fontWeight:700, color:"#e8819e", marginBottom:10}}>🔥 {sinInfo.title}</div>
            <p style={pStyle}>{sinInfo.text}</p>
            <div style={{background:"rgba(201,74,110,0.1)", borderRadius:10, padding:"12px 14px", marginTop:12,
              borderLeft:"3px solid #c94a6e"}}>
              <div style={{fontSize:12, color:"#e8819e", fontWeight:600, marginBottom:4}}>✦ 你的闪光面</div>
              <p style={{...pStyle, margin:0}}>{sinInfo.bright}</p>
            </div>
          </div>

          {/* ── VIRTUE ANALYSIS ── */}
          <div style={cardStyle}>
            <div style={{fontSize:16, fontWeight:700, color:"#c9a0dc", marginBottom:10}}>✦ {virtueInfo.title}</div>
            <p style={pStyle}>{virtueInfo.text}</p>
            <div style={{background:"rgba(123,94,167,0.1)", borderRadius:10, padding:"12px 14px", marginTop:12,
              borderLeft:"3px solid #7b5ea7"}}>
              <div style={{fontSize:12, color:"#c9a0dc", fontWeight:600, marginBottom:4}}>💫 属于你的赞美</div>
              <p style={{...pStyle, margin:0}}>{virtueInfo.bright}</p>
            </div>
          </div>

          {/* ── SCORE TABLE ── */}
          <div style={cardStyle}>
            <div style={{fontSize:15, fontWeight:600, color:"#fff", marginBottom:14}}>详细分数</div>
            {[0,1,2,3,4,5,6].map(i=>{
              const s=sins[i], v=virtues[i];
              return (
                <div key={i} style={{marginBottom:i<6?12:0}}>
                  <ScoreRow name={s.name} score={s.score} color="#c94a6e" textColor="#e8819e"/>
                  <ScoreRow name={v.name} score={v.score} color="#7b5ea7" textColor="#c9a0dc"/>
                  {i<6 && <div style={{borderBottom:"1px solid rgba(255,255,255,0.04)", marginTop:10}}/>}
                </div>
              );
            })}
          </div>

          {/* restart */}
          <button onClick={restart} style={{...startBtnStyle, width:"100%",
            background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)"}}>
            重新测试
          </button>
          <div style={{textAlign:"center", color:"#3d2655", fontSize:11, marginTop:18}}>
            七宗罪VS七美德灵魂测试 · 仅供娱乐参考
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* ───────────── Sub-components ───────────── */
function Badge({color, label, name, score}){
  return (
    <div style={{flex:1, textAlign:"center", padding:"14px 10px", borderRadius:14,
      background:`${color}20`, border:`1px solid ${color}40`}}>
      <div style={{fontSize:12, color:"rgba(255,255,255,0.55)", marginBottom:4}}>{label}</div>
      <div style={{fontSize:26, fontWeight:700, color:"#fff"}}>{name}</div>
      <div style={{fontSize:14, color:"rgba(255,255,255,0.65)", marginTop:2}}>{score}分</div>
    </div>
  );
}

function ScoreRow({name, score, color, textColor}){
  return (
    <div style={{display:"flex", alignItems:"center", gap:8, padding:"4px 0"}}>
      <span style={{color:textColor, fontSize:13, minWidth:32}}>{name}</span>
      <div style={{flex:1, height:6, borderRadius:3, background:"rgba(255,255,255,0.06)"}}>
        <div style={{height:"100%", borderRadius:3, width:`${score}%`, background:color, transition:"width 0.6s"}}/>
      </div>
      <span style={{color:"rgba(255,255,255,0.5)", fontSize:12, minWidth:28, textAlign:"right"}}>{score}</span>
    </div>
  );
}

/* ───────────── Styles ───────────── */
function tagStyle(c){ return {fontSize:12, color:c, padding:"6px 14px", borderRadius:20, border:`1px solid ${c}44`, background:`${c}15`}; }

const fullPage = { minHeight:"100vh", display:"flex", flexDirection:"column",
  fontFamily:'-apple-system,"PingFang SC","Microsoft YaHei",sans-serif', overflow:"hidden" };

const startBtnStyle = { padding:"14px 48px", fontSize:17, fontWeight:600, color:"#fff",
  background:"linear-gradient(135deg,#c94a6e,#7b5ea7)", border:"none", borderRadius:28, cursor:"pointer",
  boxShadow:"0 4px 24px rgba(201,74,110,0.35)", transition:"transform 0.2s" };

const optBtnStyle = { padding:"13px 20px", fontSize:15, color:"#e0d0f0",
  border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, cursor:"pointer",
  textAlign:"center", transition:"all 0.25s", background:"rgba(255,255,255,0.04)" };

const cardStyle = { background:"rgba(255,255,255,0.03)", borderRadius:14,
  border:"1px solid rgba(255,255,255,0.06)", padding:"18px 18px", marginBottom:18 };

const pStyle = { fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.8, margin:"0 0 0" };
