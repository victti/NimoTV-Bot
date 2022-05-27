using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot.Modules
{
    internal class VoteModule
    {
        private bool voting;

        private List<string> users;

        private Dictionary<string, int> votes;

        private List<string> options;

        private object voteLocker;

        public VoteModule()
        {
            users = new List<string>();
            votes = new Dictionary<string, int>();
            options = new List<string>();
            voteLocker = new object();
        }

        public void Start(string mode = "all")
        {
            lock (voteLocker)
            {
                switch (mode.ToLowerInvariant())
                {
                    case "all":
                        options = new List<string>();
                        break;
                    default:

                        break;
                }

                voting = true;
            }
        }

        public void Stop()
        {
            lock (voteLocker)
            {
                voting = false;
            }
        }

        public string Draw(out int totalVotes)
        {
            lock (voteLocker)
            {
                totalVotes = 0;
                List<string> winners = new List<string>();
                string winnersMessage = "";

                if (votes.Count > 0)
                {
                    string maxVoter = votes.Aggregate((l, r) => l.Value > r.Value ? l : r).Key;
                    totalVotes = votes[maxVoter];
                    foreach (KeyValuePair<string, int> pair in votes)
                    {
                        if (pair.Value == totalVotes)
                            winners.Add(pair.Key);
                    }

                    foreach (string winner in winners)
                    {
                        winnersMessage += winner + ", ";
                    }
                    winnersMessage = winnersMessage.Trim();
                    winnersMessage = winnersMessage.Substring(0, winnersMessage.Length - 1);
                }

                return winnersMessage;
            }
        }

        public string DrawJson()
        {
            lock(voteLocker)
            {
                return JsonConvert.SerializeObject(votes);
            }
        }

        public void Reset()
        {
            lock (voteLocker)
            {
                users.Clear();
                votes.Clear();
            }
        }

        public void Vote(string username, string vote)
        {
            lock (voteLocker)
            {
                if (!voting || string.IsNullOrWhiteSpace(vote))
                    return;

                if (!users.Contains(username) && (options.Count == 0 || (options.Count > 0 && options.Contains(vote))))
                {
                    users.Add(username);

                    if (!votes.ContainsKey(vote))
                    {
                        votes.Add(vote, 1);
                    }
                    else
                    {
                        votes[vote]++;
                    }
                }
            }
        }
    }
}
