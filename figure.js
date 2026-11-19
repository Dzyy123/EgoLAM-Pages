// Coordinates follow the paper's original diagram, in a 1100 × 477 viewBox.
const figureStages = [
  {label:"Inference · RGB pair", title:"Start with an earlier and a later RGB frame.",
   text:"The bottom-left images show the same scene at two times. EgoLAM compares them to infer the action between them.",
   view:[0,339,338,137], boxes:[[19,385,101,58],[125,385,101,58]], paths:["M231 414 H246"]},
  {label:"Inference · Frozen front end", title:"Represent each frame with eight slots.",
   text:"Frozen DINOv2 extracts patch features. Slot attention groups them into eight 256-dimensional vectors per frame. The earlier slots initialize the later slots, which are refined with the later frame’s features. The two stacks are shown schematically.",
   view:[205,346,424,130],boxes:[[249,392,185,45],[474,392,101,42]],paths:["M438 414 H471"]},
  {label:"Inference · Inverse dynamics",title:"Encode the change as a 128-dimensional latent action.",
   text:"The inverse dynamics model (IDM) uses one query for each hand to pool features from both sets of slots. Changes in the pooled hand features produce a single vector, zₜ. This is the output used for imitation.",
   view:[456,348,614,127],boxes:[[475,393,98,40],[640,391,184,47],[913,399,106,29]],paths:["M577 414 H637","M828 414 H909"]},
  {label:"Training · Hand and wrist targets",title:"Teach the code which movement to retain.",
   text:"Hand keypoints supervise where each query pools information. A separate readout predicts both wrists’ translation and rotation from zₜ alone. Its error against measured motion in the earlier head frame trains the encoder to preserve that motion.",
   view:[134,170,460,161],boxes:[[163,195,182,49],[435,194,92,38],[158,262,196,63],[400,263,149,62]],paths:["M254 244 V260","M479 232 V260"]},
  {label:"Training · Camera conditioning",title:"Give the forward model the measured head motion.",
   text:"The forward dynamics model (FDM) combines current slots, zₜ and head motion nₜ to predict future slots. It can explain the shift of a stationary object during a head turn. A camera adversary and a view-consistency loss also constrain zₜ. Only the RGB pair is needed at inference.",
   view:[420,158,654,173],boxes:[[437,208,87,24],[756,166,100,78],[915,183,105,51],[549,261,238,63]],paths:["M526 220 H751","M807 183 V197","M860 220 H912"]}
];
const diagram = document.querySelector("#figure-2");
const svg = document.querySelector("#fig-stage");
const markers = document.querySelector("#fig-highlights");
const stageButtons = [...diagram.querySelectorAll("[data-step]")];
const playFigure = document.querySelector("#fig-play");
const fullView = [0,0,1100,477];
let stageIndex = -1;
let playTimer = null;
let zoomFrame = 0;
const svgElement = (tag, attrs) => {
  const node = document.createElementNS("http://www.w3.org/2000/svg",tag);
  for (const [name,value] of Object.entries(attrs)) node.setAttribute(name,value);
  return node;
};
function focusView(target) {
  cancelAnimationFrame(zoomFrame);
  const from = svg.getAttribute("viewBox").split(/\s+/).map(Number);
  if (reducedMotion.matches) {svg.setAttribute("viewBox",target.join(" ")); return;}
  const start = performance.now();
  function render(now) {
    const t = Math.min(1,(now-start)/650);
    const ease = t*t*(3-2*t);
    svg.setAttribute("viewBox",target.map((v,i)=>from[i]+(v-from[i])*ease).join(" "));
    if (t < 1) zoomFrame = requestAnimationFrame(render);
  }
  zoomFrame = requestAnimationFrame(render);
}
function presentStage(index) {
  stageIndex = index;
  const stage = figureStages[index];
  markers.replaceChildren();
  if (stage) {
    for (const [x,y,width,height] of stage.boxes) {
      markers.append(svgElement("rect",{x:x-2,y:y-2,width:width+4,height:height+4,rx:3,class:"fig-box"}));
    }
    stage.paths.forEach((d,i)=>{
      const path=svgElement("path",{d,class:"fig-trace",pathLength:1});
      path.style.animationDelay=(0.6+i*.32)+"s";
      markers.append(path);
    });
  }
  focusView(stage ? stage.view : fullView);
  document.querySelector("#fig-heading").textContent = stage ? stage.title : "Two frames in, one latent action out.";
  document.querySelector("#fig-detail").textContent = stage ? stage.text : "Follow the bottom row to extract an action. Then trace the training signals in the middle row to see how wrist and head motion shape the encoder.";
  document.querySelector("#fig-stage-title").textContent = stage ? stage.label + ". " + stage.title : "Figure 2. EgoLAM training and inference.";
  stageButtons.forEach((b,i)=>b.setAttribute("aria-pressed",i===index));
  document.querySelector("#fig-back").disabled = index<0;
  document.querySelector("#fig-next").disabled = index===figureStages.length-1;
}
function stopFigure() {
  clearTimeout(playTimer); playTimer=null;
  playFigure.textContent=stageIndex===figureStages.length-1 ? "Replay figure" : (stageIndex<0 ? "Play figure" : "Continue");
}
function jump(i) {presentStage(i);stopFigure();}
function scheduleStage() {
  playFigure.textContent="Pause";
  playTimer=setTimeout(()=>{
    if (stageIndex===figureStages.length-1) {stopFigure();return;}
    presentStage(stageIndex+1);scheduleStage();
  },6500);
}
playFigure.onclick=()=>{
  if(playTimer!==null) {stopFigure();return;}
  if(stageIndex<0 || stageIndex===figureStages.length-1) presentStage(0);
  scheduleStage();
};
stageButtons.forEach((b,i)=>b.onclick=()=>jump(i));
document.querySelector("#fig-back").onclick=()=>jump(stageIndex-1);
document.querySelector("#fig-next").onclick=()=>jump(stageIndex+1);
document.querySelector("#fig-reset").onclick=()=>jump(-1);
new IntersectionObserver(([entry])=>{if(!entry.isIntersecting && playTimer!==null)stopFigure();}).observe(diagram);
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopFigure();});
reducedMotion.addEventListener("change",()=>jump(stageIndex));
presentStage(-1);
