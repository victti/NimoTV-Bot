// NimoTV API Module
var botAPI;

// Riot Games API Module
var riotAPI;

// Bot Variables
var debug = true;

var botID;
var commandsPrefix;
var commands;
var botTimer;
var leagueData;

var lastGameJson;

var champsJson;
var lastGameProFetch;
var prosData;

// Getters
function getRiotAPI()
{
    return riotAPI;
}

function getBotAPI()
{
    return botAPI;
}

function getBotID()
{
    return botID;
}

function getCommandsPrefix(channelID)
{
    return commandsPrefix[channelID];
}

function getCommands(channelID)
{
    return commands[channelID];
}

function getTimer()
{
    return botTimer;
}

function getLeagueData(channelID)
{
    return leagueData[channelID];
}

function getLastGameJson()
{
    return lastGameJson;
}

function getChampsJson()
{
    return champsJson;
}

function getLastGameProFetch()
{
    return lastGameProFetch;
}

function getProsData()
{
    return prosData;
}

// Setters
function setRiotAPI(newriotAPI)
{
    riotAPI = newriotAPI;
}

function setBotAPI(newbotAPI)
{
    botAPI = newbotAPI;
}

function setChannelsData(newBotID, newPrefixes, newCommands, newTimer, newLeagueData)
{
    botID = newBotID;
    commandsPrefix = newPrefixes;
    commands = newCommands;
    botTimer = newTimer;
    leagueData = newLeagueData;
}

function setChampsJson(newChampsJson)
{
    champsJson = newChampsJson;
}

function setLastGameJson(newLastGameJson)
{
    lastGameJson = newLastGameJson;
}

function setLastGameProFetch(newLastGameProFetch)
{
    lastGameProFetch = newLastGameProFetch;
}

function setProsData(newProsData)
{
    prosData = newProsData;
}

module.exports =  { getRiotAPI, getBotAPI, getBotID, getCommandsPrefix, getCommands, getTimer, getLeagueData, getLastGameJson, getChampsJson, getLastGameProFetch, getProsData, setRiotAPI, setBotAPI, setChannelsData, setChampsJson, setLastGameJson, setLastGameProFetch, setProsData, debug }