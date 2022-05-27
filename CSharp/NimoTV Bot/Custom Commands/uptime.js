const fetch = require('node-fetch');

module.exports = (callback, channelID, body) => {

    let url = "https://follow-cf-dynamic.nimo.tv/oversea/nimo/api/v3/follow/fan/followListForWeb?languageId=1046";

    let properties = {
        keyType: '2',
        body: body
    };

    let uriencodeddata = [];

    for (let property in properties) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(properties[property]);
        uriencodeddata.push(encodedKey + "=" + encodedValue);
    }

    uriencodeddata = uriencodeddata.join("&");

    let settings = {
        method: "POST",
        mode: "no-cors",
        headers: {
            "x-requested-with": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": uriencodeddata.length
        },
        body: uriencodeddata
    };

    fetch(url, settings)
        .then((resp) => resp.json())
        .then(function (json) {
            for (var result in json.data.result.content) {
                if (json.data.result.content[result].roomID == channelID) {
                    let lastLiveOnFinishTime = new Date(json.data.result.content[result].lastLiveOnFinishTime * 1000);

                    let statusText = "";

                    if (json.data.result.content[result].onLive == false) {
                        statusText = "offline";
                    } else {
                        statusText = "ao vivo";
                    }

                    let diffInMilliSeconds = Math.abs(lastLiveOnFinishTime - Date.now()) / 1000;

                    // calculate days
                    const days = Math.floor(diffInMilliSeconds / 86400);
                    diffInMilliSeconds -= days * 86400;

                    // calculate hours
                    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
                    diffInMilliSeconds -= hours * 3600;

                    // calculate minutes
                    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
                    diffInMilliSeconds -= minutes * 60;

                    let timeDiff = '';
                    if (days > 0) {
                        timeDiff += (days === 1) ? `${days} dia ` : `${days} dias `;
                    }

                    if (hours > 0) {
                        timeDiff += hours === 1 ? `${hours} hora ` : `${hours} horas `;
                    }

                    timeDiff += (minutes === 0 || minutes === 1) ? `${minutes} minuto` : `${minutes} minutos`;

                    callback(null, "O " + json.data.result.content[result].anchorName + " está " + statusText + " há " + timeDiff);
                    break;
                }
            }

            callback(null, "");
        })
        .catch(function (error) {
            callback(error, "");
        });
}