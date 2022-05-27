using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal class RegularCommand : Command
    {
        private string response;

        public RegularCommand(string CMD, string[] alias, bool tagUser, int cooldown, string response)
            :base(CMD, alias, tagUser, cooldown)
        {
            this.response = response;
        }

        public override async Task<string> GetResponse(object[] args)
        {
            return response;
        }
    }
}
