let state={filter:"",query:"",activeId:""};

const mapPlaces=window.MAP_PLACES;
const cardPlaces=window.CARD_PLACES;
const frame=document.getElementById("mapFrame");
const popup=document.getElementById("mapPopup");
const cards=document.getElementById("cards");
const status=document.getElementById("status");
const empty=document.getElementById("empty");
const filters=document.getElementById("filters");
const search=document.getElementById("search");
const reset=document.getElementById("reset");
let naverPreview=null;

document.getElementById("countAll").textContent=cardPlaces.length;
document.getElementById("countTop").textContent=cardPlaces.filter(p=>p.score>=95).length;
document.getElementById("countNear").textContent=cardPlaces.filter(p=>["Seoul Forest","Seongsu"].includes(p.zone)).length;

function installPreviewStyles(){
  const style=document.createElement("style");
  style.textContent=`
    .naver-preview{margin-top:10px;border:1px solid var(--line);border-radius:18px;background:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(54,38,63,.06)}
    .naver-preview[hidden]{display:none!important}
    .naver-preview-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:13px 14px;background:var(--soft);border-bottom:1px solid var(--line)}
    .naver-preview-head strong{display:block;font-size:14px}
    .naver-preview-head span{display:block;margin-top:3px;font-size:11px;color:var(--muted);line-height:1.4}
    .naver-preview-link{flex:0 0 auto;color:var(--ink);font-size:12px;font-weight:750;text-decoration:underline}
    .naver-preview-media{position:relative;min-height:240px;background:#f2eef4;overflow:hidden}
    .naver-preview-media a{display:block}
    .naver-preview-img{display:block;width:100%;height:auto;min-height:240px;object-fit:cover;object-position:top center}
    .naver-preview-loading{display:grid;place-items:center;min-height:240px;padding:28px;text-align:center;color:var(--muted);font-size:13px;line-height:1.5}
    .naver-preview-loading b{display:block;margin-bottom:6px;color:var(--ink)}
    .naver-preview-note{padding:10px 14px;font-size:10px;line-height:1.45;color:var(--muted);border-top:1px solid var(--line)}
    @media(max-width:560px){.naver-preview-head{display:block}.naver-preview-link{display:inline-block;margin-top:9px}.naver-preview-media,.naver-preview-loading,.naver-preview-img{min-height:190px}}
  `;
  document.head.appendChild(style);
}

function tagOf(p){
  if(["Matcha","Thé"].includes(p.cat)) return "matcha";
  if(p.cat==="Beauty") return "beauty";
  if(["Bibimbap","Tteokbokki"].includes(p.cat)) return "kfood";
  if(["Restaurant","Café","Dessert"].includes(p.cat)) return "food";
  if(p.cat==="Culture") return "culture";
  if(p.cat==="Design") return "shopping";
  if(["Sunset","Parc"].includes(p.cat)) return "sunset";
  return "";
}

function isNear(p){
  return ["Seoul Forest","Seongsu","Eungbong"].includes(p.zone);
}

function matchesCategory(p){
  if(!state.filter) return true;
  if(state.filter==="near") return isNear(p);
  if(state.filter==="must") return Boolean(p.must);
  if(state.filter==="tiktok") return Boolean(p.tiktok);
  if(state.filter==="food") return ["Restaurant","Café","Dessert","Bibimbap","Tteokbokki"].includes(p.cat);
  if(state.filter==="kfood") return ["Bibimbap","Tteokbokki"].includes(p.cat);
  return tagOf(p)===state.filter;
}

function getVisiblePlaces(){
  const q=state.query.trim().toLowerCase();
  return cardPlaces
    .filter(p=>{
      const hay=`${p.name} ${p.ko} ${p.zone} ${p.cat} ${p.why}`.toLowerCase();
      return matchesCategory(p)&&(!q||hay.includes(q));
    })
    .sort((a,b)=>b.score-a.score);
}

function ensureNaverPreview(){
  if(naverPreview) return naverPreview;
  naverPreview=document.createElement("section");
  naverPreview.className="naver-preview";
  naverPreview.hidden=true;
  popup.insertAdjacentElement("afterend",naverPreview);
  return naverPreview;
}

function hideNaverPreview(){
  if(naverPreview){
    naverPreview.hidden=true;
    naverPreview.innerHTML="";
  }
}

function showNaverPreview(p){
  const panel=ensureNaverPreview();
  const screenshotUrl=`https://image.thum.io/get/width/1000/crop/1000/noanimate/maxAge/24/?url=${encodeURIComponent(p.naver)}`;

  panel.hidden=false;
  panel.innerHTML=`
    <div class="naver-preview-head">
      <div>
        <strong>Aperçu Naver · ${p.name}</strong>
        <span>Une prévisualisation visuelle de la page pour voir les photos et l’ambiance du lieu.</span>
      </div>
      <a class="naver-preview-link" href="${p.naver}" target="_blank" rel="noopener">Ouvrir la page complète</a>
    </div>
    <div class="naver-preview-media">
      <div class="naver-preview-loading"><div><b>Chargement de l’aperçu…</b>Les photos peuvent prendre quelques secondes à apparaître.</div></div>
      <a href="${p.naver}" target="_blank" rel="noopener" hidden>
        <img class="naver-preview-img" src="${screenshotUrl}" alt="Aperçu de la page Naver de ${p.name}" loading="eager">
      </a>
    </div>
    <div class="naver-preview-note">Aperçu automatique d’une page externe. Le rendu peut parfois être partiel ou légèrement différé ; le bouton Naver ouvre toujours la fiche originale.</div>
  `;

  const image=panel.querySelector(".naver-preview-img");
  const link=panel.querySelector(".naver-preview-media a");
  const loading=panel.querySelector(".naver-preview-loading");

  image.addEventListener("load",()=>{
    loading.hidden=true;
    link.hidden=false;
  },{once:true});

  image.addEventListener("error",()=>{
    loading.innerHTML=`<div><b>Aperçu indisponible</b>Naver n’a pas permis de générer l’image pour ce lieu. Utilise « Ouvrir la page complète » pour voir ses photos.</div>`;
  },{once:true});
}

