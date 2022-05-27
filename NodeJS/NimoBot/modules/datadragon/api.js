const fetch = require('node-fetch');

async function fetchChampionsJson()
{
    let url = "http://ddragon.leagueoflegends.com/cdn/11.20.1/data/en_US/champion.json";

    let settings = { method: "Get" };
    
    let response = await fetch(url, settings);
    return await response.json();
}

module.exports = fetchChampionsJson;