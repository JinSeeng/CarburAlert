import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';


function Carburants() {
  const [data, setData] = useState(null);
  const [data_station,setData_station] = useState<StationData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adresse_var, setAdresse_var] = useState("");
  const [itemlist, setItemlist] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [q_city, setQ__city] = useState("");
  const [fiche_string, setFiche_string] = useState("");
  const [tri_index, setTriIndex] = useState(0);
  const [base_coord_x, setBase_coord_x] = useState(0);
  const [base_coord_y, setBase_coord_y] = useState(0);
  const [carburant_index, setCarburantIndex] = useState(0);
  const [carburant_consommation, setCarburantconsommation] = useState(0);
  const [capacité_réservoir, setCapacité_réservoir] = useState(0);
  const [carburant__disponible_name_list, setCarburant__disponible_name_list] = useState<string[]>([
    "Gazole",
    "E85",
    "E10",
    "SP98",
    "SP95",
    "GPLc"
  ]);

/*
      "carburants_disponibles": [
        "Gazole",
        "E85",
        "E10",
        "SP98"
      ],
      "carburants_indisponibles": [
        "SP95",
        "GPLc"
      ],
*/

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTriIndex(parseInt(e.target.value));
  };


  const search = async ()  => {
    //7.016.toString()+" "+43.572.toString()
    if (capacité_réservoir>0 && carburant_consommation>0) {
      setFiche_string("")
      fetchData(get_location_api(make_search_string()));
    }
    
    //
  }

  const make_search_string = ():string => {

    return formatAddress(q)+q_city;
  }

  function formatAddress(address: string): string {
  return address.split(' ').join('+') + '+';
}

useEffect(() => {
    // Ici, on va placer l'appel API
    fetchData("");
  }, []); // Le tableau vide [] garantit un seul appel au montage

  // Avec useState

  const get_carburant_api = (coord_x:number,coord_y:number): string => {
  let carburant_string = "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records/?lang=fr&limit=10&offset=0&where=within_distance(geom, geom'POINT"+"("+coord_x.toString()+" "+coord_y.toString()+")"+"', 5km)"
  
  carburant_string = carburant_string + "&where='"+carburant__disponible_name_list[carburant_index]+"' IN carburants_disponibles"
  
  if (tri_index!=0) {
    if (tri_index==1) {
    carburant_string = carburant_string + "&order_by=distance(geom, geom'POINT"+"("+coord_x.toString()+" "+coord_y.toString()+")"+"') asc"
    } else {
    carburant_string = carburant_string + "&order_by="+carburant__disponible_name_list[carburant_index].toLowerCase()+"_prix asc"
    }
    //&order_by=gazole_prix asc
    //carburant__disponible_name_list[0]
  }
  
  return carburant_string;
};








const get_location_api = (location_search_string: string): string => {
  const location_string = "https://data.geopf.fr/geocodage/search?q="+location_search_string
  return location_string;
};

// Ajouter un élément
  
  
  interface StationData {
  total_count: number;
  results: Array<{
    id: number;
    latitude: string;
    adresse: string;
    horaires_automate_24_24:string;
    horaires_jour:string;
    carburants_rupture_temporaire: string,
    carburants_rupture_definitive: string,
    gazole_prix:number,
    e85_prix:number,
    e10_prix:number,
    sp98_prix:number,
    sp95_prix:number,
    gplc_prix:number,
    geom:any
  }>;
}

/*
"Gazole",
    "E85",
    "E10",
    "SP98",
    "SP95",
    "GPLc"
*/


  const get_station_name = (data_local: StationData,index : number): string => {
  return data_local.results[index].adresse;
};




const tri_list= ()=>{
  const list1 = ["Aucun", "Distance","Prix"];

  return list1
}
















/*
  const get_station_name = (data: StationData,index : number): string => {
  return data.results[index].adresse;
};

*/



