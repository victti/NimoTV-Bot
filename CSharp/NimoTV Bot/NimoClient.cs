using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using WebSocketSharp;

namespace NimoTV_Bot
{
    internal abstract class NimoClient
    {
        public delegate void MessageReceived(NimoMessage message);

        public delegate void Connect();

        public delegate void Disconnect();

        protected long channelId;

        protected string cachedHex_lchannelId;

        protected string cachedHex_schannelId;

        protected Configuration configuration;

        protected string[] helloTokens;

        protected string[] infoTokens;

        protected WebSocket? wbSocket;

        private bool located;

        private DateTime lastSentMessageTime;

        public MessageReceived? OnMessageReceived;

        public NimoClient(long channelId, Configuration configuration)
        {
            this.channelId = channelId;
            this.configuration = configuration;

            cachedHex_lchannelId = Utils.Number2Hex(channelId);
            cachedHex_schannelId = Utils.Ascii2Hex(channelId + "");

            helloTokens = configuration.GenerateHello();
            infoTokens = configuration.GenerateInfo(cachedHex_schannelId, cachedHex_lchannelId);
        }

        public void Start()
        {
            if(wbSocket != null && wbSocket.IsAlive)
            {
                wbSocket.Close();
                return;
            }

            located = false;

            wbSocket = new WebSocket(url: "wss://wsapi.master.live/?APPSRC=NIMO&BR&1046");
            wbSocket.OnOpen += OnWSOpen;
            wbSocket.OnClose += OnWSClose;
            wbSocket.OnMessage += OnWSMessage;

            wbSocket.Connect();
        }

        private void OnWSClose(object? sender, CloseEventArgs e)
        {
            Start();
        }

        private void DispatchMessage(NimoMessage message)
        {
            if(OnMessageReceived != null)
            {
                OnMessageReceived(message);
            }
        }

        private void OnWSOpen(object? sender, EventArgs e)
        {
            LoopPackage(helloTokens);

            Console.WriteLine("Bot is now connected on " + channelId);
        }

        private void OnWSMessage(object? sender, MessageEventArgs e)
        {
            byte[] data = e.RawData;

            string packageData = Read(data, 0);

            // Requested info about the user location
            if(packageData == "0004 1D00 006D 0000 006D 1003 2C3C 40FF")
            {
                if (located)
                    return;

                LoopPackage(infoTokens);

                located = true;
                return;
            }

            // Read packets
            // Is a regular packet with data?
            if(Regex.Match(packageData, "0016 1D00 01([0-9A-F]{2}) [0-9A-F]{2}06 116E 696D 6F3A 315F").Success)
            {
                // Check for messages
                string fullData = "";

                string msg_buffer;
                int buffer_i = 0;
                do
                {
                    msg_buffer = Read(data, buffer_i).Replace(" ", "");
                    buffer_i++;
                    fullData += msg_buffer;

                    if (fullData.Contains("000B2C36004C5C6600"))
                    {
                        break;
                    }
                } while (buffer_i < 100);

                int lineType = 0;
                string[] newsplitMessages = Regex.Split(fullData, "(0A01[0-9A-F]{2}([0-9A-F]{4})0001)");
                
                //Console.WriteLine(fullData);
                for (int i = 0; i < newsplitMessages.Length; i++)
                {
                    if (lineType > 3)
                        lineType = 1;

                    //Console.WriteLine(i + ": " + newsplitMessages[i]);

                    try
                    {
                        switch (lineType)
                        {
                            case 2:
                                string messageBody = newsplitMessages[i + 1];

                                string usrStr;
                                string usrLength;
                                string usrname;
                                switch (newsplitMessages[i])
                                {
                                    case "781D": // user messages
                                        long userID = Utils.Hex2Number(messageBody.Substring(12).Substring(0, 12));

                                        usrStr = messageBody.Substring(26);
                                        usrLength = "" + usrStr[0] + usrStr[1];
                                        usrname = Utils.Hex2Utf8(usrStr.Substring(2, Convert.ToInt32(usrLength, 16) * 2));

                                        int messageIndex = messageBody.IndexOf(cachedHex_lchannelId + "26") + 12;

                                        string searchForAFSStr = messageBody.Substring(26, messageIndex);

                                        string msgStr = messageBody.Substring(messageIndex);
                                        string msg = msgStr.Substring(2, Convert.ToInt32(msgStr.Substring(0, 2), 16) * 2);
                                        msg = Utils.Hex2Utf8(msg);

                                        bool isADM = searchForAFSStr.Contains("3C4001") || searchForAFSStr.Contains("20013001");
                                        
                                        // the 2 values after are the tier/level
                                        bool isFan = Regex.IsMatch(searchForAFSStr, "50[0-9A-F]{2}6(C|0)");
                                        bool isSub = Regex.IsMatch(searchForAFSStr, "60[0-9A-F]{2}7(C|0)");

                                        Console.WriteLine((isADM ? "[ADM] " : "") + (isSub ? "[SUB] " : "") + (isFan ? "[FAN] " : "") + usrname + ": " + msg);

                                        DispatchMessage(new NimoMessage(channelId, userID, usrname, isADM, isFan, isSub, msg));
                                        break;
                                    case "891D": // nimo bot messages
                                        usrStr = messageBody.Substring(26);
                                        usrLength = "" + usrStr[0] + usrStr[1];
                                        usrname = Utils.Hex2Utf8(usrStr.Substring(2, Convert.ToInt32(usrLength, 16) * 2));

                                        int messageIndex2 = messageBody.IndexOf("8C9CAC0B16") + 10;

                                        string msgStr2 = messageBody.Substring(messageIndex2);
                                        string msg2 = msgStr2.Substring(2, Convert.ToInt32(msgStr2.Substring(0, 2), 16) * 2);
                                        msg2 = Utils.Hex2Utf8(msg2);

                                        Console.WriteLine("[ADM] " + usrname + ": " + msg2);
                                        break;
                                }
                                break;
                        }
                    } catch(Exception ex)
                    {
                        Console.WriteLine(ex);
                    }

                    lineType++;
                }
            }
        }

