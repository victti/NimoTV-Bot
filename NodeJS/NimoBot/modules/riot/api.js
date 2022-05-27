const fetch = require('node-fetch');

var RiotAPI = function(apiKey)
{
    _riotAPI = this;

    _riotAPI.apiKey = apiKey;
}

RiotAPI.prototype.SummonerByEncryptedSummonerId = async function(encryptedSummonerId, server)
{
    let serverRegion = getSaneServer(server);

    let url = "https://" + serverRegion + ".api.riotgames.com/lol/league/v4/entries/by-summoner/" + encryptedSummonerId + "?api_key=" + _riotAPI.apiKey;

    let settings = { method: "Get" };
    
    let response = await fetch(url, settings);
    return await response.json();
} 

RiotAPI.prototype.MatchesByPUUID = async function(puuid, server)
{
    let serverRegion = getSaneServer(server);
    let region = getRegion(serverRegion);

    let url = "https://" + region + ".api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid + "/ids?api_key=" + _riotAPI.apiKey;

    let settings = { method: "Get" };
    
    let response = await fetch(url, settings);
    return await response.json();
}

RiotAPI.prototype.MatchByID = async function(matchId, server)
{
    let serverRegion = getSaneServer(server);
    let region = getRegion(serverRegion);

    let url = "https://" + region + ".api.riotgames.com/lol/match/v5/matches/" + matchId + "?api_key=" + _riotAPI.apiKey;

    let settings = { method: "Get" };
    
    let response = await fetch(url, settings);
    return await response.json();
}

RiotAPI.prototype.Spectate = async function(encryptedSummonerId, server)
{
    let serverRegion = getSaneServer(server);

    let url = "https://" + serverRegion + ".api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + encryptedSummonerId + "?api_key=" + _riotAPI.apiKey;

    let settings = { method: "Get" };
    
    let response = await fetch(url, settings);
    return await response.json();
}

RiotAPI.prototype.GetChallengerQueue = async function(server)
{
    let serverRegion = getSaneServer(server);

    let url = "https://" + serverRegion + ".api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=" + _riotAPI.apiKey;

    let settings = { method: "Get" };
    
    let response = await fetch(url, settings);
    return await response.json();
}

RiotAPI.prototype.GetGrandMasterQueue = async function(server)
{
    let serverRegion = getSaneServer(server);

    let url = "https://" + serverRegion + ".api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5?api_key=" + _riotAPI.apiKey;

    let settings = { method: "Get" };
    
    let response = await fetch(url, settings);
    return await response.json();
}

RiotAPI.prototype.GetSoloFromJson = function(json)
{
    for(let queue in json)
    {
        if(json[queue].queueType == "RANKED_SOLO_5x5"){
            return json[queue];
        }
    }

    return "";
}

let url = 

RiotAPI.prototype.IsHighTier = function(teamTag)
{
    switch(teamTag)
    {
        case "EDG":
        case "T1":
        case "MAD":
            return true;
        default:
            return false;
    }
}

RiotAPI.prototype.GetChallengerQueueSize = function(server)
{
    switch(server)
    {
        case "BR":
        case "EUN":
        case "EUW":
        case "JP":
        case "NA":
        case "OC":
        case "TR":
            return this.GetChallengerQueue(server + "1") ;  
        case "JP1":
        case "OC1":
        case "RU":
            return 50;
        case "BR1":
        case "EUN1":
        case "TR1":
        case "LA1":
        case "LA2":
            return 200;
        case "EUW1":
        case "KR":
        case "NA1":
            return 300;
        case "LA":
            throw "Specificy the LA server number (1/2)";
    }
}

function getSaneServer(server)
{
    switch(server)
    {
        case "BR":
        case "EUN":
        case "EUW":
        case "JP":
        case "NA":
        case "OC":
        case "TR":
            return server + "1";  
        case "BR1":
        case "EUN1":
        case "EUW1":
        case "JP1":
        case "KR":
        case "NA1":
        case "OC1":
        case "RU":
        case "TR1":
        case "LA1":
        case "LA2":
            return server;
        case "LA":
            throw "Specificy the LA server number (1/2)";
    }
}

function getRegion(server)
{
    switch(server)
    {
        case "BR1":
        case "LA1":
        case "LA2":
        case "NA1":
        case "OC1":
            return "americas";
        case "JP":
        case "KR":
            return "asia";
        case "EUN1":
        case "EUW1":
        case "RU":
        case "TR1":
            return "europe";
    }
}

module.exports = RiotAPI;