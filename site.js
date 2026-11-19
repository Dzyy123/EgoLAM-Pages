const measurements = {"cup":{"shares":[0.018933739166330187,0.014990240488711865,0.01749781398426081,0.018131540099622645,0.020259600856636167,0.016326228852782725,0.014035262933587065,0.017668823307565504,0.02549646932378584,0.023226339988323772,0.02604175989798314,0.02520673968425687,0.04366404424894549,0.07723277308600376,0.037988229392683065,0.056624761502104944,0.0777835079820231,0.05475313300642716,0.06070186948145739,0.05526393033303749,0.07225727439797185,0.06113442849343466,0.05451996081635745,0.05211417262129174,0.05814735605441516],"colors":[[68,78,74],[70,83,79]]},"bag":{"shares":[0.01638683831325054,0.044927936567453815,0.07963460071719572,0.08527354710937676,0.08550225253475191,0.02267932953814219,0.052202954545162716,0.053666225856240354,0.04692669444637832,0.03772785928653061,0.02070126418764451,0.03527831616316134,0.031156366359705215,0.031630244781932694,0.02605756839655975,0.01762528404803304,0.03951199260595349,0.038527380100186664,0.03394523766739452,0.022322346239440006,0.02106716683990713,0.040410802231885784,0.04587943033752763,0.04197226079880723,0.0289861003273778],"colors":[[93,69,52],[96,71,55]]},"cloth":{"shares":[0.015011277643578066,0.026279375076320766,0.025605706620498284,0.013834556030463912,0.011518907228318965,0.02183432297655843,0.02269606066025545,0.03043694409782531,0.021155580982178856,0.014540906505577404,0.021920745040377256,0.04426614256724367,0.061175370592879294,0.056632272435243936,0.016167992114662726,0.021554678918982245,0.0661672302617088,0.08691709408824784,0.057238286734314255,0.02039828584176611,0.022745704801528575,0.09847866896861014,0.09899032800730227,0.08433458821992842,0.040098973585629034],"colors":[[86,82,52],[86,82,52]]}};
const scenes = {cup:"Cup lift", cloth:"Cloth handling", bag:"Bag handling"};
let scene = "cup";
let frame = 0;
function showFrame() {
  const label = frame ? "Later" : "Earlier";
  const photo = document.querySelector("#frame");
  const next = "assets/" + scene + "-" + frame + ".jpg";
  const old = photo.getAttribute("src");
  const container = photo.parentElement;
  container.querySelector(".wipe")?.remove();
  if (old !== next && old.startsWith("assets/" + scene + "-") && !reducedMotion.matches) {
    const previous = new Image();
    previous.alt = "";
    previous.className = "wipe";
    previous.src = old;
    container.insertBefore(previous, photo.nextSibling);
    const wipe = previous.animate([{clipPath:"inset(0 0 0 0)"},{clipPath:"inset(0 0 0 100%)"}],
                                  {duration:460,easing:"cubic-bezier(.3,.7,.25,1)"});
    wipe.onfinish = () => previous.remove();
  }
  photo.src = next;
  photo.alt = label + " frame of " + scenes[scene].toLowerCase();
  if (scanControls.hidden === false) drawWindow();
  document.querySelector("#time").textContent = label + " frame";
  document.querySelector("#scene").textContent = scenes[scene];
  document.querySelector("#scan-finding").textContent = scene === "cup"
    ? "For this cup lift, covering the left-hand region changes the code most."
    : "Select Peak to locate the most influential patch in this pair.";
  document.querySelectorAll("[data-frame]").forEach(b => b.setAttribute("aria-pressed", Number(b.dataset.frame) === frame));
  document.querySelectorAll("[data-scene]").forEach(b => b.setAttribute("aria-pressed", b.dataset.scene === scene));
}
document.querySelectorAll("[data-frame]").forEach(b => b.onclick = () => {stopScan(); frame = Number(b.dataset.frame); showFrame();});
document.querySelectorAll("[data-scene]").forEach(b => b.onclick = () => {stopScan(); scene = b.dataset.scene; frame = 0; showPeak(); showFrame();});
const scores = {"EgoLAM":[81.40,77.33,79.40],"Expert BC":[59.27,41.07,51.60],"LAOM":[61.33,43.87,48.73],"CLAM":[63.73,38.53,62.27],"LAPA":[56.33,46.47,54.13],"Moto":[51.33,45.87,59.93],"LAPA-DINOv2":[58.47,53.40,67.80],"LAPA-DINOv3":[57.40,46.87,68.67],"GeoLAM":[74.33,65.87,67.47]};
function showSuite(suite) {
  const rows = document.querySelector("#rows");
  rows.replaceChildren();
  Object.entries(scores).sort((a,b) => b[1][suite] - a[1][suite]).forEach(([name, results]) => {
    const row = document.createElement("div"); row.className = "row" + (name === "EgoLAM" ? " ours" : "");
    const label = document.createElement("span"); label.textContent = name;
    const track = document.createElement("div"); track.className = "track";
    const bar = document.createElement("i"); bar.style.width = results[suite] + "%"; track.append(bar);
    const value = document.createElement("strong"); value.textContent = results[suite].toFixed(2) + "%";
    row.append(label,track,value); rows.append(row);
  });
  document.querySelectorAll("[data-suite]").forEach(b => b.setAttribute("aria-pressed", Number(b.dataset.suite) === suite));
}
document.querySelectorAll("[data-suite]").forEach(b => b.onclick = () => showSuite(Number(b.dataset.suite)));
showSuite(0);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const scanControls = document.querySelector(".scan-controls");
const slider = document.querySelector("#position");
const play = document.querySelector("#scan-play");
const box = document.querySelector("#window-box");
let timer = null;

function peakIndex() {
  const shares = measurements[scene].shares;
  return shares.indexOf(Math.max(...shares));
}
function drawWindow() {
  const i = Number(slider.value);
  const percent = (100 * measurements[scene].shares[i]).toFixed(1) + "%";
  box.style.transform = "translate(" + (i % 5) * 50 + "%," + Math.floor(i / 5) * 50 + "%)";
  box.style.setProperty("--mask", "rgb(" + measurements[scene].colors[frame].join(",") + ")");
  box.classList.toggle("is-peak", i === peakIndex());
  document.querySelector("#scan-value").textContent = (i === peakIndex() ? "Peak · " : "") + percent;
  slider.setAttribute("aria-valuetext", "Window " + (i+1) + " of 25, response share " + percent);
}
function stopScan() {
  box.classList.remove("masking");
  clearInterval(timer);
  timer = null;
  play.textContent = "Play scan";
}
function showPeak() {
  slider.value = peakIndex();
  drawWindow();
}
function runScan() {
  stopScan();
  box.classList.add("masking");
  slider.value = 0;
  drawWindow();
  play.textContent = "Pause scan";
  timer = setInterval(() => {
    if (Number(slider.value) === 24) {
      stopScan();
      showPeak();
    } else {
      slider.stepUp();
      drawWindow();
    }
  }, 165);
}
play.onclick = () => timer === null ? runScan() : stopScan();
slider.oninput = () => {stopScan(); drawWindow();};
document.querySelector("#peak").onclick = () => {stopScan(); showPeak();};
scanControls.hidden = false;
box.classList.add("active");
showPeak();
new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) stopScan();
}).observe(document.querySelector(".photo"));
document.addEventListener("visibilitychange", () => {if (document.hidden) stopScan();});
reducedMotion.addEventListener("change", () => {if (reducedMotion.matches) {stopScan();showPeak();}});