const show_fiche_station = (current_index : number) => {
  
  if (data_station!=undefined) {
    let carburants_rupture_temporaire_text = "Pas de rupture"
    if (data_station.results[current_index].carburants_rupture_temporaire!=null) {
    carburants_rupture_temporaire_text = data_station.results[current_index].carburants_rupture_temporaire
    }

    let carburants_rupture_definitive_text = "Pas de rupture"
    if (data_station.results[current_index].carburants_rupture_definitive!=null) {
    carburants_rupture_definitive_text = data_station.results[current_index].carburants_rupture_definitive
    }

    let horaires_jour_text = "Non disponible"
    if (data_station.results[current_index].horaires_jour!=null) {
    horaires_jour_text = data_station.results[current_index].horaires_jour
    }
    

    const local_fiche_string ="horaire automate 24/24 : "+
      data_station.results[current_index].horaires_automate_24_24+"\n"+
      "horaires : "+horaires_jour_text+"\n"+
      "rupture temporaire : "+carburants_rupture_temporaire_text+"\n"+
      "rupture definitive : "+carburants_rupture_definitive_text
      +"\n"
      +"\n"
      +rentabilité_string(current_index)
    setFiche_string(local_fiche_string)
    /*
    carburants_rupture_temporaire: string,
    carburants_rupture_definitive: string
    */
  }
  
} 

const rentabilité_string = (current_index : number): string => {
  let rentabilité_liste :string = ""
  rentabilité_liste = rentabilité_liste + "rentabilité : "+calcul_rentabilité(current_index)+"\n"
  
  return rentabilité_liste
}

const carburant_prix_list = (local_index:number):number[] => {
  let local_carburant_prix_list :number[]= []
  if (data_station!=undefined) {
  local_carburant_prix_list = [
  data_station.results[local_index].gazole_prix,
  data_station.results[local_index].e85_prix,
  data_station.results[local_index].e10_prix,
  data_station.results[local_index].sp98_prix,
  data_station.results[local_index].sp95_prix,
  data_station.results[local_index].gplc_prix
  ]}
  return local_carburant_prix_list
}

