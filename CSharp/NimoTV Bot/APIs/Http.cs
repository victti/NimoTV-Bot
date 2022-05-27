using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot.APIs
{
    internal class Http
    {
        private const int port = 2328;

        private VicBot bot;

        private HttpListener listener;

        public Http(VicBot bot)
        {
            if (!HttpListener.IsSupported)
            {
                Console.WriteLine("Windows XP SP2 or Server 2003 is required to use the HttpListener class.");
                return;
            }

            this.bot = bot;

            // URI prefixes are required,
            var prefixes = new List<string>() { "http://*:" + port + "/" };

            // Create a listener.
            listener = new HttpListener();
            // Add the prefixes.
            foreach (string s in prefixes)
            {
                listener.Prefixes.Add(s);
            }
            listener.Start();

            Thread listenThread = new Thread(ConnectionThread);
            listenThread.Start();
        }

        private void ConnectionThread()
        {
            Console.WriteLine("HTTP API listening on port " + port +  "...");
            while (listener.IsListening)
            {
                // Note: The GetContext method blocks while waiting for a request.
                HttpListenerContext context = listener.GetContext();

                HttpListenerRequest request = context.Request;

                string documentContents;
                using (Stream receiveStream = request.InputStream)
                {
                    using (StreamReader readStream = new StreamReader(receiveStream, Encoding.UTF8))
                    {
                        documentContents = readStream.ReadToEnd();
                    }
                }

                GetUrlData(request.Url.ToString(), out string urlDir, out Dictionary<string, string> urlParams);

                // Obtain a response object.
                HttpListenerResponse response = context.Response;
                // Construct a response.
                string responseString;
                switch(urlDir)
                {
                    case "api/vote":
                        if(!urlParams.ContainsKey("id"))
                        {
                            responseString = "Param \"id\" not found";
                            break;
                        }
                        if(!long.TryParse(urlParams["id"], out long chnId))
                        {
                            responseString = "Param \"id\" is not a number. Make sure it is a channel id number";
                            break;
                        }

                        NimoChannel nimoChannel = bot.GetChannel(chnId);
                        if(nimoChannel == null)
                        {
                            responseString = "ID for channel " + urlParams["id"] + " not registered";
                            break;
                        }

                        responseString = nimoChannel.VoteModule.DrawJson();
                        break;
                    case "api/info":
                        responseString = "API online."
                        break;
                    default:
                        responseString = "API not found";
                        break;
                }

                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "POST, GET");

                byte[] buffer = Encoding.UTF8.GetBytes(responseString);
                // Get a response stream and write the response to it.
                response.ContentLength64 = buffer.Length;
                Stream output = response.OutputStream;
                output.Write(buffer, 0, buffer.Length);
                // You must close the output stream.
                output.Close();
            }
            listener.Stop();
        }

        private void GetUrlData(string url, out string urlDir, out Dictionary<string, string> urlParams)
        {
            string[] baseUrlSplit = url.Split(":" + port + "/");
            string[] paramsSplit = Array.Empty<string>();

            urlDir = baseUrlSplit[0];
            if (baseUrlSplit.Length > 1)
            {
                string[] urlSplit2 = baseUrlSplit[1].Split("?", 2);

                urlDir = urlSplit2[0];
                if (urlSplit2.Length > 1)
                {
                    paramsSplit = urlSplit2[1].Split("&");
                }
            }

            urlDir = urlDir.ToLowerInvariant();
            urlParams = new Dictionary<string, string>();
            foreach (string param in paramsSplit)
            {
                string[] paramSplit = param.Split("=", 2);

                if (paramSplit.Length > 1)
                {
                    urlParams.Add(paramSplit[0], paramSplit[1]);
                }
            }
        }
    }
}