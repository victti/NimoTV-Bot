using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal static class Utils
    {
        private static Random random = new Random();

        public static string Hex2Ascii(string hex)
        {
            string result = "";

            for (int i = 0; i < hex.Length; i += 2)
            {
                result += Convert.ToChar(Convert.ToUInt32(hex.Substring(i, 2), 16));
            }

            return result;
        }

        public static string Hex2Utf8(string hex)
        {
            int NumberChars = hex.Length / 2;
            byte[] bytes = new byte[NumberChars];
            using (var sr = new StringReader(hex))
            {
                for (int i = 0; i < NumberChars; i++)
                    bytes[i] =
                      Convert.ToByte(new string(new char[2] { (char)sr.Read(), (char)sr.Read() }), 16);
            }
            return Encoding.UTF8.GetString(bytes);
        }

        public static long Hex2Number(string hex)
        {
            return Convert.ToInt64(hex, 16);
        }

        public static string Ascii2Hex(string asciiString)
        {
            StringBuilder builder = new StringBuilder();
            foreach (char c in asciiString)
            {
                builder.Append(Convert.ToInt32(c).ToString("X"));
            }
            return builder.ToString();
        }

        public static string Utf8_2Hex(string utf8String)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(utf8String);
            StringBuilder sb = new StringBuilder(bytes.Length << 1);
            foreach (byte b in bytes)
            {
                sb.AppendFormat("{0:X2}", b);
            }
            return sb.ToString();
        }

        public static string Number2Hex(long number)
        {
            string hex = number.ToString("X");

            return hex.Length % 2 == 1 ? "0" + hex : hex;
        }

        public static string Ascii2Utf8(string data)
        {
            byte[] bytes = Encoding.GetEncoding(28591).GetBytes(data);
            return Encoding.UTF8.GetString(bytes);
        }

        public static string EncodeBase64(string data)
        {
            byte[] bytes = Encoding.GetEncoding(28591).GetBytes(data);
            string toReturn = Convert.ToBase64String(bytes);
            return toReturn;
        }

        public static string DecodeBase64(string data)
        {
            byte[] bytes = Convert.FromBase64String(data);
            return Encoding.GetEncoding(28591).GetString(bytes);
        }

        public static int RandomNum(int max)
        {
            return RandomNum(0, max);
        }

        public static int RandomNum(int min, int max)
        {
            return random.Next(min, max + 1);
        }

        public static List<string> SpliceText(string text, int lineLength)
        {
            List<string> result = new List<string>();

            string[] split = text.Split(" ");
            string sfinal = "";
            foreach (string s in split)
            {
                if ((sfinal + s).Utf8Length() <= lineLength)
                {
                    sfinal += s;
                }
                else
                {
                    result.Add(sfinal);
                    sfinal = s;
                }
                sfinal += " ";
            }
            result.Add(sfinal);

            return result;
        }

        public static Dictionary<long, Dictionary<string, int>> ReadCounters()
        {
            if(!File.Exists("./counters.json"))
            {
                return new Dictionary<long, Dictionary<string, int>>();
            }

            using (StreamReader r = new StreamReader("./counters.json"))
            {
                string json = r.ReadToEnd();
                return JsonConvert.DeserializeObject<Dictionary<long, Dictionary<string, int>>>(json);
            }
        }

        public static void SaveCounters(Dictionary<long, Dictionary<string, int>> counters)
        {
            string json = JsonConvert.SerializeObject(counters);

            File.WriteAllText("./counters.json", json);
        }
    }
}