        private void LoopPackage(string[] package)
        {
            for (int i = 0; i < package.Length; i++)
            {
                Send(Write(package[i], true));
            }
        }

        public void Ping()
        {
            if (DateTime.UtcNow.Subtract(lastSentMessageTime).TotalSeconds >= 25)
            {
                Send(Write(infoTokens[3], true));
            }
        }

        public async Task SendMessage(string messageToSend)
        {
            List<string> splitMessages = Utils.SpliceText(messageToSend, 93);
            int msgIndex = 1;

            foreach (string splitMessage in splitMessages)
            {
                string message = "";
                bool flag = splitMessages.Count > 1;
                if (flag)
                    message = "(" + msgIndex++ + "/" + splitMessages.Count + ") ";
                message += splitMessage.Trim();

                int msgLength = message.Utf8Length();

                // 521 (base) - 2 (BR) - 4 (1046) - 6 (victti) - 1 (message) = 508
                string buffer1 = Utils.Number2Hex(508 + configuration.country.Length + configuration.lang.Length + configuration.username.Length + msgLength);

                string buffer2 = Utils.Number2Hex(467 + configuration.country.Length + configuration.lang.Length + configuration.username.Length + msgLength);

                string buffer3 = Utils.Number2Hex(453 + configuration.country.Length + configuration.lang.Length + configuration.username.Length + msgLength);

                // encode message
                string encodedMessage = Utils.Hex2Ascii("00031d0001" + buffer1 + "0000" + buffer1 + "10032c3c400056066e696d6f7569660b73656e644d6573736167657d0001" + buffer2 + "0800010604745265711d0001" + buffer3 + "0a0a030000" + configuration.cachedHex_lUid + "1609636f6d706f6e656e742700000158" + configuration.cachedHex_sToken + "361077656226312e302e34266e696d6f5456460056" + Utils.Number2Hex(configuration.lang.Length) + "" + configuration.cachedHex_lang + "6603322e31706386" + Utils.Number2Hex(configuration.country.Length) + "" + configuration.cachedHex_country + "9600a600b0050b13000000" + cachedHex_lchannelId + "26" + Utils.Number2Hex(msgLength) + "" + Utils.Utf8_2Hex(message) + "3c4a00ff10042c0b5a00ff10042c30014c50ff0b690c7c86" + Utils.Number2Hex(configuration.username.Length) + "" + Utils.Ascii2Hex(configuration.username) + "9cacbcc80cd0020b8c980ca80c2c3621383238353661366332373265643531362d383238353661366332373265643531364c");

                Send(Write(encodedMessage));

                if (flag)
                    await Task.Delay(1000);
            }
        }

