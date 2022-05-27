using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot.APIs.Riot
{
    internal static class LeagueAPI
    {
        public static bool Enabled => !string.IsNullOrWhiteSpace(apiKey);

        private const string LeagueBySummonerV4 = "https://{0}.api.riotgames.com/lol/league/v4/entries/by-summoner/{1}?api_key={2}";

        private const string LeagueMatchesByPuuidV5 = "https://{0}.api.riotgames.com/lol/match/v5/matches/by-puuid/{1}/ids?api_key={2}";

        private const string LeagueMatchByMatchIdV5 = "https://{0}.api.riotgames.com/lol/match/v5/matches/{1}?api_key={2}";

        private const string LeagueSpectateBySummonerV4 = "https://{0}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/{1}?api_key={2}";

        private const string LeagueChallengerByQueueV4 = "https://{0}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key={1}";

        private const string LeagueGrandmasterByQueueV4 = "https://{0}.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5?api_key={1}";

        private static string apiKey;

        public static void Setup(string riotKey)
        {
            apiKey = riotKey;
        }

        public static async Task<dynamic?> GetSummonerByEncryptedSummonerID(string encryptedSummonerID, string server)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return null;

            HttpClient client = new HttpClient();

            using (HttpResponseMessage response = await client.GetAsync(string.Format(LeagueBySummonerV4, GetSaneServer(server), encryptedSummonerID, apiKey)))
            {
                using (HttpContent content = response.Content)
                {
                    var json = await content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject(json);
                }
            }
        }

        public static async Task<dynamic?> GetMatchesByPUUID(string puuid, string server)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return null;

            HttpClient client = new HttpClient();

            using (HttpResponseMessage response = await client.GetAsync(string.Format(LeagueMatchesByPuuidV5, GetRegion(GetSaneServer(server)), puuid, apiKey)))
            {
                using (HttpContent content = response.Content)
                {
                    var json = await content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject(json);
                }
            }
        }

        public static async Task<dynamic?> GetMatchByID(string matchID, string server)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return null;

            HttpClient client = new HttpClient();

            using (HttpResponseMessage response = await client.GetAsync(string.Format(LeagueMatchByMatchIdV5, GetRegion(GetSaneServer(server)), matchID, apiKey)))
            {
                using (HttpContent content = response.Content)
                {
                    var json = await content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject(json);
                }
            }
        }

        public static async Task<dynamic?> Spectate(string encryptedSummonerID, string server)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return null;

            HttpClient client = new HttpClient();

            using (HttpResponseMessage response = await client.GetAsync(string.Format(LeagueSpectateBySummonerV4, GetSaneServer(server), encryptedSummonerID, apiKey)))
            {
                using (HttpContent content = response.Content)
                {
                    var json = await content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject(json);
                }
            }
        }

        public static async Task<dynamic?> GetChallengerQueue(string server)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return null;

            HttpClient client = new HttpClient();

            using (HttpResponseMessage response = await client.GetAsync(string.Format(LeagueChallengerByQueueV4, GetSaneServer(server), apiKey)))
            {
                using (HttpContent content = response.Content)
                {
                    var json = await content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject(json);
                }
            }
        }

        public static async Task<dynamic?> GetGrandMasterQueue(string server)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return null;

            HttpClient client = new HttpClient();

            using (HttpResponseMessage response = await client.GetAsync(string.Format(LeagueGrandmasterByQueueV4, GetSaneServer(server), apiKey)))
            {
                using (HttpContent content = response.Content)
                {
                    var json = await content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject(json);
                }
            }
        }

        public static object? GetSoloQueueFromJson(dynamic json)
        {
            foreach(dynamic queue in json)
            {
                if (queue.queueType == "RANKED_SOLO_5x5")
                    return queue;
            }

            return null;
        }

        public static int GetChallengerQueueSize(string server)
        {
            switch (server)
            {
                case "BR":
                case "EUN":
                case "EUW":
                case "JP":
                case "NA":
                case "OC":
                case "TR":
                    return GetChallengerQueueSize(server + "1");
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
                    throw new Exception("Specificy the LA server number (1/2)");
                default:
                    throw new Exception("Server " + server + " not found");
            }
        }

        private static string GetSaneServer(string server)
        {
            switch (server)
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
                    throw new Exception("Specificy the LA server number (1/2)");
                default:
                    throw new Exception("Server " + server + " not found");
            }
        }

        private static string GetRegion(string server)
        {
            switch (server)
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
                default:
                    throw new Exception("Server " + server + " not found");
            }
        }
    }
}
