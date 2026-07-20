const MANUAL_GALLERIES={
  "haus":{
    source:"Vogue / Gentle Monster",
    sourceUrl:"https://www.vogue.com/article/inside-gentle-monsters-haus-nowhere-the-concept-shop-at-the-center-of-seouls-creative-revolution",
    photos:[
      "https://assets.vogue.com/photos/68beda56f88449cf932dfd57/master/w_2560%2Cc_limit/IMG_8589.JPG",
      "https://assets.vogue.com/photos/68beda88cf15e11c209e86f2/master/w_1600%2Cc_limit/IMG_8585.JPG",
      "https://assets.vogue.com/photos/68beda577d250466b21eae9f/master/w_1600%2Cc_limit/IMG_8587.JPG",
      "https://assets.vogue.com/photos/68beda565a1a30f4c49d7461/master/w_1600%2Cc_limit/IMG_0007.jpg",
      "https://assets.vogue.com/photos/68beda575f6181b99df2c83e/master/w_1600%2Cc_limit/IMG_8582.JPG"
    ]
  },
  "super-matcha":{
    source:"Trip.com",
    sourceUrl:"https://kr.trip.com/moments/detail/seoul-234-131978912/",
    photos:[
      "https://ak-d.tripcdn.com/images/1mi2b324x91c1rec40E96_W_640_0_R5_Q80.jpg?proc=source%2Ftrip",
      "https://ak-d.tripcdn.com/images/1mi1t324x91c28gsuBDAD_W_640_0_R5_Q80.jpg?proc=source%2Ftrip",
      "https://ak-d.tripcdn.com/images/1mi3b324x91c28gsvE6C2_W_640_0_R5_Q80.jpg?proc=source%2Ftrip",
      "https://ak-d.tripcdn.com/images/1mi5x324x91c8378aE002_W_640_0_R5_Q80.jpg?proc=source%2Ftrip"
    ]
  },
  "olive":{
    source:"Olive Young",
    sourceUrl:"https://m.oliveyoung.co.kr/m/mtn/store/information/DE25?language=EN&tabType=introduce",
    photos:[
      "https://cf-static.oliveyoung.co.kr/prd/1.176.2/_next/static/media/ss_img_main.820c2ff9.png?rs=3840x0&sf=webp",
      "https://cf-static.oliveyoung.co.kr/prd/1.176.2/_next/static/media/ss_part01_img01.38ca63ce.png?rs=3840x0&sf=webp",
      "https://cf-static.oliveyoung.co.kr/prd/1.176.2/_next/static/media/ss_part02_img01.50735a7d.png?rs=3840x0&sf=webp",
      "https://cf-static.oliveyoung.co.kr/prd/1.176.2/_next/static/media/ss_part03_img01.3dfeee5b.png?rs=3840x0&sf=webp"
    ]
  },
  "standard-bread-seongsu":{
    source:"Glow Seoul",
    sourceUrl:"https://glowseoul.co.kr/en/portfolio/standard-bread",
    photos:[
      "https://glowseoul.co.kr/images/gallery/standard-bread/standard-bread-01.webp",
      "https://glowseoul.co.kr/images/gallery/standard-bread/standard-bread-02.webp",
      "https://glowseoul.co.kr/images/gallery/standard-bread/standard-bread-03.webp",
      "https://glowseoul.co.kr/images/gallery/standard-bread/standard-bread-04.webp",
      "https://glowseoul.co.kr/images/gallery/standard-bread/standard-bread-05.webp"
    ]
  }
};

showPhotoGallery=function(p){
  const panel=ensurePhotoGallery();
  const gallery=MANUAL_GALLERIES[p.id];

  if(!gallery){
    panel.hidden=true;
    panel.innerHTML="";
    return;
  }

  const images=gallery.photos.map((url,index)=>{
    const more=index===gallery.photos.length-1&&gallery.photos.length>4?`<span class="place-photo-more">+${gallery.photos.length-4}</span>`:"";
    return `<a class="place-photo" href="${gallery.sourceUrl}" target="_blank" rel="noopener"><img src="${url}" alt="Photo de ${p.name}" loading="eager" onerror="this.closest('.place-photo').style.display='none'">${more}</a>`;
  }).join("");

  panel.hidden=false;
  panel.innerHTML=`
    <div class="place-gallery-head">
      <div>
        <strong>À quoi ressemble ${p.name} ?</strong>
        <span>Une sélection de photos affichée directement dans ton guide.</span>
      </div>
      <div class="place-gallery-links">
        <a href="${p.naver}" target="_blank" rel="noopener">Naver</a>
        <a href="${gallery.sourceUrl}" target="_blank" rel="noopener">Voir la source</a>
      </div>
    </div>
    <div class="place-gallery-grid">${images}</div>
    <div class="place-gallery-credit">Photos : ${gallery.source}. Les galeries sont ajoutées manuellement pour les adresses prioritaires.</div>
  `;
};
