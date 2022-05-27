const fetch = require('node-fetch');

async function fetchDataFromPlayer(playerId)
{
    let url = "http://localhost:8080/https://api.lolpros.gg/lol/game/from-player/" + playerId;

    let settings = {
        method: "Get",
        headers: { 
            "x-requested-with": "XMLHttpRequest"
        }
    };
    
    let response = await fetch(url, settings);
    return await response.json();
}

module.exports = fetchDataFromPlayer;