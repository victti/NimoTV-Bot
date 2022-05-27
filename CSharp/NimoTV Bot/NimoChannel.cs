using Jering.Javascript.NodeJS;
using Newtonsoft.Json;
using NimoTV_Bot.APIs.Riot;
using NimoTV_Bot.APIs.Youtube;
using NimoTV_Bot.Modules;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal class NimoChannel : NimoClient
    {
        private VicBot bot;

        private VoteModule voteModule;

        private Dictionary<string, Command> commands;

        private Dictionary<string, DateTime> cooldowns;

        private dynamic? latestGameJSON;

        public VoteModule VoteModule => voteModule;

        public NimoChannel(VicBot bot, long channelId, Configuration configuration)
            :base(channelId, configuration)
        {
            this.bot = bot;
            voteModule = new VoteModule();
            commands = configuration.GetChannelCommands(channelId);
            cooldowns = new Dictionary<string, DateTime>();
            OnMessageReceived += OnMessage;
        }

        private async void OnMessage(NimoMessage message)
        {
            if (!message.text.StartsWith("!"))
                return;

            string[] cmdSplit = message.text.Split(" ");
            string cmd = cmdSplit[0][1..].ToLowerInvariant();

            string response = "";
            bool tagUser = false;
            dynamic? json;

            // debug
            string leagueSumID = "LggAKOtXH6KbVcjqtTVkc2N72zMDhvvXlr_u468nODHnzA";
            string leagueRegion = "BR1";
            string leaguePUUID = "wS74jwpN4963q3KFDxeUvJm941H8C0vrgHs0UvPVcdl0jA-WZMqLdWKBRq0gvh2Ll8dv3gAHPGTxrQ";

            switch (cmd)
            {
                case "elo":
                    if (!LeagueAPI.Enabled)
                        break;

                    json = await LeagueAPI.GetSummonerByEncryptedSummonerID(leagueSumID, leagueRegion);
                    json = LeagueAPI.GetSoloQueueFromJson(json);

                    if (json == null)
                        break;

                    if (json.summonerName != null)
                    {
                        response = json.summonerName + " - " + json.tier + " " + json.rank + " (" + json.leaguePoints + " PDL)";

                        if (json.miniSeries != null)
                        {
                            response += " (MD" + json.miniSeries.progress.length + ": " + json.miniSeries.progress.Replace("W", "V").Replace("L", "D").Replace("N", "-") + ")";
                        }

                        tagUser = true;
                    }
                    break;
                case "wr":
                case "winrate":
                    if (!LeagueAPI.Enabled)
                        break;

                    json = await LeagueAPI.GetSummonerByEncryptedSummonerID(leagueSumID, leagueRegion);
                    json = LeagueAPI.GetSoloQueueFromJson(json);

                    if (json == null)
                        break;

                    if (json.summonerName != null)
                    {
                        double jsonWins = Convert.ToDouble(json.wins);
                        double jsonLosses = Convert.ToDouble(json.losses);

                        response = json.summonerName + " - Winrate: " + Math.Truncate(((jsonWins / (jsonWins + jsonLosses)) * 100)) + "% (" + jsonWins + "V " + jsonLosses + "D)";
                        
                        tagUser = true;
                    }
                    break;
                case "lastgame":
                    if (!LeagueAPI.Enabled)
                        break;

                    json = await LeagueAPI.GetMatchesByPUUID(leaguePUUID, leagueRegion);

                    if (json == null)
                        break;

                    if (json.Count > 0)
                    {
                        string lastestMatchID = json[0].ToString();

                        if (latestGameJSON == null || lastestMatchID != latestGameJSON.metadata.matchId.ToString())
                        {
                            latestGameJSON = await LeagueAPI.GetMatchByID(lastestMatchID, leagueRegion);
                        }

                        int teamID = 0;
                        int kills = 0;
                        int assists = 0;
                        int deaths = 0;
                        string champion = "";
                        int winnerTeam = latestGameJSON.info.teams[0].win == true ? latestGameJSON.info.teams[0].teamId : latestGameJSON.info.teams[1].teamId;

                        for (int i = 0; i < latestGameJSON.info.participants.Count; i++)
                        {
                            if (latestGameJSON.info.participants[i].puuid == leaguePUUID)
                            {
                                teamID = Convert.ToInt32(latestGameJSON.info.participants[i].teamId);
                                assists = Convert.ToInt32(latestGameJSON.info.participants[i].assists);
                                deaths = Convert.ToInt32(latestGameJSON.info.participants[i].deaths);
                                kills = Convert.ToInt32(latestGameJSON.info.participants[i].kills);
                                champion = latestGameJSON.info.participants[i].championName;
                                break;
                            }
                        }

                        string resultado = winnerTeam == teamID ? "Vitória" : "Derrota";
                        float kda = 1.0f * (kills + assists) / (deaths == 0 ? 1 : deaths);

                        response = "Ultimo jogo: " + resultado + ". Jogou de " + champion + " " + kills + "/" + deaths + "/" + assists + ". " + Math.Round(kda, 2) + " KDA.";

                        tagUser = true;
                    }
                    break;
                case "chal":
                case "chall":
                case "challenger":
                    if (!LeagueAPI.Enabled)
                        break;

                    json = await LeagueAPI.GetSummonerByEncryptedSummonerID(leagueSumID, leagueRegion);
                    json = LeagueAPI.GetSoloQueueFromJson(json);

                    if (json == null)
                        break;

                    if (json.summonerName != null)
                    {
                        string leagueUsername = json.summonerName;

                        switch (json.tier.ToString())
                        {
                            case "MASTER":
                            case "GRANDMASTER":
                                int summLP = json.leaguePoints;

                                json = await LeagueAPI.GetChallengerQueue(leagueRegion);

                                List<dynamic> pdl = new List<dynamic>();

                                foreach (dynamic entry in json.entries)
                                {
                                    pdl.Add(entry.leaguePoints);
                                }

                                json = await LeagueAPI.GetGrandMasterQueue(leagueRegion);

                                foreach (dynamic entry in json.entries)
                                {
                                    pdl.Add(entry.leaguePoints);
                                }

                                pdl.Sort((a, b) => a - b);
                                pdl.Reverse();

                                int queueSize = LeagueAPI.GetChallengerQueueSize(leagueRegion);
                                int pointsToChall = (pdl.Count < queueSize || pdl[queueSize - 1] < 500) ? 500 : pdl[queueSize - 1];
                                int remainingPoints = pointsToChall - summLP;

                                if (remainingPoints < 0)
                                {
                                    response = leagueUsername + " passou os " + pointsToChall + " PDL. Próxima att ele deve entrar no challenger.";
                                    break;
                                }

                                response = "Pontos para o Challenger: " + pointsToChall + " PDL (Faltam " + remainingPoints + " PDL).";
                                break;
                            case "CHALLENGER":
                                json = await LeagueAPI.GetChallengerQueue(leagueRegion);

                                List<dynamic> entries = new List<dynamic>();

                                foreach (dynamic entry in json.entries)
                                {
                                    entries.Add(entry);
                                }

                                entries.Sort((a, b) => a.leaguePoints - b.leaguePoints);
                                entries.Reverse();

                                for (int i = 0; i < entries.Count; i++)
                                {
                                    if (entries[i].summonerName == leagueUsername)
                                    {
                                        response = "Atualmente TOP " + (i + 1) + " (" + entries[i].leaguePoints + " PDL)";
                                        break;
                                    }
                                }

                                break;
                        }

                        tagUser = true;
                    }
                    break;
                case "youtube":
                    response = "Ultimo video: ";
                    response += await YoutubeAPI.GetLatestVideoURL("UCSEMGeURgOonnoACa7FRF8g");
                    break;
                case "comandos":
                case "commands":
                    response = "Comandos:";

                    if (LeagueAPI.Enabled)
                        response += " elo, winrate, lastgame, chall, ";

                    if (YoutubeAPI.Enabled)
                        response += "youtube, ";

                    foreach(string cmdName in commands.Keys)
                    {
                        response += cmdName + ", ";
                    }

                    tagUser = true;
                    break;
                case "say":
                    if (!message.IsFromADM())
                        return;

                    response = message.text.Split(" ", 2)[1];
                    break;
                case "vote":
                    if (cmdSplit.Length > 1)
                    {
                        switch (cmdSplit[1])
                        {
                            case "start":
                                if (message.IsFromADM())
                                {
                                    voteModule.Start();
                                    response = "Vote has been started!";
                                }
                                break;
                            case "stop":
                                if (message.IsFromADM())
                                {
                                    voteModule.Stop();
                                    response = "Vote has been stopped!";
                                }
                                break;
                            case "reset":
                                if (message.IsFromADM())
                                {
                                    voteModule.Reset();
                                    response = "Vote has been reseted!";
                                }
                                break;
                            case "draw":
                                if (message.IsFromADM())
                                {
                                    string winners = voteModule.Draw(out int totalVotes);
                                    if (totalVotes > 0)
                                    {
                                        response = "Vote winner(s): " + winners + " (" + totalVotes + " votes)";
                                    }
                                }
                                break;
                            default:
                                voteModule.Vote(message.username, message.text.Split(" ", 2)[1].ToLowerInvariant().Trim());
                                break;
                        }
                        tagUser = true;
                    }
                    break;
                default:
                    foreach(Command command in commands.Values)
                    {
                        if (command.CMD == cmd || command.IsAlias(cmd))
                        {
                            response = await command.GetResponse(message.text.Split(" ").Skip(1).ToArray());
                            tagUser = command.tagUser;
                        }
                    }
                    break;
            }

            if(!string.IsNullOrWhiteSpace(response))
            {
                if (!CanUseCommand(cmd))
                    return;

                SetCooldown(cmd);

                if (response.Contains("${count}"))
                {
                    response = response.Replace("${count}", bot.GetNextCommandCounter(channelId, cmd).ToString());
                }

                if (response.Contains("${random}"))
                {
                    response = response.Replace("${random}", Utils.RandomNum(100).ToString());
                }

                if (tagUser)
                {
                    await SendMessage(response, message.userID, message.username);
                } else
                {
                    await SendMessage(response);
                }
            }
        }

        private bool CanUseCommand(string cmd)
        {
            if (!cooldowns.ContainsKey(cmd))
                return true;

            return DateTime.UtcNow.Subtract(cooldowns[cmd]).TotalSeconds >= 0;
        }

        private void SetCooldown(string cmd)
        {
            int cooldown = 3;

            if (commands.ContainsKey(cmd))
                cooldown = commands[cmd].cooldown;

            cooldowns[cmd] = DateTime.UtcNow.AddSeconds(cooldown);
        }
    }
}