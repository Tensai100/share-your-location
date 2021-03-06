const POST_API_URL = 'https://jsonblob.com/api/jsonBlob';
const PUT_API_URL = 'https://jsonblob.com/api/jsonBlob/1729c9b5-885e-11eb-bfb2-ab098250cebb';
const GET_API_URL = 'https://jsonblob.com/api/jsonBlob/2e4fb0f6-885e-11eb-bfb2-6f4579697e75';

let LAT = 0;
let LON = 0;
let ISS_LAT = 0;
let ISS_LON = 0;
const mymap = L.map('issMap').setView([32.292122, -9.198271], 6);

//Creating map
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
).addTo(mymap);

const markerGroup = L.layerGroup().addTo(mymap);


// Location Icon
const myIcon = L.icon({
    iconUrl: './img/icon256.png',
    iconSize: [64, 64],
    iconAnchor: [32, 64],
    popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
});

// ISS
const issIcon = L.icon({
    iconUrl: 'img/iss896x357.png',
    iconSize: [150, 59.6],
    iconAnchor: [75, 38.8],
    popupAnchor: [0, -30] // point from which the popup should open relative to the iconAnchor
});

const issMarker = L.marker([0, 0], { icon: issIcon }).addTo(mymap);

setInterval(
    async () => {
        const url_api = 'https://api.wheretheiss.at/v1/satellites/25544';
        const data = await (await fetch(url_api)).json();

        issMarker.setLatLng([data.latitude, data.longitude]);
        issMarker.bindPopup(`<b>ISS: International Space Station</b><br>Latitude: ${data.latitude}<br>Longitude: ${data.longitude}`);
        ISS_LAT = data.latitude;
        ISS_LON = data.longitude;
    }
    , 1300);




/*
// YOUCODE
const iconYc = L.icon({
    iconUrl: 'https://pbs.twimg.com/profile_images/1029034688323743744/JDOO6a6K_400x400.jpg',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -10] // point from which the popup should open relative to the iconAnchor
});


// Making init markers
const markerYC = L.marker([32.292995, -9.235207], { icon: iconYc }).addTo(mymap);
markerYC.bindPopup('<b>YouCode</b>');
*/

// CLICK EVENT
const newIcon = L.icon({
    iconUrl: './img/icon268.png',
    iconSize: [50, 65],
    iconAnchor: [25, 65],
    popupAnchor: [0, -60] // point from which the popup should open relative to the iconAnchor
});

let clickMarker;
mymap.on('click', e => {
    const clickLocation = e.latlng;
    if (clickMarker) mymap.removeLayer(clickMarker);
    clickMarker = L.marker([clickLocation.lat, clickLocation.lng], { icon: newIcon }).addTo(mymap);
    LAT = clickLocation.lat;
    LON = clickLocation.lng;
    getLocation(LAT, LON, mymap.getZoom());
});



// Get location
getLocation(0, 0, 2);
function getLocation(lat, lon, zoom) {
    document.getElementById('lat').textContent = LAT = lat;
    document.getElementById('lon').textContent = LON = lon;
    mymap.setView([LAT, LON], zoom);
}

function getCurrentLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            document.getElementById('lat').textContent = LAT = position.coords.latitude;
            document.getElementById('lon').textContent = LON = position.coords.longitude;
            mymap.setView([LAT, LON], 15);

            if (clickMarker) mymap.removeLayer(clickMarker);
            clickMarker = L.marker([LAT, LON], { icon: newIcon }).addTo(mymap);
        });
    }
    else {
        console.log('geolocation IS NOT available');
    }
}

function getISSLocation(){
    mymap.setView([ISS_LAT, ISS_LON], 8);
}

async function refreshData() {
    const data = await (await fetch(GET_API_URL)).json();
    for (let id in data) {
        const marker = L.marker([data[id].lat, data[id].lon], { icon: myIcon });
        marker.bindPopup(`<b>${data[id].name}</b><br>Latitude: ${data[id].lat}<br>Longitude: ${data[id].lon}`);
        marker.addTo(markerGroup);
    }
}


setInterval(refreshData, 2000);
setInterval(() => {
    markerGroup.clearLayers();
    refreshData();
}, 30000);




//Sharing location
const isHTML = RegExp.prototype.test.bind(/^(<([^>]+)>)$/i);

async function share() {
    //Name verifications
    const name = document.getElementById('name').value;
    if (name.length <= 0 || isHTML(name)) {
        document.getElementById('infos').textContent = 'Invalid name!';
        document.getElementById('infos').style.color = 'red';
        return;
    }

    if (LAT + LON == 0) {
        document.getElementById('infos').textContent = 'Please choose a location in the map by clicking a single on it';
        return;
    }

    //POST a new JSON file and get its Location_url
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ name, lat: LAT, lon: LON })
    }

    const response = await (await fetch(POST_API_URL, options));
    const location_url = response.headers.get('Location');
    console.log(location_url);



    //Get existing (PUT) JSON file    
    let jsonData = {};
    jsonData = await (await fetch(PUT_API_URL)).json();
    console.log('oldJson: ' + jsonData);


    //Adding 
    const randomId = Date.now().toString();
    jsonData[randomId] = location_url;
    console.log(jsonData);

    options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(jsonData)
    }

    const res = await fetch(PUT_API_URL, options);
    console.log('PUT: ' + res);



    document.getElementById('infos').textContent = 'Localisation shared with succes (If you don\'t see your location, it\'s gonna be added soon as possible)';
    document.getElementById('infos').style.color = 'green';
}