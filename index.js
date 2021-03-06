require('dotenv').config();
const fs = require('fs');
const fetch = require(('node-fetch'));
const https = require('https');
const express = require('express');
const app = express();

app.listen(3000, () => console.log('The server is listening on port 3000'));

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));

const POST_API_URL = 'https://jsonblob.com/api/jsonBlob';
const PUT_API_URL = 'https://jsonblob.com/api/jsonBlob/1729c9b5-885e-11eb-bfb2-ab098250cebb';
const GET_API_URL = 'https://jsonblob.com/api/jsonBlob/2e4fb0f6-885e-11eb-bfb2-6f4579697e75';
const LOCAL_JSON_LINK = './location.json';

function getLocalJson() {
    if (fs.existsSync(LOCAL_JSON_LINK)) {
        const stringJson = fs.readFileSync(LOCAL_JSON_LINK);
        return JSON.parse(stringJson);
    }
    else {
        return {};
    }
}

async function RefreshingData() {

    //Get (PUTED) JSON file    
    let json_toPUT = {};
    try {
        json_toPUT = await (await fetch(PUT_API_URL)).json();

        //Get Local JSON file
        const localJson = getLocalJson();

        //PUTTING new JSON to old
        const ids = Object.getOwnPropertyNames(json_toPUT);
        for (let i = 0; i < ids.length; i++) {
            localJson[ids[i]] = await (await fetch(json_toPUT[ids[i]])).json();
        }

        fs.writeFile(LOCAL_JSON_LINK, JSON.stringify(localJson, null, 2), err => {
            if (err)
                console.log("Error in fs.writeFile: " + err);
            // console.log('Success: File saved');
        });

        // Upload JSON file
        let options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(localJson)
        }

        let res = await fetch(GET_API_URL, options);

        // Clean (PUTED) JSON file 
        options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({})
        }

        res = await fetch(PUT_API_URL, options);
        // console.log('Success: Cleaned');
        
        console.log('Success: API Uploaded');
    }
    catch (err) { console.log(err); }

}

setInterval(RefreshingData, 5000);














// app.get('/api', (request, response) => {
//     let jsonLocation = {};
//     if (fs.existsSync(LOCAL_JSON_LINK)){
//         fs.readFile(LOCAL_JSON_LINK, async (err, stringJson) => {
//             if (err) 
//                 console.log('Error in fs.readFile: ' + err);
//             else {
//                 try{
//                     jsonLocation = await JSON.parse(stringJson);              
//                 }
//                 catch(err){ console.log('Error in JSON.parse: ' + err);}

//                 response.status(200).json(jsonLocation);     
//             }
//         }); 
//     }
// });

// app.post('/api', (request, response) => {
//     const newData = request.body;
//     let oldJson = {};

//     if (fs.existsSync(LOCAL_JSON_LINK)){
//         try
//         {
//             const stringJson = fs.readFileSync(LOCAL_JSON_LINK); 
//             try{
//                 oldJson = JSON.parse(stringJson);                    
//             }
//             catch(err){ console.log('Error in JSON.parse: ' + err);}             
//         }
//         catch(err){ console.log("Error in fs.readFileSync: " + err);}  
//     }

//     const randomId = Date.now().toString();
//     oldJson[randomId] = newData;
//     fs.writeFile(LOCAL_JSON_LINK, JSON.stringify(oldJson, null, 2), err => {
//         if (err)
//             console.log("Error in fs.writeFile: " + err);
//     });


//     response.json({
//         status: "Success",
//         latitude: newData.lat, 
//         longitude: newData.lon
//     });
// })