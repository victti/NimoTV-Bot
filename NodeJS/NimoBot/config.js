const fs = require('fs');

let botCounters = {
    counters: []
};

function readConfig(debug)
{
    console.log('\x1b[35m%s\x1b[0m', "Started reading the " + (debug ? "debug " : "") + "configuration file...");

    let fileToRead = debug ? "debugconfig.json" : "config.json";

    let rawdata = fs.readFileSync(fileToRead);
    let configjson = JSON.parse(rawdata);

    let corsHost = configjson["CORS"]["host"];
    let corsPort = configjson["CORS"]["port"];
    let username = configjson["NimoAPI"]["login"]["username"];
    let lUid =  configjson["NimoAPI"]["login"]["lUid"];
    let sUA = configjson["NimoAPI"]["login"]["sUA"];
    let sAppSrc = configjson["NimoAPI"]["login"]["sAppSrc"];
    let sCookie = configjson["NimoAPI"]["login"]["sCookie"];
    let sGuid = configjson["NimoAPI"]["login"]["sGuid"];
    let sToken = configjson["NimoAPI"]["login"]["sToken"];
    let followerBody = configjson["NimoAPI"]["followerBody"];

    let channels = [];
    let commandPrefix = [];
    let commands = [];
    let timers = [];
    let leagueData = [];
    for(let i = 0; i < configjson["NimoAPI"]["channels"].length; i++)
    {
        let channel = configjson["NimoAPI"]["channels"][i];

        channels.push(channel["channelID"]);

        commandPrefix[channels[i]] = channel["commandPrefix"];
        commands[channels[i]] = [];
        if(channel["commands"] != undefined)
        {
            for(let j = 0; j < channel["commands"].length; j++)
            {
                if(channel["commands"][j]["enabled"] == false)
                    continue;

                commands[channels[i]].push({
                    "showOnCommands": channel["commands"][j]["showOnCommands"],
                    "cmd": channel["commands"][j]["command"],
                    "alias": channel["commands"][j]["alias"],
                    "response": channel["commands"][j]["response"]
                });
            }
        }

        if(channel["timers"] != undefined)
        {
            timers.push(
                {
                    "chnId": channels[i],
                    "timers": []
                }
            );

            for(let j = 0; j < channel["timers"].length; j++)
            {
                if(channel["timers"][j]["enabled"] == false)
                    continue;

                timers[i].timers.push(
                    {
                        "chatLines": channel["timers"][j]["chatLines"],
                        "message": channel["timers"][j]["message"],
                        "interval": channel["timers"][j]["interval"] * 1000
                    }
                );
            }
        }

        if(channel["league"] != undefined)
            leagueData[channels[i]] = {"SummonerID": channel["league"]["SummonerID"], "PUUID": channel["league"]["PUUID"], "Region": channel["league"]["Region"].toUpperCase()};
    }

    console.log('\x1b[32m%s\x1b[0m', "Finished reading the configuration file...");

    return {
        corsHost,
        corsPort,
        username,
        lUid,
        sUA,
        sAppSrc,
        sCookie,
        sGuid,
        sToken,
        followerBody,
        channels,
        commandPrefix,
        commands,
        timers,
        leagueData
    };
}

function readCounters()
{
    fs.readFile('counters.json', 'utf8', function readFileCallback(err, data)
    {
        if (err)
        {
            console.log(err);
        } 
        else
        {
            botCounters = JSON.parse(data);
        }
    });
}

function saveCounters()
{
    let json = JSON.stringify(botCounters);

    fs.writeFile('counters.json', json, 'utf8', () => {});
}

function getCounter(name)
{
    for(let i = 0; i < botCounters.counters.length; i++)
    {
        if(botCounters.counters[i].name == name)
        {
            return botCounters.counters[i];
        }
    }

    botCounters.counters.push({name: name, count: 0});
    return botCounters.counters[botCounters.counters.length - 1];
}

module.exports = 
{
    readConfig,
    readCounters,
    saveCounters,
    getCounter
}