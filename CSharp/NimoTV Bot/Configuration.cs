using Newtonsoft.Json;
using NimoTV_Bot.APIs.Riot;
using NimoTV_Bot.APIs.Youtube;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal class Configuration
    {
        public string username;

        public string cachedHex_username;

        public long lUid;

        public string cachedHex_lUid;

        public string sUA;

        public string cachedHex_sUA;

        public string sAppSrc;

        public string cachedHex_sAppSrc;

        public string sCookie;

        public string cachedHex_sCookie;

        public string sGuid;

        public string cachedHex_sGuid;

        public string sToken;

        public string cachedHex_sToken;

        public string country;

        public string cachedHex_country;

        public string lang;

        public string cachedHex_lang;

        public string followerBody;

        private Dictionary<long, List<Command>> commands;

        public Configuration(bool debug)
        {
            string jsonStr = debug ? File.ReadAllText("./debugconfig.json") : File.ReadAllText("./config.json");

            dynamic json = JsonConvert.DeserializeObject(jsonStr);

            if (json.Riot.enabled == true)
                LeagueAPI.Setup(json.Riot.key.ToString());

            if (json.YouTube.enabled == true)
                YoutubeAPI.Setup(json.YouTube.key.ToString());

            username = json.Nimo.login.username;
            lUid = json.Nimo.login.lUid;
            sUA = json.Nimo.login.sUA;
            sAppSrc = json.Nimo.login.sAppSrc;
            sCookie = json.Nimo.login.sCookie;
            sGuid = json.Nimo.login.sGuid;
            sToken = json.Nimo.login.sToken;

            followerBody = json.Nimo.followerBody;

            country = sAppSrc.Split("&")[1];
            lang = sAppSrc.Split("&")[2];

            commands = new Dictionary<long, List<Command>>();
            foreach (dynamic channel in json.Nimo.channels)
            {
                long channelID = Convert.ToInt64(channel.channelID);
                commands.Add(channelID, new List<Command>());

                foreach(dynamic command in channel.commands)
                {
                    if (command.enabled != true)
                        continue;

                    List<string> alias = new List<string>();
                    foreach(dynamic cmdAlias in command.alias)
                    {
                        alias.Add(cmdAlias.ToString());
                    }

                    int cooldown = 3;

                    if (command.cooldown != null)
                        cooldown = Convert.ToInt32(command.cooldown);

                    if (command.script != null)
                    {
                        List<object> args = new List<object>();
                        foreach (dynamic cmdAlias in command.args)
                        {
                            args.Add(cmdAlias.ToString());
                        }

                        commands[channelID].Add(new JavascriptCommand(command.command.ToString(), alias.ToArray(), false, cooldown, command.script.ToString(), args.ToArray()));
                        continue;
                    }

                    commands[channelID].Add(new RegularCommand(command.command.ToString(), alias.ToArray(), false, cooldown, command.response.ToString()));
                }
            }

            GenerateCachedHexVariables();
        }

        private void GenerateCachedHexVariables()
        {
            cachedHex_username = Utils.Ascii2Hex(username);
            cachedHex_lUid = Utils.Number2Hex(lUid);
            cachedHex_sUA = Utils.Ascii2Hex(sUA);
            cachedHex_sAppSrc = Utils.Ascii2Hex(sAppSrc);
            cachedHex_sCookie = Utils.Ascii2Hex(sCookie);
            cachedHex_sGuid = Utils.Ascii2Hex(sGuid);
            cachedHex_sToken = Utils.Ascii2Hex(sToken);
            cachedHex_country = Utils.Ascii2Hex(country);
            cachedHex_lang = Utils.Ascii2Hex(lang);
        }

        public string[] GenerateHello()
        {
            string[] result = new string[2];

            string sGuidLength = Utils.Number2Hex(sGuid.Length);

            result[0] = Utils.EncodeBase64(Utils.Hex2Ascii("00031d0001008b0000008b10032c3c40ff56066c61756e6368660877734c61756e63687d0000660800010604745265711d0000590a030000" + cachedHex_lUid + "16" + sGuidLength + "" + cachedHex_sGuid + "2610776562683526302e302e31266e696d6f360c4e494d4f26425226313034364a060016002600360046000b0b8c980ca80c2c36004c5c6600"));

            string bufferLength = Utils.Number2Hex((1 + 8) + (sUA.Length + 1) + (sAppSrc.Length + 1) + (sCookie.Length + 4) + (sGuid.Length + 1) + (1 + 4) + 1);
            
            result[1] = Utils.EncodeBase64(Utils.Hex2Ascii("000a1d0001" + bufferLength + "030000" + cachedHex_lUid + "16" + Utils.Number2Hex(sUA.Length) + "" + cachedHex_sUA + "270000" + Utils.Number2Hex(sCookie.Length) + "" + cachedHex_sCookie + "36" + sGuidLength + "" + cachedHex_sGuid + "400156" + Utils.Number2Hex(sAppSrc.Length) + "" + cachedHex_sAppSrc + "2c36004c5c6600"));

            return result;
        }

        public string[] GenerateInfo(string schannelID, string lchannelID)
        {
            string[] result = new string[4];

            result[0] = Utils.EncodeBase64(Utils.Hex2Ascii("00101d0001010f09000f06086e696d6f3a616c6c06116e696d6f3a315f" + schannelID + "06166e696d6f3a31335f" + schannelID + "5f77656206186e696d6f3a315f" + schannelID + "5f42525f77656206096e696d6f3a325f4252060a6e696d6f3a335f776562060b6e696d6f3a345f31303436060f6e696d6f3a375f313034365f776562060e6e696d6f3a355f42525f3130343606126e696d6f3a365f42525f313034365f776562060b6e696d6f3a385f31303436060e6e696d6f3a395f31305f31303436060a6e696d6f3a31305f313006176e696d6f3a31345f" + schannelID + "5f31303436061e6e696d6f3a31355f" + schannelID + "5f42525f313034365f77656216002c36004c"));
            result[1] = Utils.EncodeBase64(Utils.Hex2Ascii("00031d000101f5000001f510032c3c400656066e696d6f7569660b4f6e557365724576656e747d000101cc0800010604745265711d000101be0a0a030000" + cachedHex_lUid + "1609636f6d706f6e656e742700000158" + cachedHex_sToken + "361077656226312e302e34266e696d6f5456460056" + Utils.Number2Hex(lang.Length) + "" + cachedHex_lang + "6603322e31706386" + Utils.Number2Hex(country.Length) + "" + cachedHex_country + "9600a600b0050b1001230000022eae538fee33000000" + lchannelID + "4001560669676e6f72650b8c980ca80c2c3621366532633566643563376461383766312d366532633566643563376461383766314c"));

            result[2] = "AAMdAAECBgAAAgYQAyw8QBxWBm5pbW91aWYPT25Vc2VySGVhcnRCZWF0fQABAdkIAAEGBHRSZXEdAAEBywoKAwAAAi6uU4/uFiAwYTQ3Njk0ZTY0Yzc5MTYwMWQxMjY2OGI2NzhiN2IzMicAAAFYQVFBZEtUaV8yLWpxcVNDUnU0S2J6RVhnT29EaG11QkVpVXdYazVuVkd5bHRxdHNzRmVsSWxRN2l2LWRROFhySnpqWnZ5NXQwODRBc0YtTERKOUVIekNqQ3prX3FmdTRPbW1wVHhiaUNzbkZ0bWY3SjVnU2tiWlFpLUVOc09aUVZiTkc5Mk8wYzAtYWhwbEtvUWxRekdGR2VXNWVxU3pvcGdzU0xuZVliQ3VfNU5kWTFvTG1zci1BZHI5aE5WYmEydF9fSmJpM1dCZmlZUXp2RVNVM0pDSVZBMHNmazFwUVVUUVcyUGk0TU9BaDU4anFXQWN5R1pRdFF4Tm1NRi1vdGJNa3I4SmRSYkRQNWlxaFppV1I1eGt2bmZxclJCcGtzTVNQSkc3TFppS1RxN01weWhoV2xQSXlMY1JvSWFlODJKTWJmbmgxMjNGXzY3eXZ6SlV2SDhwMko2EHdlYiYxLjAuNCZuaW1vVFZGAFYEMTA0NmYDMi4xcGOGAkJSlgCmALAFCxMAAAIurlOP7iMAAAABgBFJazABC4yYDKgMLDYhYmM4ZDExY2MxODNkZjQwMS1iYzhkMTFjYzE4M2RmNDAxTA==";
            result[3] = "AAMdAAEAjAAAAIwQAyw8QP9WBmxhdW5jaGYMcXVlcnlIdHRwRG5zfQAAYwgAAQYEdFJlcR0AAFYKAwAAAi6uU4/uFhB3ZWJoNSYwLjAuMSZuaW1vKQACBhBjZG4ud3VwLmh1eWEuY29tBhJjZG53cy5hcGkuaHV5YS5jb202DE5JTU8mQlImMTA0NkYAC4yYDKgMLDYATA==";

            return result;
        }

        public Dictionary<string, Command> GetChannelCommands(long channelID)
        {
            if(!commands.ContainsKey(channelID))
                commands.Add(channelID, new List<Command>());

            Dictionary<string, Command> result = new Dictionary<string, Command>();

            result.Add("uptime", new JavascriptCommand("uptime", new string[1] { "tempo" }, true, 3, "uptime", new object[] { channelID, followerBody }));

            foreach (Command cmd in commands[channelID])
            {
                result.Add(cmd.CMD, cmd);
            }

            return result;
        }

        public List<long> GetChannels()
        {
            List<long> result = new List<long>();

            foreach (long id in commands.Keys)
                result.Add(id);

            return result;
        }
    }
}