function showPopup(p){
  popup.innerHTML=`<div class="title">${p.icon} ${p.name}</div><div class="ko">${p.ko}</div><div class="meta">${p.zone} · ${p.cat} · score Még ${p.score}<br>${p.best} · ${p.travel}<br>${p.why}</div><a class="naver-btn" href="${p.naver}" target="_blank" rel="noopener">Ouvrir dans Naver</a>`;
  showNaverPreview(p);
}

function selectPlaceOnMap(p){
  state.activeId=p.id;
  showPopup(p);

  const currentPlaces=getVisiblePlaces();
  renderPins(currentPlaces);
  renderCards(currentPlaces);

  document.querySelector(".map-panel").scrollIntoView({
    behavior:"smooth",
    block:"start"
  });
}

function createPins(){
  mapPlaces.forEach(p=>{
    const pin=document.createElement("button");
    pin.className=p.hidden_card?"home":"pin";
    pin.type="button";
    pin.dataset.id=p.id;
    pin.innerHTML=`<span>${p.icon}</span>`;
    pin.title=p.name;
    pin.style.left=p.x+"%";
    pin.style.top=p.y+"%";
    pin.addEventListener("click",()=>{
      state.activeId=p.id;
      showPopup(p);
      if(!p.hidden_card){
        const visiblePlaces=getVisiblePlaces();
        renderCards(visiblePlaces);
        document.getElementById("card-"+p.id)?.scrollIntoView({behavior:"smooth",block:"center"});
      }
      renderPins(getVisiblePlaces());
    });
    frame.appendChild(pin);
  });
}

function renderPins(visiblePlaces){
  const visibleIds=new Set(visiblePlaces.map(p=>p.id));
  const filtering=Boolean(state.filter||state.query.trim());

  document.querySelectorAll(".pin").forEach(pin=>{
    const visible=visibleIds.has(pin.dataset.id);
    pin.hidden=!visible;
    pin.style.setProperty("display",visible?"flex":"none","important");
    pin.classList.toggle("active",visible&&pin.dataset.id===state.activeId);
  });

  document.querySelectorAll(".home").forEach(pin=>{
    const visible=!filtering||state.filter==="near";
    pin.hidden=!visible;
    pin.style.setProperty("display",visible?"flex":"none","important");
    pin.classList.toggle("active",visible&&pin.dataset.id===state.activeId);
  });
}

function renderCards(visiblePlaces){
  status.textContent=`${visiblePlaces.length} lieu${visiblePlaces.length>1?"x":""} affiché${visiblePlaces.length>1?"s":""}`;
  cards.innerHTML="";
  empty.style.display=visiblePlaces.length?"none":"block";

  visiblePlaces.forEach(p=>{
    const el=document.createElement("article");
    el.className="place"+(state.activeId===p.id?" active":"");
    el.id="card-"+p.id;
    el.tabIndex=0;
    el.style.cursor="pointer";
    el.setAttribute("aria-label",`Afficher ${p.name} sur la carte`);
    el.innerHTML=`<div class="top"><div><h3>${p.icon} ${p.name}</h3><div class="ko">${p.ko}</div></div><div class="score"><b>${p.score}</b><small>Még</small></div></div><div class="tags"><span class="tag">${p.zone}</span><span class="tag">${p.cat}</span>${p.must?'<span class="tag">⭐ Incontournable</span>':""}${p.tiktok?'<span class="tag">🔥 TikTok trend</span>':""}</div><p>${p.why}</p><div class="info"><div><strong>Meilleur moment</strong><br>${p.best}</div><div><strong>Depuis chez toi</strong><br>${p.travel}</div></div><div class="actions"><a class="btn green" href="${p.naver}" target="_blank" rel="noopener">Naver Map</a><button class="btn focus" type="button">Voir sur la carte</button></div>`;

    el.addEventListener("click",event=>{
      if(event.target.closest("a,button")) return;
      selectPlaceOnMap(p);
    });

    el.addEventListener("keydown",event=>{
      if(event.key!=="Enter"&&event.key!==" ") return;
      if(event.target.closest("a,button")) return;
      event.preventDefault();
      selectPlaceOnMap(p);
    });

    el.querySelector(".focus").addEventListener("click",()=>{
      selectPlaceOnMap(p);
    });

    cards.appendChild(el);
  });
}

function render(){
  const visiblePlaces=getVisiblePlaces();
  renderPins(visiblePlaces);
  renderCards(visiblePlaces);
}

search.addEventListener("input",e=>{
  state.query=e.target.value;
  state.activeId="";
  hideNaverPreview();
  render();
});

reset.addEventListener("click",()=>{
  state={filter:"",query:"",activeId:""};
  search.value="";
  filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  hideNaverPreview();
  render();
});

filters.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  const f=btn.dataset.filter==="all"?"":btn.dataset.filter;
  state.filter=state.filter===f?"":f;
  state.query="";
  state.activeId="";
  search.value="";
  hideNaverPreview();

  filters.querySelectorAll(".filter").forEach(x=>{
    x.classList.toggle("active",x===btn&&state.filter!==""&&btn.dataset.filter!=="all");
  });

  if(btn.dataset.filter==="all"){
    filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  }

  render();

  const firstCard=cards.querySelector(".place");
  if(firstCard){
    firstCard.scrollIntoView({behavior:"smooth",block:"start"});
  }
}));

installPreviewStyles();
createPins();
render();