const calculate_station_distance = (local_index : number):number => {
  let distance=0
  if (data_station!=undefined) {
  distance = calculateDistance(data_station.results[local_index].geom.lat,data_station.results[local_index].geom.lon,base_coord_y,base_coord_x)
  }
  return distance
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calcul_rentabilité = (current_index : number):number => {
  
  let score : number = 0
  if (data_station!=undefined) {
  //console.log("gasole prix : ",data_station.results[carburant_index].gazole_prix)
  

  /**
   * 
   *e85_prix:number,
    sp98_prix:number,
    sp95_prix:number,
    gplc_prix:number
   */
  const Prix_station = carburant_prix_list(current_index)[carburant_index]
  const Distance_en_km = calculate_station_distance(current_index)
  const contenance_reservoir = capacité_réservoir
  const consommation_voiture = carburant_consommation
  
  score = (1/(((Prix_station * contenance_reservoir) + (Distance_en_km*consommation_voiture*prix_moyen()))+0.1))*10000
  }
  
  return score 
}

const prix_moyen = ():number => {
  let local_price :number= 0
  let big_price : number = 0
  if (data_station!=undefined) {
    for (let i = 0; i < data_station.results.length; i++) {
      big_price = big_price + carburant_prix_list(i)[carburant_index]
      
    }
    local_price = big_price/data_station.results.length
  }
  return local_price
}

const fetchData = async (urlParam_location : string) => {
  let coord_x :number= 0
  let coord_y :number= 0
  setLoading(true);
  setError(null);

  
  try {

    // --- NOUVEAU : Appel API supplémentaire pour le géocodage ---
    // Appel à l'API Geopf pour géocoder l'adresse
    const geocodingResponse = await fetch(
      urlParam_location
      //"https://data.geopf.fr/geocodage/search?q=38+rue+S%C3%A9bastien+Mercier+Paris"
    );
    
    if (geocodingResponse.ok) {
      const geocodingResult = await geocodingResponse.json();
      // Tu peux stocker le résultat dans un nouveau state ou le traiter ici
      //console.log("Résultat géocodage :", geocodingResult);
      //console.log("Résultat géocodage 2 :", geocodingResult.features[0].geometry.coordinates[0]);
      
      coord_x = geocodingResult.features[0].geometry.coordinates[0]
      coord_y = geocodingResult.features[0].geometry.coordinates[1]
      
      // Exemple : setGeocodingData(geocodingResult); // si tu as un state dédié
    } else {
      console.warn("Erreur lors du géocodage :", geocodingResponse.status);
    }
    // --- FIN NOUVEAU ---
    if (geocodingResponse.ok) {
        const response = await fetch(
      //"https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records/?lang=fr&limit=50&offset=0&where=within_distance(geom, geom'POINT(7.016 43.572)', 5km)"
      get_carburant_api(coord_x,coord_y)
    );
    
    // Vérifie si la réponse est OK (status 200-299)
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status} - ${response.statusText}`);
    }
    
    // Convertit la réponse en JSON
    const result = await response.json();
    
    // Stocke les données dans le state
    setData(result);
    //setItemlist([]);
    /*
    for (let i = 0; i < result.total_count; i++) {
      itemlist.push(getString(result,i));
    }
    */
    //console.log("ah bon",result.results.length)
    const newItems: string[] = [];
    console.log("geom : ",result.results[0].geom.lat)
    console.log("geom : ",result.results[0].geom.lon)
    setBase_coord_x(coord_x)
    setBase_coord_y(coord_y)
    //console.log("distance : ",)
    setData_station(result)
    // Remplir le tableau avec une boucle
    for (let i = 0; i < result.results.length; i++) {
      newItems.push(get_station_name(result,i));
    }
    setItemlist(newItems);
  }
  } catch (err) {
    // Capture toutes les erreurs (réseau, parsing, etc.)
    //setError(err.message);
    console.error("Erreur lors de l'appel API :");
    
  } finally {
    // Se déclenche toujours, même en cas d'erreur
    setLoading(false);
  }
};











const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCarburantconsommation(value);
    } else if (e.target.value === '') {
      setCarburantconsommation(0);
    }
  };


const handleChange_reservoir = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCapacité_réservoir(value)
    } else if (e.target.value === '') {
      setCapacité_réservoir(0)
    }
  };


















  return (
    <div>
      <div style={{ whiteSpace: 'pre-line' }}>
      {fiche_string}
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p>Erreur : {error}</p>}
      {data && <pre>{adresse_var}</pre>}
      <div>
  {itemlist.map((item, index) => (
    <div key={index}><button onClick={() => show_fiche_station(index)}>{item}</button></div>
  ))}
</div>
<div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <input value={q_city} onChange={(e) => setQ__city(e.target.value)} />
      <button onClick={() => search()}>🔍</button>
    </div>




    

    <input
      type="number"
      min="0.01"
      step="0.01"
      value={carburant_consommation || ''}
      onChange={handleChange}
      placeholder="consommation en carburant (L/KM)"
    />


    <input
      type="number"
      min="0.01"
      step="0.01"
      value={capacité_réservoir || ''}
      onChange={handleChange_reservoir}
      placeholder="capacité du réservoir (L)"
    />

    <select value={carburant_index} onChange={handleSelectChange}>
      {carburant__disponible_name_list.map((fuel, index) => (
        <option key={index} value={index}>
          {fuel}
        </option>
      ))}
    </select>

    <select value={tri_index} onChange={handleSelectChange}>
      {tri_list().map((tri, index) => (
        <option key={index} value={index}>
          {tri}
        </option>
      ))}
    </select>

    </div>
  );
}

export default Carburants