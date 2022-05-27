using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal class VicBot
    {
        private Configuration configuration;

        private APIs.Http httpAPI;

        private Dictionary<long, NimoChannel> channels;

        private Dictionary<long, Dictionary<string, int>> commandCounters;

        private object commandCountersLocker;

        public VicBot(Configuration configuration)
        {
            this.configuration = configuration;

            if(true)
                httpAPI = new APIs.Http(this);

            channels = new Dictionary<long, NimoChannel>();
            commandCounters = Utils.ReadCounters();
            commandCountersLocker = new object();
        }

        public async Task InitializeAsync()
        {
            foreach(long id in configuration.GetChannels())
            {
                channels.Add(id, new NimoChannel(this, id, configuration));
                channels[id].Start();
            }

            Thread pingThread = new Thread(PingLoop);
            pingThread.Start();

            await Task.Delay(-1);
        }

        private void PingLoop()
        {
            while (true)
            {
                foreach(NimoChannel channel in channels.Values)
                {
                    channel.Ping();
                }

                Thread.Sleep(1000);
            }
        }

        public int GetNextCommandCounter(long channelId, string commandName)
        {
            lock (commandCountersLocker)
            {
                if (!commandCounters.ContainsKey(channelId))
                    commandCounters.Add(channelId, new Dictionary<string, int>());

                if (!commandCounters[channelId].ContainsKey(commandName))
                    commandCounters[channelId].Add(commandName, 0);

                commandCounters[channelId][commandName] += 1;
                Utils.SaveCounters(commandCounters);

                return commandCounters[channelId][commandName];
            }
        }

        public NimoChannel GetChannel(long channelId)
        {
            if(channels.ContainsKey(channelId))
                return channels[channelId];

            return null;
        }
    }
}