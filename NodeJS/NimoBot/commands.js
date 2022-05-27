const { getRiotAPI, getBotAPI, getLastGameJson, setLastGameJson, getLastGameProFetch, setLastGameProFetch, setProsData, getProsData, getChampsJson, getLeagueData, getCommands, getCommandsPrefix, getTimer, getBotID } = require("./variables");
const { saveCounters, getCounter } = require("./config");
const  fetchDataFromPlayer = require("./modules/lolpros/api");

 // LggAKOtXH6KbVcjqtTVkc2N72zMDhvvXlr_u468nODHnzA <- BR
 // 6MRxbKH_fRwuCsnBELcB4euoGypl83jGHH_wx1bAASQMDqm3zu0IvG8A3A <- EUW
// wS74jwpN4963q3KFDxeUvJm941H8C0vrgHs0UvPVcdl0jA-WZMqLdWKBRq0gvh2Ll8dv3gAHPGTxrQ <- BR
// f7s3_1WUMVyZgm_G7eOIWCyK8ifoJSyGdEQ2aaNUYtqbVgiZClcjk7UvvTKbPO1ia3HuCzFBAPpAqA <- EUW

async function parseCommand(data)
{
    let userMsg = data.msg.trim();

    if(data.userID != getBotID())
        getTimer().OnMessage(data.channelID);

    if(!userMsg.startsWith(getCommandsPrefix(data.channelID)))
        return;

    let command = userMsg.split(" ")[0].substring(1).toLowerCase();

    let msg = "";
    let json = "";
    let saveCounterFlag = false;

    let channelCommands = getCommands(data.channelID);
    let leagueData = getLeagueData(data.channelID);
    let leagueEnabled = leagueData != undefined;
    let leagueSumID = leagueEnabled ? leagueData["SummonerID"] : "";
    let leaguePUUID = leagueEnabled ? leagueData["PUUID"] : "";
    let leagueRegion = leagueEnabled ? leagueData["Region"] : "";

    switch(command)
    {
        case "elo":
            if(!leagueEnabled)
                return;

            json = await getRiotAPI().SummonerByEncryptedSummonerId(leagueSumID, leagueRegion);
            json = getRiotAPI().GetSoloFromJson(json);

            if(json.summonerName != undefined)
            {
                msg = json.summonerName + " - " + json.tier + " " + json.rank + " (" + json.leaguePoints + " PDL)";
        
                if(json.miniSeries)
                {
                    msg += " (MD" + json.miniSeries.progress.length + ": " + json.miniSeries.progress.replaceAll("W", "V").replaceAll("L", "D").replaceAll("N", "-") + ")";
                }

                getBotAPI().sendMessageTag(data.channelID, msg, data.userID, data.nickname);
            }
            break;
        case "wr":
        case "winrate":
            if(!leagueEnabled)
                return;

            json = await getRiotAPI().SummonerByEncryptedSummonerId(leagueSumID, leagueRegion);
            json = getRiotAPI().GetSoloFromJson(json);

            if(json.summonerName != undefined)
            {
                msg = json.summonerName + " - Winrate: " + Math.trunc(((json.wins / (json.wins+json.losses)) * 100)) + "% (" + json.wins + "V " + json.losses + "D)";
            
                getBotAPI().sendMessageTag(data.channelID, msg, data.userID, data.nickname);
            }
            break;
        case "lastgame":
            if(!leagueEnabled)
                return;

            json = await getRiotAPI().MatchesByPUUID(leaguePUUID, leagueRegion);

            if(json.length > 0)
            {
                let lastestMatchID = json[0]; 

                if(getLastGameJson() == undefined || lastestMatchID != getLastGameJson().metadata.matchId)
                {
                    let currentGameJson = await getRiotAPI().MatchByID(lastestMatchID, leagueRegion);

                    setLastGameJson(currentGameJson);
                }

                let teamID = 0;
                let kills = 0;
                let assists = 0;
                let deaths = 0;
                let champion = "";
                let winnerTeam = getLastGameJson().info.teams[0].win == true ? getLastGameJson().info.teams[0].teamId : getLastGameJson().info.teams[1].teamId;

                for(let i = 0; i < getLastGameJson().info.participants.length; i++)
                {
                    if(getLastGameJson().info.participants[i].puuid == leaguePUUID)
                    {
                        teamID = getLastGameJson().info.participants[i].teamId;
                        assists = getLastGameJson().info.participants[i].assists;
                        deaths = getLastGameJson().info.participants[i].deaths;
                        kills = getLastGameJson().info.participants[i].kills;
                        champion = getLastGameJson().info.participants[i].championName;
                        break;
                    }
                }

                let resultado = winnerTeam == teamID ? "Vitória" : "Derrota";
                let kda = (kills + assists) / (deaths == 0 ? 1 : deaths);

                getBotAPI().sendMessageTag(data.channelID, "Ultimo jogo: " + resultado + ". Jogou de " + champion + " " + kills + "/" + deaths + "/" + assists + ". " + Number(kda.toFixed(2)) + " KDA.", data.userID, data.nickname);
            }
            break;
            case "chal":
            case "chall":
            case "challenger":
                if(!leagueEnabled)
                    return;

                json = await getRiotAPI().SummonerByEncryptedSummonerId(leagueSumID, leagueRegion);
                json = getRiotAPI().GetSoloFromJson(json);

                if(json.summonerName != undefined)
                {
                    let leagueUsername = json.summonerName;

                    switch(json.tier)
                    {
                        case "MASTER":
                        case "GRANDMASTER":
                            let summLP = json.leaguePoints;

                            json = await getRiotAPI().GetChallengerQueue(leagueRegion);

                            let pdl = [];
            
                            for(let i = 0; i < json.entries.length; i++)
                            {
                                pdl.push(json.entries[i].leaguePoints);
                            }
            
                            json = await getRiotAPI().GetGrandMasterQueue(leagueRegion);

                            for(let i = 0; i < json.entries.length; i++)
                            {
                                pdl.push(json.entries[i].leaguePoints);
                            }
            
                            pdl.sort(function(a, b)
                            {
                                return (a - b);
                            }).reverse();

                            let queueSize = getRiotAPI().GetChallengerQueueSize(leagueRegion);
                            let pointsToChall = (pdl.length < queueSize || pdl[queueSize - 1] < 500) ? 500 : pdl[queueSize - 1];
                            let remainingPoints = pointsToChall - summLP;

                            if(remainingPoints < 0)
                            {
                                msg = leagueUsername + " passou os " + pointsToChall + " PDL. Próxima att ele deve entrar no challenger.";
                                break;
                            }

                            msg = "Pontos para o Challenger: " + pointsToChall + " PDL (Faltam " + remainingPoints + " PDL).";
                            break;
                        case "CHALLENGER":
                            json = await getRiotAPI().GetChallengerQueue(leagueRegion);

                            let entries = [];

                            for(let i = 0; i < json.entries.length; i++)
                            {
                                entries.push(json.entries[i]);
                            }

                            entries.sort(function(a, b)
                            {
                                return (a.leaguePoints - b.leaguePoints);
                            }).reverse();

                            for(let i = 0; i < entries.length; i++)
                            {
                                if(entries[i].summonerName == leagueUsername)
                                {
                                    msg = "Atualmente TOP " + (i + 1) + " (" + entries[i].leaguePoints + " PDL)";
                                    break;
                                }
                            }

                            break;
                    }

                    if(msg == "")
                        return;

                    getBotAPI().sendMessageTag(data.channelID, msg, data.userID, data.nickname);
                }
                break;
        case "uptime":
            json = await getBotAPI().getFollowList();

            for(var result in json.data.result.content)
            {
                if(json.data.result.content[result].roomID == data.channelID)
                {
                    let lastLiveOnFinishTime = new Date(json.data.result.content[result].lastLiveOnFinishTime * 1000);

                    let statusText = "";

                    if(json.data.result.content[result].onLive == false)
                    {
                        statusText = "offline";
                    } else {
                        statusText = "ao vivo";
                    }

                    getBotAPI().sendMessageTag(data.channelID, "O " + json.data.result.content[result].anchorName + " está " + statusText + " há " + timeDiffCalc(lastLiveOnFinishTime, Date.now()), data.userID, data.nickname);
                    break;
                }
            }
            break;
        case "comandos":
            let cmd = "Comandos:";
            if(leagueEnabled)
                cmd += " elo, winrate, lastgame, chall, "
            cmd += "uptime, ";

            for(let i = 0; i < channelCommands.length; i++)
            {
                if(channelCommands[i].showOnCommands)
                {
                    cmd += channelCommands[i].cmd + ", ";
                }
            }

            getBotAPI().sendMessageTag(data.channelID, cmd, data.userID, data.nickname);
            break;
        case "hora":
                if(true)
                    return;
    
                let dt = new Date();
                dt.setHours(dt.getHours() + 5);
        
                let hora = dt.getHours();
                if(hora < 10)
                    hora = "0" + hora;
        
                let minutos = dt.getMinutes();
                if(minutos < 10)
                    minutos = "0" + minutos;
        
                getBotAPI().sendMessage(data.channelID, "Hora na Espanha: " + hora + ":" + minutos);
                break;
        case "pros":
            if(true)
                return;
                
            json = await getRiotAPI().Spectate(leagueSumID, leagueRegion);
            
            if(getLastGameProFetch() != json.gameId)
            {
                let lolprosJson = await fetchDataFromPlayer("fbcec7d0-988b-4754-b917-dee0898cc706");

                setProsData(lolprosJson);
                setLastGameProFetch(lolprosJson.gameId);
            }

            let prosData = getProsData();
            let champsJson = getChampsJson();

            let text = "";
            for(let i = 0; i < prosData.participants.length; i++)
            {
                if(prosData.participants[i].lolpros != null && prosData.participants[i].lolpros.team != null && prosData.participants[i].lolpros.name != "Tinowns")
                {
                    if(text == "")
                    {
                        text = "PROs: ";
                    } else {
                        text += ", ";
                    }

                    for (var j in champsJson.data) {
                        if (champsJson.data[j].key == prosData.participants[i].championId) {
                            text += champsJson.data[j].id + " (" + prosData.participants[i].lolpros.team.tag + " " + prosData.participants[i].lolpros.name + ")";
                            break;
                        }
                    }
                }
            }

            let finalText = [];

            if(text.length >= 99)
            {
                let newText = text;

                let index = 0;
                do
                {
                    let textStr = newText.substring(0, 95);

                    textStr = textStr.substring(0, textStr.lastIndexOf(",") + 1);
                    
                    finalText.push("(" + (++index) + "/TlengthT) " + textStr);

                    newText = newText.substring(textStr.length);
                } while(newText.length >= 100);

                finalText.push("(" + (++index) + "/TlengthT)" + newText);
            } else {
                finalText.push(text);
            }

            for(let i = 0; i < finalText.length; i++)
            {
                finalText[i] = finalText[i].replace("TlengthT", finalText.length);
            }

            if(text == "")
            {
                getBotAPI().sendMessage(data.channelID, "@" + data.nickname + " não há PROs na partida.");
            } else {
                let timer = ms => new Promise(res => setTimeout(res, ms))

                for(let i = 0; i < finalText.length; i++)
                {
                    getBotAPI().sendMessage(data.channelID, finalText[i]);
                    await timer(2000);
                }
            }
            break;
        default:
            for(let i = 0; i < channelCommands.length; i++)
            {
                let flag = command == channelCommands[i].cmd;

                for(let j = 0; j < channelCommands[i].alias.length; j++)
                {
                    if(command == channelCommands[i].alias[j])
                    {
                        flag = true;
                        break;
                    }
                }

                if(flag)
                {
                    msg = channelCommands[i].response;

                    if(msg.includes("${count}"))
                    {
                        msg = msg.replace("${count}", ++getCounter(command).count);
                        saveCounterFlag = true;
                    }

                    getBotAPI().sendMessage(data.channelID, msg);
                    break;
                }
            }
            break;
    }

    if(saveCounterFlag)
    {
        saveCounters();
    }
}

function timeDiffCalc(dateFuture, dateNow) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    let difference = '';
    if (days > 0) {
        difference += (days === 1) ? `${days} dia ` : `${days} dias `;
    }

    if(hours > 0)
    {
        difference += hours === 1 ? `${hours} hora ` : `${hours} horas `;
    }

    difference += (minutes === 0 || minutes === 1) ? `${minutes} minuto` : `${minutes} minutos`; 

    return difference;
}

module.exports = parseCommand;