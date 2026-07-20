const originalMatchFilter=matchFilter;
matchFilter=function(p){
  if(state.filter==="tiktok") return Boolean(p.tiktok);
  return originalMatchFilter(p);
};

const originalRenderCards=renderCards;
renderCards=function(){
  originalRenderCards();
  filtered().forEach(p=>{
    if(!p.tiktok) return;
    const card=document.getElementById("card-"+p.id);
    const tags=card?.querySelector(".tags");
    if(tags&&!tags.querySelector(".tag-tiktok")){
      const tag=document.createElement("span");
      tag.className="tag tag-tiktok";
      tag.textContent="🔥 TikTok trend";
      tags.appendChild(tag);
    }
  });
};

render();