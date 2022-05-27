const NimoChannel = require('./NimoChannel');
const fetch = require('node-fetch');

var NimoAPI = function(username, lUid, sGuid, sUA, sAppSrc, sCookie, sToken, followerBody, channels, parseCommand)
{
    _nimoAPI = this;
    _nimoAPI.followerBody = followerBody;
    _nimoAPI.chns = [];

    for(let i = 0; i < channels.length; i++){
        _nimoAPI.chns[channels[i]] = new NimoChannel(username, lUid, sGuid, sUA, sAppSrc, sCookie, sToken, channels[i], parseCommand);
    }
}

NimoAPI.prototype.start = function()
{
    for(let chn in _nimoAPI.chns)
    {
        _nimoAPI.chns[chn].start();
    }
}

/**
* Send a message to the chat.
* @param {string} message 
*/
NimoAPI.prototype.sendMessage = function(channelID, message)
{
    _nimoAPI.chns[channelID].sendMessage(message);
}

/**
* Send a message to the chat tagging a specific user.
* @param {string} message 
*/
NimoAPI.prototype.sendMessageTag = function(channelID, message, userID, username)
{
    _nimoAPI.chns[channelID].sendMessageTag(message, userID, username);
}

//#region follow data
NimoAPI.prototype.getFollowList = async function()
{
    let url = "http://localhost:8080/https://follow-cf-dynamic.nimo.tv/oversea/nimo/api/v3/follow/fan/followListForWeb?languageId=1046";

    let uriencodeddata = buildFollowFormBody();

    let settings = {
        method: "POST",
        headers: { 
            "x-requested-with": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": uriencodeddata.length
        },
        body: uriencodeddata
    };
    
    let response = await fetch(url, settings);

    return await response.json();
}

function buildFollowFormBody()
{
    let properties = {
        keyType: '2',
        body: _nimoAPI.followerBody
    };

    let formBody = [];

    for (let property in properties) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(properties[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }

    formBody = formBody.join("&");

    return formBody;
}
//#endregion

module.exports = NimoAPI;