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
            let searchForTeam = otherteam == undefined ? team : otherteam;
            searchForTeam = searchForTeam.toLowerCase();

            if (searchForTeam.length < 3)
                callback(null, "");

            let selectedTeam = "";

            let previousGames = [];
            let upcomingGames = [];

            for (let i = 0; i < jsonObj.data.schedule.events.length; i++) {
                let team0 = jsonObj.data.schedule.events[i].match.teams[0].name.toLowerCase();
                let team1 = jsonObj.data.schedule.events[i].match.teams[1].name.toLowerCase();

                if (selectedTeam == "") {
                    if (team0.includes(searchForTeam) || jsonObj.data.schedule.events[i].match.teams[0].code.toLowerCase().includes(searchForTeam)) {
                        selectedTeam = team0;
                        searchForTeam = selectedTeam;
                    } else if (team1.includes(searchForTeam) || jsonObj.data.schedule.events[i].match.teams[1].code.toLowerCase().includes(searchForTeam)) {
                        selectedTeam = team1;
                        searchForTeam = selectedTeam;
                    }
                }

                if (jsonObj.data.schedule.events[i].state == "completed") {
                    if (previousGames[team0] == undefined)
                        previousGames[team0] = [];
                    if (previousGames[team1] == undefined)
                        previousGames[team1] = [];

                    previousGames[team0].push(jsonObj.data.schedule.events[i]);
                    previousGames[team1].push(jsonObj.data.schedule.events[i]);
                } else if (jsonObj.data.schedule.events[i].state == "unstarted") {
                    if (upcomingGames[team0] == undefined)
                        upcomingGames[team0] = [];
                    if (upcomingGames[team1] == undefined)
                        upcomingGames[team1] = [];

                    upcomingGames[team0].push(jsonObj.data.schedule.events[i]);
                    upcomingGames[team1].push(jsonObj.data.schedule.events[i]);
                }
            }

            let gamesToShow = [];

            let diffdate = new Date();
            diffdate.setHours(0);

            if (previousGames[searchForTeam] != undefined) {
                previousGames[searchForTeam].reverse();
                switch (diffdate.getDay()) {
                    case 0:
                        let diffTime = new Date(upcomingGames[searchForTeam][0].startTime) - new Date();
                        if (Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 2) {
                            gamesToShow.push(previousGames[searchForTeam][1]);
                            gamesToShow.push(previousGames[searchForTeam][0]);
                        } else {
                            gamesToShow.push(previousGames[searchForTeam][0]);
                            gamesToShow.push(upcomingGames[searchForTeam][0]);
                        }
                        break;
                    case 6:
                        let diffTime2 = new Date(upcomingGames[searchForTeam][1].startTime) - new Date();
                        if (Math.ceil(diffTime2 / (1000 * 60 * 60 * 24)) > 3) {
                            gamesToShow.push(previousGames[searchForTeam][0]);
                            gamesToShow.push(upcomingGames[searchForTeam][0]);
                        } else {
                            if (upcomingGames[searchForTeam].length > 0) {
                                gamesToShow.push(upcomingGames[searchForTeam][0]);

                                if (upcomingGames[searchForTeam].length > 1)
                                    gamesToShow.push(upcomingGames[searchForTeam][1]);
                            }
                        }
                        break;
                    default:
                        if (upcomingGames[searchForTeam].length > 0) {
                            gamesToShow.push(upcomingGames[searchForTeam][0]);

                            if (upcomingGames[searchForTeam].length > 1)
                                gamesToShow.push(upcomingGames[searchForTeam][1]);
                        }
                        break;
                }

                let finalMessage = "";

                for (let i = 0; i < gamesToShow.length; i++) {
                    let gameDate = new Date(gamesToShow[i].startTime);
                    let weekDay = gameDate.toLocaleDateString("pt-br", { weekday: 'long' });
                    weekDay = weekDay[0].toUpperCase() + weekDay.slice(1);

                    let team0 = gamesToShow[i].match.teams[0].code;
                    let result0 = gamesToShow[i].match.teams[0].result.outcome == null ? "⏳" : gamesToShow[i].match.teams[0].result.outcome == "win" ? "✅" : "❌";
                    let team1 = gamesToShow[i].match.teams[1].code;
                    let result1 = gamesToShow[i].match.teams[1].result.outcome == null ? "⏳" : gamesToShow[i].match.teams[1].result.outcome == "win" ? "✅" : "❌";

                    finalMessage += weekDay + " (" + gameDate.getHours() + "h): " + team0 + " (" + result0 + ") x (" + result1 + ") " + team1 + " | ";
                }

                finalMessage = finalMessage.substring(0, finalMessage.length - 3);

                callback(null, finalMessage);
            }

            callback(null, "");
        })
        .catch(function (error) {
            callback(error, "");
        });
}