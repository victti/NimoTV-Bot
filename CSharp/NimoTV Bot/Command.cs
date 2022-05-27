using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal abstract class Command
    {
        public readonly string CMD;

        private readonly string[] alias;

        public readonly bool tagUser;

        public readonly int cooldown;

        public Command(string CMD, string[] alias, bool tagUser, int cooldown)
        {
            this.CMD = CMD;
            this.alias = alias;
            this.tagUser = tagUser;
            this.cooldown = cooldown;
        }

        public abstract Task<string> GetResponse(object[] args);

        public bool IsAlias(string cmd)
        {
            return alias.Contains(cmd);
        }
    }
}
