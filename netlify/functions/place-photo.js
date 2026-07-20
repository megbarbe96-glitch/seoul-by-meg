exports.handler=async function(event){
  const key=process.env.GOOGLE_MAPS_API_KEY;
  if(!key) return {statusCode:503,body:"Not configured"};

  const name=decodeURIComponent(event.queryStringParameters&&event.queryStringParameters.name||"");
  if(!/^places\/[^/]+\/photos\/[^/]+$/.test(name)) return {statusCode:400,body:"Invalid photo"};

  try{
    const endpoint=`https://places.googleapis.com/v1/${name}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${encodeURIComponent(key)}`;
    const response=await fetch(endpoint);
    const data=await response.json();
    if(!response.ok||!data.photoUri) return {statusCode:404,body:"Photo unavailable"};
    return {statusCode:302,headers:{Location:data.photoUri,"cache-control":"public, max-age=86400"},body:""};
  }catch(error){
    return {statusCode:500,body:"Photo error"};
  }
};