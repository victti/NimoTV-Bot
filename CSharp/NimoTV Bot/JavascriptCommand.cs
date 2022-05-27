using Jering.Javascript.NodeJS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal class JavascriptCommand : Command
    {
        private string script;

        private object[] args;

        public JavascriptCommand(string CMD, string[] alias, bool tagUser, int cooldown, string script, object[] args)
            : base(CMD, alias, tagUser, cooldown)
        {
            this.script = File.ReadAllText("./Custom Commands/" + script + ".js");
            this.args = args;
        }

        public override async Task<string> GetResponse(object[] args)
        {
            object[] fArgs = this.args.Concat(args).ToArray();
            return await StaticNodeJSService.InvokeFromStringAsync<string>(script, args: fArgs);
        }
    }
}
