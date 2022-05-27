const { setRiotAPI, setBotAPI, debug, getBotAPI, setChampsJson, setLeagueData, setCommandsPrefix, setCommands, setChannelsData, getTimer } = require("./variables");
const { readConfig, readCounters, readDebugConfig } = require("./config");
const StartProxy = require("./modules/cors/setup");
const parseCommand = require("./commands");
const fetchChampionsJson = require("./modules/datadragon/api");
const Timer = require("./timers");

async function start()
{    
    console.log('\x1b[36m%s\x1b[0m', "==================================== Made by victti ====================================");
    console.log('\x1b[36m%s\x1b[0m', "================== Base source code for NimoTV API by franciscojr-dev ==================");
    console.log("");

    console.log('\x1b[35m%s\x1b[0m', "Starting the NimoBOT...")

    let { corsHost, corsPort, username, lUid, sUA, sAppSrc, sCookie, sGuid, sToken, followerBody, channels, commandPrefix, commands, timers, leagueData } = readConfig(debug);

    StartProxy(corsHost, corsPort);

    console.log('\x1b[35m%s\x1b[0m', "Starting Riot API");

    let RiotAPI = require('./modules/riot/api');
    setRiotAPI(new RiotAPI(""))

    let champsJson = await fetchChampionsJson();
    setChampsJson(champsJson);

    console.log('\x1b[32m%s\x1b[0m', "Finished starting Riot API");

    readCounters();

    console.log('\x1b[35m%s\x1b[0m', "Creating Nimo API");

    let NimoAPI = require('./modules/nimo/NimoAPI');
    setBotAPI(new NimoAPI(username, lUid, sGuid, sUA, sAppSrc, sCookie, sToken, followerBody, channels, parseCommand));
    setChannelsData(lUid, commandPrefix, commands, new Timer(timers), leagueData);

    console.log('\x1b[32m%s\x1b[0m', "Finished creating Nimo API");

    getBotAPI().start();

    console.log('\x1b[32m%s\x1b[0m', "NimoBOT has been started...")
}

start();