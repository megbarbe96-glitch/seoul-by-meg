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
let placePreview=null;

document.getElementById("countAll").textContent=cardPlaces.length;
document.getElementById("countTop").textContent=cardPlaces.filter(p=>p.score>=95).length;
document.getElementById("countNear").textContent=cardPlaces.filter(p=>["Seoul Forest","Seongsu"].includes(p.zone)).length;

function installPlacePreviewStyles(){
  const style=document.createElement("style");
  style.textContent=`
    .place-preview{margin-top:10px;border:1px solid var(--line);border-radius:18px;background:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(54,38,63,.06)}
    .place-preview[hidden]{display:none!important}
    .place-preview-head{padding:14px;background:var(--soft);border-bottom:1px solid var(--line)}
    .place-preview-head strong{display:block;font-size:15px}
    .place-preview-head span{display:block;margin-top:4px;font-size:11px;color:var(--muted);line-height:1.45}
    .place-preview-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:10px;background:#fff}
    .place-preview-action{display:flex;align-items:center;justify-content:center;min-height:42px;padding:8px;border:1px solid var(--line);border-radius:12px;color:var(--ink);font-size:11px;font-weight:750;text-align:center;text-decoration:none;background:#fff}
    .place-preview-action.naver{background:var(--green);border-color:var(--green);color:#fff}
    .place-preview-map{position:relative;background:#f4f1f5;border-top:1px solid var(--line)}
    .place-preview-map iframe{display:block;width:100%;height:330px;border:0;background:#f4f1f5}
    .place-preview-note{padding:10px 14px;font-size:10px;line-height:1.45;color:var(--muted);border-top:1px solid var(--line)}
    @media(max-width:560px){.place-preview-actions{grid-template-columns:1fr}.place-preview-map iframe{height:280px}}
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

function ensurePlacePreview(){
  if(placePreview) return placePreview;
  placePreview=document.createElement("section");
  placePreview.className="place-preview";
  placePreview.hidden=true;
  popup.insertAdjacentElement("afterend",placePreview);
  return placePreview;
}

function hidePlacePreview(){
  if(placePreview){
    placePreview.hidden=true;
    placePreview.innerHTML="";
  }
}

function showPlacePreview(p){
  const panel=ensurePlacePreview();
  const query=encodeURIComponent(`${p.name} ${p.ko} Seoul`);
  const naverImages=`https://search.naver.com/search.naver?where=image&query=${query}`;
  const tiktokSearch=`https://www.tiktok.com/search?q=${query}`;
  const googleImages=`https://www.google.com/search?tbm=isch&q=${query}`;
  const googleMap=`https://www.google.com/maps?q=${query}&output=embed`;

  panel.hidden=false;
  panel.innerHTML=`
    <div class="place-preview-head">
      <strong>Voir à quoi ressemble ${p.name}</strong>
      <span>Une vue interactive du lieu, avec des accès directs aux photos et aux contenus publiés en ligne.</span>
    </div>
    <div class="place-preview-actions">
      <a class="place-preview-action naver" href="${naverImages}" target="_blank" rel="noopener">Photos sur Naver</a>
      <a class="place-preview-action" href="${tiktokSearch}" target="_blank" rel="noopener">Vidéos TikTok</a>
      <a class="place-preview-action" href="${googleImages}" target="_blank" rel="noopener">Google Images</a>
    </div>
    <div class="place-preview-map">
      <iframe src="${googleMap}" title="Vue interactive de ${p.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    </div>
    <div class="place-preview-note">La fiche interactive est fournie par Google Maps. Les photos complètes restent accessibles avec les boutons Naver, TikTok et Google Images.</div>
  `;
}

function showPopup(p){
  popup.innerHTML=`<div class="title">${p.icon} ${p.name}</div><div class="ko">${p.ko}</div><div class="meta">${p.zone} · ${p.cat} · score Még ${p.score}<br>${p.best} · ${p.travel}<br>${p.why}</div><a class="naver-btn" href="${p.naver}" target="_blank" rel="noopener">Ouvrir dans Naver</a>`;
  showPlacePreview(p);
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
  hidePlacePreview();
  render();
});

reset.addEventListener("click",()=>{
  state={filter:"",query:"",activeId:""};
  search.value="";
  filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  hidePlacePreview();
  render();
});

filters.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  const f=btn.dataset.filter==="all"?"":btn.dataset.filter;
  state.filter=state.filter===f?"":f;
  state.query="";
  state.activeId="";
  search.value="";
  hidePlacePreview();

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

installPlacePreviewStyles();
createPins();
render();