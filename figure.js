(() => {
// One frozen CPU FP32 forward pass, seed 42, on assets/cup-{0,1}.jpg.
const trace = {"weights":[[[5.756740417695028e-09,0.33752214908599854,3.490128801786341e-05,0.28993019461631775,0.054096657782793045,0.3184144198894501,9.338803010905394e-07,7.575309837193345e-07],[5.086537413490078e-09,0.07302004098892212,0.011213444173336029,0.8765280246734619,8.997906206786865e-07,0.008877072483301163,0.013343976810574532,0.01701657474040985]],[[6.18465001434032e-10,0.28020045161247253,0.006391208153218031,0.09005367755889893,0.0013760069850832224,0.6218698024749756,0.00010881810158025473,2.1177296027907744e-10],[3.2850071551848714e-09,0.030995475128293037,0.09624361991882324,0.7964642643928528,1.9662609318515933e-09,0.020430641248822212,0.0558120533823967,5.385374970501289e-05]]],"z":[1.1346615552902222,0.9965057969093323,-1.4560284614562988,-0.004359734710305929,-0.2954438328742981,0.3319644033908844,-0.41910848021507263,-0.22884780168533325,-1.5445805788040161,-3.1731300354003906,0.5726273655891418,-0.08665981143712997,-0.4426478147506714,-1.3313140869140625,-1.7681524753570557,0.5506550073623657,-1.323502540588379,-0.5809213519096375,-0.661625862121582,-1.098562479019165,-0.34552136063575745,-0.983159601688385,0.22552290558815002,0.25092417001724243,1.4696441888809204,1.2882789373397827,-0.9275254011154175,0.5538515448570251,-0.6528018712997437,-0.7811250686645508,-0.9670314788818359,-0.3979222774505615,0.6472291350364685,0.6925235390663147,0.5875000357627869,-1.2567808628082275,-1.8134738206863403,1.1259335279464722,-0.4329851567745209,0.2057395875453949,1.4441180229187012,-0.95186448097229,-1.424918532371521,2.0555756092071533,-0.24559767544269562,-1.7889190912246704,-0.030539054423570633,-0.15156811475753784,0.8437923192977905,0.04094754159450531,2.466413974761963,-0.04341992735862732,-0.32571813464164734,0.14857015013694763,-0.6156498789787292,0.38028812408447266,1.283281683921814,-1.3578351736068726,-0.3194611668586731,-0.42985767126083374,0.13939282298088074,1.1306029558181763,-0.4585224390029907,1.065562129020691,-1.168799638748169,-0.3239845335483551,-1.5938531160354614,0.2624570429325104,0.2355765998363495,1.5345443487167358,0.558952271938324,0.49519604444503784,0.5498045682907104,0.16865859925746918,-0.3561992049217224,0.7575833797454834,-0.6951388120651245,-1.6770344972610474,-0.5060738921165466,0.2561928331851959,0.4745170474052429,0.38231706619262695,0.7057896256446838,-0.03226788714528084,-0.4807875454425812,-0.1733018457889557,-0.2611202299594879,0.9413162469863892,-1.1928197145462036,-0.10028433054685593,1.1264315843582153,-2.379786491394043,0.3767048418521881,1.2739806175231934,1.811852216720581,-0.6102216839790344,-0.0847957655787468,-0.8053741455078125,1.8054341077804565,1.1860078573226929,0.19563104212284088,0.046716004610061646,1.2975716590881348,-0.9494108557701111,-2.2986202239990234,-0.5099108815193176,0.4974629580974579,-0.18659143149852753,1.0104968547821045,0.011884192004799843,0.7042407393455505,1.3896677494049072,-0.2264709621667862,0.450238436460495,-0.9100748300552368,1.355559229850769,1.054293155670166,0.5421055555343628,-1.1471142768859863,1.5151516199111938,1.2642722129821777,0.3150860071182251,-0.929973304271698,0.9821964502334595,0.13357238471508026,-0.17382891476154327,-0.5742336511611938,1.9801298379898071],"patches":[[[4,4,0],[13,4,0],[22,4,0],[32,4,7],[4,13,4],[13,13,5],[22,13,5],[32,13,5],[4,22,5],[13,22,5],[22,22,5],[32,22,5],[4,32,1],[13,32,1],[22,32,3],[32,32,1]],[[4,4,0],[13,4,0],[22,4,0],[32,4,7],[4,13,5],[13,13,5],[22,13,3],[32,13,7],[4,22,5],[13,22,5],[22,22,3],[32,22,5],[4,32,4],[13,32,1],[22,32,1],[32,32,1]]]};
const svg = document.querySelector("#fig-stage");
const layer = document.querySelector("#scene-layer");
const steps = [...document.querySelectorAll("[data-step]")];
const playFigure = document.querySelector("#fig-play");
const stages = [
  ["Two images of the same cup lift.", "The encoder sees the earlier and later RGB images. Play the sequence to follow this recorded pair through the released EgoLAM model."],
  ["Two frames become two sets of eight slots.", "DINOv2 extracts patch features. Slot attention pools them into eight 256-D vectors per frame. Each tile shows the image weighted by that slot’s measured mask. Moving dots trace a sample of patches to their strongest slot. The earlier slots initialize the later ones."],
  ["The IDM turns changes in hand features into z.", "The IDM jointly processes all 16 slot vectors with time embeddings. Within each frame, left and right hand queries pool the contextualized slots. Line weights show their measured attention. The two later-minus-earlier hand differences are projected into one 128-D code."],
  ["Wrist supervision trains the action code.", "A readout predicts both wrists’ translation and rotation from z. During training, error against measured motion in the earlier head frame updates the readout and action encoder. Hand keypoints separately supervise where the hand queries pool features."],
  ["Head motion enters the forward model.", "The FDM takes current slots, z and measured head motion to predict later slots. The extra input helps explain viewpoint changes. During training, a camera adversary also discourages recoverable head motion in z. At inference, the two RGB frames suffice."]
];
const colors={ink:"#183f35",green:"#237e65",mint:"#e1eee5",line:"#90ae9e",clay:"#995331",sand:"#f3e4d7",paper:"#fffef8"};
function el(tag,attrs={},parent=layer) {
  const n=document.createElementNS("http://www.w3.org/2000/svg",tag);
  for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,v);
  parent.append(n);return n;
}
function text(x,y,str,size=17,parent=layer,fill=colors.ink) {
  const n=el("text",{x,y,fill,"text-anchor":"middle","font-size":size},parent);n.textContent=str;return n;
}
function rect(x,y,width,height,fill,stroke="none",parent=layer,rx=5) {
  return el("rect",{x,y,width,height,rx,fill,stroke},parent);
}
const duration=7200;
let index=0, elapsed=0, last=0, running=false, raf=0, animations=[];
function animate(n,keys,start,end) {
  if(reducedMotion.matches)return;
  const a=n.animate(keys,{duration:end-start,delay:start,fill:"both",easing:"ease-in-out"});
  a.pause();a.currentTime=0;animations.push(a);
}
function reveal(n,start) {animate(n,[{opacity:0},{opacity:1}],start,start+550);}
function wire(x,y,X,Y,start,color=colors.green,width=1.5,parent=layer) {
  const mid=(x+X)/2;
  const d='M'+x+' '+y+' C'+mid+' '+y+' '+mid+' '+Y+' '+X+' '+Y;
  const line=el("path",{d,fill:"none",stroke:color,"stroke-width":width,opacity:.55,pathLength:1},parent);
  animate(line,[{strokeDasharray:"1 1",strokeDashoffset:1},{strokeDasharray:"1 1",strokeDashoffset:0}],start,start+650);
  return line;
}
function packet(x,y,X,Y,start,end,color=colors.green,r=3.3) {
  const n=el("circle",{cx:x,cy:y,r,fill:color,opacity:0});
  animate(n,[{opacity:0,transform:"translate(0px,0px)"},{opacity:.95,offset:.12},{opacity:.95,offset:.82},{opacity:0,transform:'translate('+(X-x)+'px,'+(Y-y)+'px)'}],start,end);
}
function rgbImage(f,x,y,w) {
  const n=el("image",{href:'assets/cup-'+f+'.jpg',x,y,width:w,height:w*.75});
  return n;
}
// Carry the same visual object between adjacent scenes, using a fixed camera.
function flyFrom(node,oldX,oldY,oldWidth,x,y,width,start) {
  const scale=oldWidth/width;
  const from="matrix("+[scale,0,0,scale,oldX-scale*x,oldY-scale*y].join(",")+")";
  animate(node,[{transform:from},{transform:"matrix(1,0,0,1,0,0)"}],start,start+900);
}
function tile(parent,f,k,x,y,w) {
  const n=el("svg",{x,y,width:w,height:w*.75,viewBox:(k*128)+' '+(f*96)+' 128 96',overflow:"hidden"},parent);
  el("image",{href:"assets/slot-views.jpg",width:1024,height:192},n);
  return n;
}
function component(x,y,w,h,lines,fill=colors.mint) {
  const g=el("g");rect(x,y,w,h,fill,colors.line,g);
  lines.forEach((s,i)=>text(x+w/2,y+h/2+5+(i-(lines.length-1)/2)*18,s,17,g));return g;
}
function zCode(x,y,w,start) {
  const g=el("g"), cell=w/16, max=Math.max(...trace.z.map(Math.abs));
  rect(x-4,y-4,w+8,cell*8+8,colors.paper,colors.line,g);
  trace.z.forEach((v,i)=>{
    const pixel=rect(x+(i%16)*cell,y+Math.floor(i/16)*cell,cell-.6,cell-.6,v<0?colors.clay:colors.green,"none",g,0);
    pixel.setAttribute("fill-opacity",.12+.88*Math.abs(v)/max);
    const t=el("title",{},pixel);t.textContent='z['+i+'] = '+v.toFixed(3);
    reveal(pixel,start+(i%16)*45);
  });
  text(x+w/2,y+cell*8+24,"z · 128 values",16,g);
  return g;
}
function rgbScene() {
  for(let f=0;f<2;f++){
    const x=55+f*283;
    const n=rgbImage(f,x,41,227);reveal(n,160+f*470);
    text(x+113,235,f?"Later frame":"Earlier frame",21);
    for(let k=1;k<5;k++){
      const pos=k/5;
      const v=el("path",{d:'M'+(x+pos*227)+' 41v170 M'+x+' '+(41+pos*170)+'h227',stroke:"white",opacity:.28,fill:"none"});
      reveal(v,1550);
    }
  }
  text(310,269,"RGB frames → frozen visual encoder",16);
}
function slotScene() {
  text(78,24,"RGB inputs",18);text(269,24,"Frozen encoder",18);text(477,24,"8 slots per frame",18);
  for(let f=0;f<2;f++){
    const y=47+f*119;
    const rgb=rgbImage(f,22,y,109);
    flyFrom(rgb,55+f*283,41,227,22,y,109,0);
    text(77,y+101,f?"Later":"Earlier",15);
    wire(136,y+41,204,y+41,150);
    component(205,y+17,125,50,["DINOv2","slot attention"]);
    wire(330,y+41,378,y+41,600);
    for(const [u,v,k] of trace.patches[f]){
      const dx=382+(k%4)*51+22, dy=y+Math.floor(k/4)*40+17;
      packet(22+u/37*109,y+v/37*82,dx,dy,650+u*15,2050+v*13,colors.green,2.8);
    }
    for(let k=0;k<8;k++){
      const x=382+(k%4)*51,ty=y+Math.floor(k/4)*40;
      const n=tile(layer,f,k,x,ty,48);
      reveal(n,1430+k*125);
    }
  }
}
function idmScene() {
  text(82,26,"Slot vectors",18);text(256,26,"Joint IDM",18);text(409,26,"Changes",18);text(552,26,"Latent action",18);
  rect(171,39,168,206,"#eef4ec",colors.line);
  text(255,61,"Time-aware hand queries",14);
  for(let f=0;f<2;f++){
    const y=85+f*104;
    text(77,y-17,f?"Later slots":"Earlier slots",14);
    for(let k=0;k<8;k++){
      const x=12+(k%4)*35,ty=y+Math.floor(k/4)*27;
      const token=tile(layer,f,k,x,ty,32);
      flyFrom(token,382+(k%4)*51,47+f*119+Math.floor(k/4)*40,48,x,ty,32,0);
      for(let h=0;h<2;h++){
        const a=trace.weights[f][h][k];
        wire(x+32,ty+11,228,y+h*29,400+f*220+k*55,h?colors.clay:colors.green,.3+4*a);
      }
    }
    for(let h=0;h<2;h++){
      const color=h?colors.clay:colors.green;
      const n=component(226,y-11+h*29,83,24,[h?"Right hand":"Left hand"],h?colors.sand:colors.mint);reveal(n,850);
      wire(310,y+h*29,385,119+h*53,1900,color);
      packet(310,y+h*29,385,119+h*53,2050,2950,color);
    }
  }
  for(let h=0;h<2;h++){
    const y=119+h*53;
    const n=component(383,y-16,52,32,[h?"Δ R":"Δ L"]);reveal(n,2350);
    wire(435,y,492,145,3100);packet(435,y,492,145,3200,3900);
  }
  zCode(494,111,110,3800);text(549,212,"Green + / brown −",13);text(310,271,"Later − earlier for each hand → concatenate → learned projection",16);
}
function wristScene(){
  text(310,31,"Training · wrist-motion supervision",21);
  const code=zCode(29,107,110,0);
  flyFrom(code,494,111,110,29,107,110,0);
  wire(145,134,197,134,430);component(198,108,100,53,["Wrist head"]);
  wire(298,134,349,89,850);const pred=component(350,61,130,56,["Predicted","wrist motion"]);reveal(pred,1050);
  const target=component(350,166,130,56,["Measured","wrist motion"],colors.sand);reveal(target,1480);
  wire(480,89,514,144,1750);wire(480,194,514,144,1750,colors.clay);
  const loss=component(515,122,85,45,["Error"]);reveal(loss,2050);
  const back=el("path",{d:"M556 172 V240 H87 V194",fill:"none",stroke:colors.clay,"stroke-dasharray":"5 5"});
  reveal(back,2650);const note=text(310,269,"Training gradient updates the wrist head and action encoder.",16);reveal(note,2650);
}
function cameraScene(){
  text(310,31,"Training · predict the later slots",21);
  zCode(38,99,94,250);
  component(14,46,145,32,["Current slots"]);
  component(14,208,145,38,["Head motion nₜ"],colors.sand);
  for(const [y,delay,color] of [[62,350,colors.green],[124,750,colors.green],[227,1200,colors.clay]]){
    wire(159,y,246,139,delay,color);packet(159,y,246,139,delay+250,delay+950,color);
  }
  component(246,112,106,55,["FDM"]);wire(352,139,402,139,2200);
  const pred=component(403,111,188,56,["Predicted later slots"]);reveal(pred,2480);
  const compare=text(505,207,"Compare with later slots",15);reveal(compare,3000);
  text(310,269,"Head motion conditions forward prediction during training.",16);
}
const scenesForFigure=[rgbScene,slotScene,idmScene,wristScene,cameraScene];
function seek(t) {elapsed=t;animations.forEach(a=>{a.currentTime=t;});}
function renderStage(i,atEnd=false) {
  index=i;animations.forEach(a=>a.cancel());animations=[];layer.replaceChildren();
  scenesForFigure[i]();seek(atEnd?duration:0);
  document.querySelector("#fig-heading").textContent=stages[i][0];
  document.querySelector("#fig-detail").textContent=stages[i][1];
  document.querySelector("#fig-stage-title").textContent=stages[i].join(" ");
  steps.forEach((b,j)=>b.setAttribute("aria-pressed",i===j));
  document.querySelector("#fig-back").disabled=i===0;
  document.querySelector("#fig-next").disabled=i===steps.length-1;
}
function pause(){
  running=false;cancelAnimationFrame(raf);
  playFigure.textContent=index===4 && elapsed===duration ? "Replay" : "Play";
}
function tick(now){
  const t=Math.min(duration,elapsed+Math.max(0,now-last));last=now;seek(t);
  if(t===duration){
    if(index===4){pause();return;}
    renderStage(index+1);
  }
  raf=requestAnimationFrame(tick);
}
function start(){
  if(running)return;
  if(elapsed===duration)renderStage(index===4?0:index);
  running=true;playFigure.textContent="Pause";last=performance.now();raf=requestAnimationFrame(tick);
}
let interacted=false;
function select(i){
  interacted=true;pause();renderStage(i,reducedMotion.matches);
  if(!reducedMotion.matches)start();
}
steps.forEach((b,i)=>b.onclick=()=>select(i));
document.querySelector("#fig-next").onclick=()=>select(Math.min(index+1,4));
document.querySelector("#fig-back").onclick=()=>select(Math.max(index-1,0));
document.querySelector("#fig-reset").onclick=()=>select(0);
playFigure.onclick=()=>{interacted=true;if(running)pause();else start();};
document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();});
reducedMotion.addEventListener("change",()=>{pause();renderStage(index,true);});
renderStage(0,true);
new IntersectionObserver(([e])=>{
  if(!e.isIntersecting){pause();return;}
  if(e.intersectionRatio>=.65 && !interacted && !document.hidden && !reducedMotion.matches){
    interacted=true;renderStage(0);start();
  }
},{threshold:[0,.65]}).observe(svg);
})();
