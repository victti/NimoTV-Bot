using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot.APIs.Youtube
{
    internal static class YoutubeAPI
    {
        public static bool Enabled => !string.IsNullOrWhiteSpace(apiKey);

        private const string GetVideosUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={0}&maxResults={1}&order=date&type=video&key={2}";

        private static string apiKey;

        public static void Setup(string youtubeKey)
        {
            apiKey = youtubeKey;
        }

        public static async Task<dynamic> GetLatestVideo(string chnID)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return null;

            HttpClient client = new HttpClient();

            using (HttpResponseMessage response = await client.GetAsync(string.Format(GetVideosUrl, chnID, 1, apiKey)))
            {
                using (HttpContent content = response.Content)
                {
                    var json = await content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject(json);
                }
            }
        }

        public static async Task<string> GetLatestVideoURL(string chnID)
        {
            dynamic dataJson = await GetLatestVideo(chnID);

            return "https://youtu.be/" + dataJson.items[0].id.videoId;
        }
    }
}
