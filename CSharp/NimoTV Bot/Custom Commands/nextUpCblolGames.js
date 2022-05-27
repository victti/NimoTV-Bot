const fetch = require('node-fetch');

module.exports = (callback, leagueId, team, otherteam) => {
    let url = "https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=pt-BR&leagueId=" + leagueId;

    let settings = {
        method: "GET",
        headers: {
            "x-api-key": "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z"
        }
    };

    fetch(url, settings)
        .then((resp) => resp.json())
        .then(function (jsonObj) {
            let nextGames = [];

            let searchForTeam = otherteam == undefined ? team : otherteam;
            searchForTeam = searchForTeam.toLowerCase();
            
            for (let i = 0; i < jsonObj.data.schedule.events.length; i++) {
                let hasTeam = jsonObj.data.schedule.events[i].match != undefined && jsonObj.data.schedule.events[i].match.teams != undefined && (jsonObj.data.schedule.events[i].match.teams[0].code.toLowerCase().includes(searchForTeam) || jsonObj.data.schedule.events[i].match.teams[1].code.toLowerCase().includes(searchForTeam) || jsonObj.data.schedule.events[i].match.teams[0].name.toLowerCase().includes(searchForTeam) || jsonObj.data.schedule.events[i].match.teams[1].name.toLowerCase().includes(searchForTeam))

                if (hasTeam) {
                    nextGames.push(jsonObj.data.schedule.events[i]);
                }
            }

            let finalMessage = "";

            if (nextGames.length > 0) {
                var diffdate = new Date();
                diffdate.setHours(0);

                if (diffdate.getDay() > 0) {
                    diffdate.setDate(diffdate.getDate() - diffdate.getDay() + 7);
                }

                nextGames.sort(function (a, b) {
                    var distancea = Math.abs(diffdate - new Date(a.startTime));
                    var distanceb = Math.abs(diffdate - new Date(b.startTime));
                    return distancea - distanceb;
                });

                for (let i = 0; i < 2; i++) {
                    let gameDate = new Date(nextGames[i].startTime);
                    let weekDay = gameDate.toLocaleDateString("pt-br", { weekday: 'long' });
                    weekDay = weekDay[0].toUpperCase() + weekDay.slice(1);

                    let team0 = nextGames[i].match.teams[0].code;
                    let result0 = nextGames[i].match.teams[0].result.outcome == null ? "⏳" : nextGames[i].match.teams[0].result.outcome == "win" ? "✅" : "❌";
                    let team1 = nextGames[i].match.teams[1].code;
                    let result1 = nextGames[i].match.teams[1].result.outcome == null ? "⏳" : nextGames[i].match.teams[1].result.outcome == "win" ? "✅" : "❌";

                    finalMessage += weekDay + " (" + gameDate.getHours() + "h): " + team0 + " (" + result0 + ") x (" + result1 + ") " + team1 + " | ";
                }

                finalMessage = finalMessage.substring(0, finalMessage.length - 3);
            }

            callback(null, finalMessage);
        })
        .catch(function (error) {
            callback(error, "");
        });
}