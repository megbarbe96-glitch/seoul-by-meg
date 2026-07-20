exports.handler=async function(event){
  const key=process.env.GOOGLE_MAPS_API_KEY;
  if(!key){
    return {statusCode:503,headers:{"content-type":"application/json"},body:JSON.stringify({error:"not_configured"})};
  }

  const q=(event.queryStringParameters&&event.queryStringParameters.q||"").trim();
  if(!q||q.length>200){
    return {statusCode:400,headers:{"content-type":"application/json"},body:JSON.stringify({error:"invalid_query"})};
  }

  try{
    const response=await fetch("https://places.googleapis.com/v1/places:searchText",{
      method:"POST",
      headers:{
        "content-type":"application/json",
        "x-goog-api-key":key,
        "x-goog-fieldmask":"places.id,places.displayName,places.googleMapsUri,places.photos"
      },
      body:JSON.stringify({textQuery:q,languageCode:"ko",maxResultCount:1})
    });

    const data=await response.json();
    if(!response.ok){
      return {statusCode:response.status,headers:{"content-type":"application/json"},body:JSON.stringify({error:"google_places_error",details:data.error&&data.error.message})};
    }

    const place=data.places&&data.places[0];
    if(!place){
      return {statusCode:404,headers:{"content-type":"application/json"},body:JSON.stringify({error:"place_not_found"})};
    }

    const photos=(place.photos||[]).slice(0,8).map(photo=>({
      url:`/.netlify/functions/place-photo?name=${encodeURIComponent(photo.name)}`,
      attribution:(photo.authorAttributions||[]).map(a=>({displayName:a.displayName,uri:a.uri,photoUri:a.photoUri}))
    }));

    return {
      statusCode:200,
      headers:{"content-type":"application/json","cache-control":"public, max-age=21600"},
      body:JSON.stringify({
        name:place.displayName&&place.displayName.text,
        googleMapsUri:place.googleMapsUri,
        total:(place.photos||[]).length,
        photos
      })
    };
  }catch(error){
    return {statusCode:500,headers:{"content-type":"application/json"},body:JSON.stringify({error:"server_error"})};
  }
};