        public async Task SendMessage(string messageToSend, long userID, string username)
        {
            List<string> splitMessages = Utils.SpliceText(messageToSend, 93);
            int msgIndex = 1;

            foreach (string splitMessage in splitMessages)
            {
                string message = "";
                bool flag = splitMessages.Count > 1;
                if (flag)
                    message = "(" + msgIndex++ + "/" + splitMessages.Count + ") ";
                message += splitMessage.Trim();

                int msgLength = message.Utf8Length();
                int tagBufferLength = username.Length + 13 + 1;

                // 521 (base) - 2 (BR) - 4 (1046) - 6 (victti) - 1 (message) = 508
                string buffer1 = Utils.Number2Hex(508 + configuration.country.Length + configuration.lang.Length + configuration.username.Length + msgLength + tagBufferLength);

                string buffer2 = Utils.Number2Hex(467 + configuration.country.Length + configuration.lang.Length + configuration.username.Length + msgLength + tagBufferLength);

                string buffer3 = Utils.Number2Hex(453 + configuration.country.Length + configuration.lang.Length + configuration.username.Length + msgLength + tagBufferLength);

                // encode message
                string encodedMessage = Utils.Hex2Ascii("00031d0001" + buffer1 + "0000" + buffer1 + "10032c3c400056066e696d6f7569660b73656e644d6573736167657d0001" + buffer2 + "0800010604745265711d0001" + buffer3 + "0a0a030000" + configuration.cachedHex_lUid + "1609636f6d706f6e656e742700000158" + configuration.cachedHex_sToken + "361077656226312e302e34266e696d6f5456460056" + Utils.Number2Hex(configuration.lang.Length) + "" + configuration.cachedHex_lang + "6603322e31706386" + Utils.Number2Hex(configuration.country.Length) + "" + configuration.cachedHex_country + "9600a600b0050b13000000" + cachedHex_lchannelId + "26" + Utils.Number2Hex(msgLength) + "" + Utils.Utf8_2Hex(message) + "3c4a00ff10042c0b5a00ff10042c30014c50ff0b69" + "00010a030000" + Utils.Number2Hex(userID) + "16" + Utils.Number2Hex(username.Length) + "" + Utils.Ascii2Hex(username) + "0b7c86" + Utils.Number2Hex(configuration.username.Length) + "" + configuration.cachedHex_username + "9cacbcc80cd0020b8c980ca80c2c3621383238353661366332373265643531362d383238353661366332373265643531364c");

                Send(Write(encodedMessage));

                if (flag)
                    await Task.Delay(1000);
            }
        }

        protected void Send(byte[] data)
        {
            if (wbSocket == null || !wbSocket.IsAlive)
                return;

            lastSentMessageTime = DateTime.UtcNow;

            wbSocket.Send(data);
        }

        private byte[] Write(string data, bool base64 = false)
        {
            string dataToSend = base64 ? Utils.DecodeBase64(data) : data;
            byte[] result = new byte[dataToSend.Length];

            for (int i = 0, strLen = dataToSend.Length; i < strLen; i++)
            {
                result[i] = Convert.ToByte(dataToSend[i]);
            }

            return result;
        }

        private string Read(byte[] data, int block)
        {
            int maxByte = 16;
            string result = "";
            int i_pos = block > 0 ? (block * maxByte) : 0;

            int ii = 0;
            for (int i = i_pos > 0 ? i_pos : 0; ii < maxByte; i++)
            {
                ii++;
                if (i + 1 >= data.Length)
                    break;

                string hex = Utils.Number2Hex(data[i]);
                result += hex.Length == 1 ? 0x0 + hex : hex;
            }

            return Regex.Replace(result, ".{4}", "$0 ").Trim();
        }
    }
}
