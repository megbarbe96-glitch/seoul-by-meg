window.MAP_PLACES=window.MAP_PLACES||[];

const TIKTOK_TREND_IDS=new Set([
  "haus",
  "olive",
  "five-to-seven",
  "super-matcha",
  "medicube-seongsu",
  "grandmothers-recipe"
]);

window.MAP_PLACES.forEach(p=>{
  if(TIKTOK_TREND_IDS.has(p.id)) p.tiktok=true;
  if(p.id==="haus") p.why="Le concept retail le plus fort de Seongsu, à combiner avec le Nudake Tea House pour un contenu très visuel.";
  if(p.id==="olive") p.why="Le grand playground K-beauty de Seongsu : diagnostics, nouveautés, expériences et pop-ups.";
  if(p.id==="five-to-seven") p.why="Pancakes ultra épais et très photogéniques, en plus d’être tout près de chez toi.";
  if(p.id==="super-matcha") p.why="Matcha très visuel avec préparation robotisée : parfait pour un contenu court et identifiable immédiatement.";
  if(p.id==="medicube-seongsu") p.why="Le flagship skincare viral à Seongsu, idéal pour tester les appareils et nouveautés Medicube.";
  if(p.id==="grandmothers-recipe") p.why="Une option plus authentique que spectaculaire pour ton bibimbap, mais très cohérente avec tes goûts et ton quartier.";
});

window.MAP_PLACES.push(...[
  {
    id:"musinsa-megastore-seongsu",
    name:"MUSINSA Mega Store Seongsu",
    ko:"무신사 메가스토어 성수",
    zone:"Seongsu",
    cat:"Design",
    icon:"🛍️",
    score:99,
    best:"Semaine · ouverture",
    travel:"≈ 20–25 min",
    why:"La grosse nouveauté 2026 à Seongsu : mode, beauty et expériences réunies dans un immense espace.",
    naver:"https://map.naver.com/p/search/%EB%AC%B4%EC%8B%A0%EC%82%AC%20%EB%A9%94%EA%B0%80%EC%8A%A4%ED%86%A0%EC%96%B4%20%EC%84%B1%EC%88%98",
    x:84.3,
    y:43.8,
    tiktok:true
  },
  {
    id:"standard-bread-seongsu",
    name:"Standard Bread Seongsu",
    ko:"스탠다드브레드 성수",
    zone:"Seongsu",
    cat:"Café",
    icon:"🍞",
    score:97,
    best:"Matin · avant la file",
    travel:"≈ 20–25 min",
    why:"Pain chaud, French toast et textures très faciles à filmer : l’un des spots food les plus viraux du quartier.",
    naver:"https://map.naver.com/p/search/%EC%8A%A4%ED%83%A0%EB%8B%A4%EB%93%9C%EB%B8%8C%EB%A0%88%EB%93%9C%20%EC%84%B1%EC%88%98",
    x:80.8,
    y:49.4,
    tiktok:true
  },
  {
    id:"ready-young-pharmacy-seongsu",
    name:"Ready Young Pharmacy Seongsu",
    ko:"레디영약국 성수",
    zone:"Seongsu",
    cat:"Beauty",
    icon:"🧴",
    score:98,
    best:"Semaine",
    travel:"≈ 20–25 min",
    why:"Pharmacie K-beauty avec analyse de peau par IA et produits dermocosmétiques recommandés par des pharmaciens.",
    naver:"https://map.naver.com/p/search/%EB%A0%88%EB%94%94%EC%98%81%EC%95%BD%EA%B5%AD%20%EC%84%B1%EC%88%98",
    x:83.6,
    y:44.6,
    tiktok:true
  },
  {
    id:"jayeondo-salt-bread-seongsu",
    name:"Jayeondo Salt Bread Seongsu",
    ko:"자연도소금빵 성수",
    zone:"Seongsu",
    cat:"Dessert",
    icon:"🥐",
    score:97,
    best:"Juste avant une fournée",
    travel:"≈ 20–25 min",
    why:"Le salt bread viral à emporter, parfait pour filmer la texture croustillante et le cœur beurré.",
    naver:"https://map.naver.com/p/search/%EC%9E%90%EC%97%B0%EB%8F%84%EC%86%8C%EA%B8%88%EB%B9%B5%20%EC%84%B1%EC%88%98",
    x:85.6,
    y:45.2,
    tiktok:true
  },
  {
    id:"seoul-garden-show-2026",
    name:"Seoul International Garden Show 2026",
    ko:"2026 서울국제정원박람회",
    zone:"Seoul Forest",
    cat:"Activity",
    icon:"🌺",
    score:99,
    best:"Matin · golden hour",
    travel:"≈ 5–10 min à pied",
    why:"167 jardins autour de Seoul Forest et Seongsu, accessibles pendant ton séjour jusqu’au 27 octobre 2026.",
    naver:"https://map.naver.com/p/search/2026%20%EC%84%9C%EC%9A%B8%EA%B5%AD%EC%A0%9C%EC%A0%95%EC%9B%90%EB%B0%95%EB%9E%8C%ED%9A%8C",
    x:75.1,
    y:49.0,
    tiktok:true,
    must:true
  },
  {
    id:"dotori-oven-seongsu",
    name:"Dotori Oven",
    ko:"도토리오븐 성수",
    zone:"Seongsu",
    cat:"Café",
    icon:"🧁",
    score:95,
    best:"Matin · goûter",
    travel:"≈ 20–25 min",
    why:"Financiers, yaourt grec très garni et décor chaleureux : une adresse récente et très photogénique.",
    naver:"https://map.naver.com/p/search/%EB%8F%84%ED%86%A0%EB%A6%AC%EC%98%A4%EB%B8%90%20%EC%84%B1%EC%88%98",
    x:84.7,
    y:44.4,
    tiktok:true
  },
  {
    id:"cheongsudang-bakery",
    name:"Cheongsudang Bakery",
    ko:"청수당 베이커리",
    zone:"Ikseon-dong",
    cat:"Café",
    icon:"🌿",
    score:95,
    best:"Fin d’après-midi",
    travel:"≈ 35–45 min",
    why:"Hanok végétalisé, lumière douce et pâtisseries très visuelles : idéal à combiner avec Ikseon-dong.",
    naver:"https://map.naver.com/p/search/%EC%B2%AD%EC%88%98%EB%8B%B9%20%EB%B2%A0%EC%9D%B4%EC%BB%A4%EB%A6%AC",
    x:55.6,
    y:19.3,
    tiktok:true
  },
  {
    id:"london-bagel-museum-dosan",
    name:"London Bagel Museum Dosan",
    ko:"런던베이글뮤지엄 도산점",
    zone:"Gangnam",
    cat:"Café",
    icon:"🥯",
    score:94,
    best:"Ouverture · seulement si la file est raisonnable",
    travel:"≈ 25–35 min",
    why:"Toujours très viral et photogénique, mais à garder comme option secondaire si l’attente devient excessive.",
    naver:"https://map.naver.com/p/search/%EB%9F%B0%EB%8D%98%EB%B2%A0%EC%9D%B4%EA%B8%80%EB%AE%A4%EC%A7%80%EC%97%84%20%EB%8F%84%EC%82%B0%EC%A0%90",
    x:78.2,
    y:65.7,
    tiktok:true
  }
]);

window.CARD_PLACES=window.MAP_PLACES.filter(p=>!p.hidden_card);