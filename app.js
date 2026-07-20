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
let photoGallery=null;
let galleryRequest=0;

document.getElementById("countAll").textContent=cardPlaces.length;
document.getElementById("countTop").textContent=cardPlaces.filter(p=>p.score>=95).length;
document.getElementById("countNear").textContent=cardPlaces.filter(p=>["Seoul Forest","Seongsu"].includes(p.zone)).length;

function installGalleryStyles(){
  const style=document.createElement("style");
  style.textContent=`
    .place-gallery{margin-top:10px;border:1px solid var(--line);border-radius:18px;background:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(54,38,63,.06)}
    .place-gallery[hidden]{display:none!important}
    .place-gallery-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:14px;background:var(--soft);border-bottom:1px solid var(--line)}
    .place-gallery-head strong{display:block;font-size:15px}
    .place-gallery-head span{display:block;margin-top:3px;font-size:11px;color:var(--muted);line-height:1.45}
    .place-gallery-links{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
    .place-gallery-links a{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 10px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font-size:11px;font-weight:750;text-decoration:none}
    .place-gallery-grid{display:grid;grid-template-columns:1.35fr .65fr .65fr;grid-template-rows:150px 150px;gap:5px;padding:5px;background:#fff}
    .place-photo{position:relative;display:block;overflow:hidden;border-radius:12px;background:#eee9ef}
    .place-photo:first-child{grid-row:1 / 3}
    .place-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s ease}
    .place-photo:hover img{transform:scale(1.025)}
    .place-photo-more{position:absolute;inset:0;display:grid;place-items:center;background:rgba(28,18,34,.48);color:#fff;font-size:14px;font-weight:800}
    .place-gallery-loading{display:grid;grid-template-columns:1.35fr .65fr .65fr;grid-template-rows:150px 150px;gap:5px;padding:5px}
    .place-gallery-loading span{border-radius:12px;background:linear-gradient(90deg,#f2eef4,#faf8fb,#f2eef4);background-size:200% 100%;animation:galleryPulse 1.2s infinite}
    .place-gallery-loading span:first-child{grid-row:1 / 3}
    .place-gallery-empty{padding:20px 16px;text-align:center;color:var(--muted);font-size:12px;line-height:1.55}
    .place-gallery-empty b{display:block;color:var(--ink);margin-bottom:4px;font-size:14px}
    .place-gallery-credit{padding:8px 12px;border-top:1px solid var(--line);font-size:9px;color:var(--muted);line-height:1.4}
    @keyframes galleryPulse{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @media(max-width:560px){
      .place-gallery-head{display:block}
      .place-gallery-links{justify-content:flex-start;margin-top:10px}
      .place-gallery-grid,.place-gallery-loading{grid-template-columns:1fr 1fr;grid-template-rows:180px 115px}
      .place-photo:first-child,.place-gallery-loading span:first-child{grid-column:1 / 3;grid-row:auto}
      .place-photo:nth-child(n+4),.place-gallery-loading span:nth-child(n+4){display:none}
    }
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

function ensurePhotoGallery(){
  if(photoGallery) return photoGallery;
  photoGallery=document.createElement("section");
  photoGallery.className="place-gallery";
  photoGallery.hidden=true;
  popup.insertAdjacentElement("afterend",photoGallery);
  return photoGallery;
}

function hidePhotoGallery(){
  galleryRequest+=1;
  if(photoGallery){
    photoGallery.hidden=true;
    photoGallery.innerHTML="";
  }
}

function galleryHeader(p,googleMapsUrl){
  const googleImages=`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${p.ko} ${p.name} Seoul`)}`;
  return `<div class="place-gallery-head"><div><strong>À quoi ressemble ${p.name} ?</strong><span>Photos réelles du lieu, affichées directement dans ton guide.</span></div><div class="place-gallery-links"><a href="${p.naver}" target="_blank" rel="noopener">Naver</a><a href="${googleMapsUrl||googleImages}" target="_blank" rel="noopener">Voir plus de photos</a></div></div>`;
}

