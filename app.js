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

document.getElementById("countAll").textContent=cardPlaces.length;
document.getElementById("countTop").textContent=cardPlaces.filter(p=>p.score>=95).length;
document.getElementById("countNear").textContent=cardPlaces.filter(p=>["Seoul Forest","Seongsu"].includes(p.zone)).length;

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

function matchFilter(p){
  if(!state.filter) return true;
  if(state.filter==="near") return isNear(p);
  if(state.filter==="must") return Boolean(p.must);
  if(state.filter==="food") return ["Restaurant","Café","Dessert","Bibimbap","Tteokbokki"].includes(p.cat);
  if(state.filter==="kfood") return ["Bibimbap","Tteokbokki"].includes(p.cat);
  return tagOf(p)===state.filter;
}

function filtered(){
  const q=state.query.trim().toLowerCase();
  return cardPlaces
    .filter(p=>{
      const hay=`${p.name} ${p.ko} ${p.zone} ${p.cat} ${p.why}`.toLowerCase();
      return matchFilter(p)&&(!q||hay.includes(q));
    })
    .sort((a,b)=>b.score-a.score);
}

function showPopup(p){
  popup.innerHTML=`<div class="title">${p.icon} ${p.name}</div><div class="ko">${p.ko}</div><div class="meta">${p.zone} · ${p.cat} · score Még ${p.score}<br>${p.best} · ${p.travel}<br>${p.why}</div><a class="naver-btn" href="${p.naver}" target="_blank" rel="noopener">Ouvrir dans Naver</a>`;
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
        renderCards();
        document.getElementById("card-"+p.id)?.scrollIntoView({behavior:"smooth",block:"center"});
      }
      renderPins();
    });
    frame.appendChild(pin);
  });
}

function renderPins(){
  const visibleIds=new Set(filtered().map(p=>p.id));
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

function renderCards(){
  const arr=filtered();
  status.textContent=`${arr.length} lieu${arr.length>1?"x":""} affiché${arr.length>1?"s":""}`;
  cards.innerHTML="";
  empty.style.display=arr.length?"none":"block";

  arr.forEach(p=>{
    const el=document.createElement("article");
    el.className="place"+(state.activeId===p.id?" active":"");
    el.id="card-"+p.id;
    el.innerHTML=`<div class="top"><div><h3>${p.icon} ${p.name}</h3><div class="ko">${p.ko}</div></div><div class="score"><b>${p.score}</b><small>Még</small></div></div><div class="tags"><span class="tag">${p.zone}</span><span class="tag">${p.cat}</span>${p.must?'<span class="tag">⭐ Incontournable</span>':""}</div><p>${p.why}</p><div class="info"><div><strong>Meilleur moment</strong><br>${p.best}</div><div><strong>Depuis chez toi</strong><br>${p.travel}</div></div><div class="actions"><a class="btn green" href="${p.naver}" target="_blank" rel="noopener">Naver Map</a><button class="btn focus" type="button">Voir sur la carte</button></div>`;

    el.querySelector(".focus").addEventListener("click",()=>{
      state.activeId=p.id;
      showPopup(p);
      renderPins();
      renderCards();
      document.querySelector(".map-panel").scrollIntoView({behavior:"smooth",block:"start"});
    });

    cards.appendChild(el);
  });
}

function render(){
  renderPins();
  renderCards();
}

search.addEventListener("input",e=>{
  state.query=e.target.value;
  state.activeId="";
  render();
});

reset.addEventListener("click",()=>{
  state={filter:"",query:"",activeId:""};
  search.value="";
  filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  render();
});

filters.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  const f=btn.dataset.filter==="all"?"":btn.dataset.filter;
  state.filter=state.filter===f?"":f;
  state.activeId="";

  filters.querySelectorAll(".filter").forEach(x=>{
    x.classList.toggle("active",x===btn&&state.filter!==""&&btn.dataset.filter!=="all");
  });

  if(btn.dataset.filter==="all"){
    filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  }

  render();
}));

createPins();
render();
