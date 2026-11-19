const scenes = {cup:"Cup lift", cloth:"Cloth handling", bag:"Bag handling"};
let scene = "cup";
let frame = 0;
function showFrame() {
  const label = frame ? "Later" : "Earlier";
  const photo = document.querySelector("#frame");
  photo.src = "assets/" + scene + "-" + frame + ".jpg";
  photo.alt = label + " frame of " + scenes[scene].toLowerCase();
  document.querySelector("#time").textContent = label + " frame";
  document.querySelector("#scene").textContent = scenes[scene];
  document.querySelectorAll("[data-frame]").forEach(b => b.setAttribute("aria-pressed", Number(b.dataset.frame) === frame));
  document.querySelectorAll("[data-scene]").forEach(b => b.setAttribute("aria-pressed", b.dataset.scene === scene));
}
document.querySelectorAll("[data-frame]").forEach(b => b.onclick = () => {frame = Number(b.dataset.frame); showFrame();});
document.querySelectorAll("[data-scene]").forEach(b => b.onclick = () => {scene = b.dataset.scene; frame = 0; showFrame();});
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
