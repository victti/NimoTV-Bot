using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal class NimoMessage
    {
        public readonly long channelID;

        public readonly long userID;

        public readonly string username;

        private readonly bool isADM;

        private readonly bool isFan;

        private readonly bool isSub;

        public readonly string text;

        public NimoMessage(long channelID, long userID, string username, bool isADM, bool isFan, bool isSub, string message)
        {
            this.channelID = channelID;
            this.userID = userID;
            this.username = username;
            this.isADM = isADM;
            this.isFan = isFan;
            this.isSub = isSub;
            this.text = message;
        }

        public bool IsFromADM()
        {
            return isADM;
        }

        public bool IsFromFan()
        {
            return isFan;
        }

        public bool IsFromSub()
        {
            return isSub;
        }
    }
}