async function showPhotoGallery(p){
  const panel=ensurePhotoGallery();
  const requestId=++galleryRequest;
  panel.hidden=false;
  panel.innerHTML=`${galleryHeader(p,"")}<div class="place-gallery-loading"><span></span><span></span><span></span><span></span><span></span></div>`;

  try{
    const query=`${p.ko} ${p.name} Seoul`;
    const response=await fetch(`/.netlify/functions/place-photos?q=${encodeURIComponent(query)}`,{headers:{Accept:"application/json"}});
    const data=await response.json().catch(()=>({}));
    if(requestId!==galleryRequest) return;

    if(!response.ok||!Array.isArray(data.photos)||!data.photos.length){
      throw new Error(data.error||"no_photos");
    }

    const photos=data.photos.slice(0,5);
    const photoHtml=photos.map((photo,index)=>{
      const more=index===4&&data.total>5?`<span class="place-photo-more">+${data.total-4}</span>`:"";
      return `<a class="place-photo" href="${data.googleMapsUri||p.naver}" target="_blank" rel="noopener"><img src="${photo.url}" alt="Photo de ${p.name}" loading="eager">${more}</a>`;
    }).join("");

    panel.innerHTML=`${galleryHeader(p,data.googleMapsUri)}<div class="place-gallery-grid">${photoHtml}</div><div class="place-gallery-credit">Photos fournies par Google Places. Les attributions des contributeurs sont conservées lorsque Google les fournit.</div>`;
  }catch(error){
    if(requestId!==galleryRequest) return;
    const googleImages=`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${p.ko} ${p.name} Seoul`)}`;
    const notConfigured=String(error.message).includes("not_configured");
    panel.innerHTML=`${galleryHeader(p,googleImages)}<div class="place-gallery-empty"><b>${notConfigured?"Galerie photos prête à être activée":"Photos indisponibles pour ce lieu"}</b>${notConfigured?"Il reste à connecter la clé Google Places dans Netlify pour afficher automatiquement les photos ici.":"Le lieu n’a pas renvoyé de galerie exploitable. Le bouton ci-dessus ouvre les résultats photos."}</div>`;
  }
}

function showPopup(p){
  popup.innerHTML=`<div class="title">${p.icon} ${p.name}</div><div class="ko">${p.ko}</div><div class="meta">${p.zone} · ${p.cat} · score Még ${p.score}<br>${p.best} · ${p.travel}<br>${p.why}</div><a class="naver-btn" href="${p.naver}" target="_blank" rel="noopener">Ouvrir dans Naver</a>`;
  showPhotoGallery(p);
}

function selectPlaceOnMap(p){
  state.activeId=p.id;
  showPopup(p);
  const currentPlaces=getVisiblePlaces();
  renderPins(currentPlaces);
  renderCards(currentPlaces);
  document.querySelector(".map-panel").scrollIntoView({behavior:"smooth",block:"start"});
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
    el.addEventListener("click",event=>{if(!event.target.closest("a,button")) selectPlaceOnMap(p);});
    el.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&!event.target.closest("a,button")){event.preventDefault();selectPlaceOnMap(p);}});
    el.querySelector(".focus").addEventListener("click",()=>selectPlaceOnMap(p));
    cards.appendChild(el);
  });
}

function render(){
  const visiblePlaces=getVisiblePlaces();
  renderPins(visiblePlaces);
  renderCards(visiblePlaces);
}

search.addEventListener("input",e=>{state.query=e.target.value;state.activeId="";hidePhotoGallery();render();});
reset.addEventListener("click",()=>{state={filter:"",query:"",activeId:""};search.value="";filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));hidePhotoGallery();render();});
filters.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  const f=btn.dataset.filter==="all"?"":btn.dataset.filter;
  state.filter=state.filter===f?"":f;
  state.query="";
  state.activeId="";
  search.value="";
  hidePhotoGallery();
  filters.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===btn&&state.filter!==""&&btn.dataset.filter!=="all"));
  if(btn.dataset.filter==="all") filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  render();
  cards.querySelector(".place")?.scrollIntoView({behavior:"smooth",block:"start"});
}));

installGalleryStyles();
createPins();
render();