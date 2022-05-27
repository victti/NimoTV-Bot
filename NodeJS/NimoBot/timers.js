const { getBotAPI } = require("./variables");

var Timer = function(chnTimers)
{
    this.chnMessages = [];
    for(let i = 0; i < chnTimers.length; i++)
    {
        let chnId = chnTimers[i].chnId;

        this.chnMessages.push(chnId);
        this.chnMessages[chnId] = 0;

        for(let j = 0; j < chnTimers[i].timers.length; j++)
        {
            setInterval(() => {
                if(this.chnMessages[chnId] >= chnTimers[i].timers[j].chatLines)
                {
                    this.chnMessages[chnId] = 0;

                    getBotAPI().sendMessage(chnId, chnTimers[i].timers[j].message);
                }
            }, chnTimers[i].timers[j].interval);
        }
    }
}

Timer.prototype.OnMessage = function(chnId)
{
    this.chnMessages[chnId] += 1;
}

module.exports = Timer;