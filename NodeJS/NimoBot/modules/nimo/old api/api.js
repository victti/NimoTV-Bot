const WebSocket = require('ws'); 
const fetch = require('node-fetch');
const {encodeBase64, decodeBase64, a2hex, hex2a, n2hex, encode_utf8, decode_utf8, hex2n} = require("./functions");

var NimoAPI = function(username, lUid, sGuid, sUA, sAppSrc, sCookie, sToken, channelID, followerBody, notifyDelegate)
{
    _nimoAPI = this;

    _nimoAPI.wbSocket = null;
    _nimoAPI.intervalSendMsg = null;

    _nimoAPI.username = username;
    _nimoAPI.uid = lUid;
    _nimoAPI.token = sToken;
    let _lUid = n2hex(lUid);
    let _sGuid_length = n2hex(sGuid.length);
    let _sGuid = a2hex(sGuid);
    let _sUA = a2hex(sUA);
    let _sAppSrc = a2hex(sAppSrc);
    let _sCookie = a2hex(sCookie);
    let _sToken = a2hex(sToken);
    _nimoAPI.country = sAppSrc.split("&")[1];
    _nimoAPI.lang = sAppSrc.split("&")[2];
    let bufferLength = n2hex((1 + 8) + (sUA.length + 1) + (sAppSrc.length + 1) + (sCookie.length + 4) + (sGuid.length + 1) + (1 + 4) + 1);

    let _channelID = a2hex(channelID + "");

    _nimoAPI.packages = {
        hello: [
            encodeBase64(hex2a("00031d0001008b0000008b10032c3c40ff56066c61756e6368660877734c61756e63687d0000660800010604745265711d0000590a030000" + _lUid + "16" + _sGuid_length + "" + _sGuid + "2610776562683526302e302e31266e696d6f360c4e494d4f26425226313034364a060016002600360046000b0b8c980ca80c2c36004c")),
            encodeBase64(hex2a("000a1d0001" + bufferLength + "030000" + _lUid + "16" + n2hex(sUA.length) + "" + _sUA + "270000" + n2hex(sCookie.length) + "" + _sCookie + "36" + _sGuid_length + "" + _sGuid + "400156" + n2hex(sAppSrc.length) + "" + _sAppSrc + "2c36004c"))
        ],
        info: [
            encodeBase64(hex2a("00101d0001010f09000f06086e696d6f3a616c6c06116e696d6f3a315f" + _channelID + "06166e696d6f3a31335f" + _channelID + "5f77656206186e696d6f3a315f" + _channelID + "5f42525f77656206096e696d6f3a325f4252060a6e696d6f3a335f776562060b6e696d6f3a345f31303436060f6e696d6f3a375f313034365f776562060e6e696d6f3a355f42525f3130343606126e696d6f3a365f42525f313034365f776562060b6e696d6f3a385f31303436060e6e696d6f3a395f31305f31303436060a6e696d6f3a31305f313006176e696d6f3a31345f" + _channelID + "5f31303436061e6e696d6f3a31355f" + _channelID + "5f42525f313034365f77656216002c36004c")),
            encodeBase64(hex2a("00031d000101f5000001f510032c3c400656066e696d6f7569660b4f6e557365724576656e747d000101cc0800010604745265711d000101be0a0a030000" + _lUid + "1609636f6d706f6e656e742700000158" + _sToken + "361077656226312e302e34266e696d6f5456460056" + n2hex(_nimoAPI.lang.length) + "" + a2hex(_nimoAPI.lang) + "6603322e31706386" + n2hex(_nimoAPI.country.length) + "" + a2hex(_nimoAPI.country) + "9600a600b0050b1001230000022eae538fee33000000" + n2hex(channelID) + "4001560669676e6f72650b8c980ca80c2c3621366532633566643563376461383766312d366532633566643563376461383766314c")),
            `AAMdAAECBgAAAgYQAyw8QBxWBm5pbW91aWYPT25Vc2VySGVhcnRCZWF0fQABAdkIAAEGBHRSZXEdAAEBywoKAwAAAi6uU4/uFiAwYTQ3Njk0ZTY0Yzc5MTYwMWQxMjY2OGI2NzhiN2IzMicAAAFYQVFBZEtUaV8yLWpxcVNDUnU0S2J6RVhnT29EaG11QkVpVXdYazVuVkd5bHRxdHNzRmVsSWxRN2l2LWRROFhySnpqWnZ5NXQwODRBc0YtTERKOUVIekNqQ3prX3FmdTRPbW1wVHhiaUNzbkZ0bWY3SjVnU2tiWlFpLUVOc09aUVZiTkc5Mk8wYzAtYWhwbEtvUWxRekdGR2VXNWVxU3pvcGdzU0xuZVliQ3VfNU5kWTFvTG1zci1BZHI5aE5WYmEydF9fSmJpM1dCZmlZUXp2RVNVM0pDSVZBMHNmazFwUVVUUVcyUGk0TU9BaDU4anFXQWN5R1pRdFF4Tm1NRi1vdGJNa3I4SmRSYkRQNWlxaFppV1I1eGt2bmZxclJCcGtzTVNQSkc3TFppS1RxN01weWhoV2xQSXlMY1JvSWFlODJKTWJmbmgxMjNGXzY3eXZ6SlV2SDhwMko2EHdlYiYxLjAuNCZuaW1vVFZGAFYEMTA0NmYDMi4xcGOGAkJSlgCmALAFCxMAAAIurlOP7iMAAAABgBFJazABC4yYDKgMLDYhYmM4ZDExY2MxODNkZjQwMS1iYzhkMTFjYzE4M2RmNDAxTA==`,
            `AAMdAAEAjAAAAIwQAyw8QP9WBmxhdW5jaGYMcXVlcnlIdHRwRG5zfQAAYwgAAQYEdFJlcR0AAFYKAwAAAi6uU4/uFhB3ZWJoNSYwLjAuMSZuaW1vKQACBhBjZG4ud3VwLmh1eWEuY29tBhJjZG53cy5hcGkuaHV5YS5jb202DE5JTU8mQlImMTA0NkYAC4yYDKgMLDYATA==`,
        ]
    }

    _nimoAPI.type_package = {
        newMsg: "781d",
        newFollow: "009c",
        like: "7a1d",
        onLive: /[a-f0-9]{2}1d/,
        onLive2: "d91d",
        trevo: "281d"
    };

    _nimoAPI.channelID = channelID;
    _nimoAPI.followerBody = followerBody;

    _nimoAPI.notifyDelegate = notifyDelegate;
}

NimoAPI.prototype.start = function()
{
    if(_nimoAPI.wbSocket != null)
    {
        _nimoAPI.stop();
    }

    _nimoAPI.wbSocket = new WebSocket('wss://wsapi.master.live/?APPSRC=NIMO&BR&1046');
    _nimoAPI.wbSocket.binaryType = 'arraybuffer';
    _nimoAPI.pack_receiv = 0;

    // Events
    _nimoAPI.wbSocket.onopen = _nimoAPI.onOpenWB;
    _nimoAPI.wbSocket.onclose = _nimoAPI.onCloseWB;
    _nimoAPI.wbSocket.onerror = _nimoAPI.onErrorWB;
    _nimoAPI.wbSocket.onmessage = _nimoAPI.onMessageWB;
}

/**
* Send a message to the chat.
* @param {string} message 
*/
NimoAPI.prototype.sendMessage = function(message)
{
    _nimoAPI.wbSocket.send(_nimoAPI.sendData(_nimoAPI.encodeMessage(message), false));
}

/**
* Send a message to the chat tagging a specific user.
* @param {string} message 
*/
NimoAPI.prototype.sendMessageTag = function(message, userID, username)
{
    _nimoAPI.wbSocket.send(_nimoAPI.sendData(_nimoAPI.encodeMessageTag(message, userID, username), false));
}

/**
* Loops through all values from a package and sends to the websocket.
* @param {Array} packageData
*/
NimoAPI.prototype.loopPackage = function(packageData)
{
    for(let i = 0; i < packageData.length; i++)
    {
        _nimoAPI.wbSocket.send(_nimoAPI.sendData(packageData[i], true));
    }
}

/**
* Sends a ping from the info packages to the websocket.
*/
NimoAPI.prototype.ping = function()
{
    _nimoAPI.wbSocket.send(_nimoAPI.sendData(_nimoAPI.packages.info[3], true));
}

/**
* Send data to the websocket.
* @param {string} data
* @param {boolean} base64
*/
NimoAPI.prototype.sendData = function(data, base64 = false)
{
    const buf = new ArrayBuffer(data.length);
    const bufView = new Uint8Array(buf);

    if(base64)
    {
        data = decodeBase64(data);
    }

    for (let i = 0, strLen = data.length; i < strLen; i++)
    {
        bufView[i] = data[i].charCodeAt();
    }

    return bufView;
}

NimoAPI.prototype.sendMsgInterval = function()
{
    if(_nimoAPI.pack_receiv == 2)
    {
        _nimoAPI.loopPackage(_nimoAPI.packages.info);
        _nimoAPI.pack_receiv = 0;
        clearInterval(_nimoAPI.intervalSendMsg);

        // Ping
        setInterval(_nimoAPI.ping, 30000);
    }
}

/**
* Reads a package received from the websocket and returns the HEX value.
* @param {DataView} packageData
* @param {number} block
* @returns {string}
*/
NimoAPI.prototype.readPackage = function(packageData, block)
{
    let maxByte = 16;
    let package_tmp = '';
    let i_pos = block > 0 ? (block * maxByte) : 0;
    
    for(let i=i_pos > 0 ? i_pos : 0, ii=0; ii<maxByte; i++)
    {
        ii++;
        if(i+1 >= packageData.byteLength)
        {
            break;
        }

        let hex = packageData.getUint8(i).toString(16);
        package_tmp += hex.length == 1 ? 0x0 + hex : hex;
    }

    return package_tmp.replace(/([0-9a-f]{4})/gi, '$1 ').trim();
}

/**
* Encodes a string to be sent by the websocket. 00 010a 0300 00
* @param {string} message
* @returns {string}
*/
NimoAPI.prototype.encodeMessage = function(message)
{
    // 521 (base) - 2 (BR) - 4 (1046) - 6 (victti) - 1 (message) = 508
    let bufferLength = n2hex(508 + _nimoAPI.country.length + _nimoAPI.lang.length + _nimoAPI.username.length + message.length);

    let bufferLength2 = n2hex(467 + _nimoAPI.country.length + _nimoAPI.lang.length + _nimoAPI.username.length + message.length);

    let bufferLength3 = n2hex(453 + _nimoAPI.country.length + _nimoAPI.lang.length + _nimoAPI.username.length + message.length);

    return hex2a('00031d0001' + bufferLength + '0000' + bufferLength + '10032c3c400056066e696d6f7569660b73656e644d6573736167657d0001' + bufferLength2 + "0800010604745265711d0001" + bufferLength3 + '0a0a030000' + n2hex(_nimoAPI.uid) + '1609636f6d706f6e656e742700000158' + a2hex(_nimoAPI.token) + '361077656226312e302e34266e696d6f5456460056' + n2hex(_nimoAPI.lang.length) + '' + a2hex(_nimoAPI.lang) + '6603322e31706386' + n2hex(_nimoAPI.country.length) + '' + a2hex(_nimoAPI.country) + '9600a600b0050b13000000' + n2hex(_nimoAPI.channelID) + '26' + n2hex(message.length) + '' + a2hex(message) + '3c4a00ff10042c0b5a00ff10042c30014c50ff0b690c7c86' + n2hex(_nimoAPI.username.length) + '' + a2hex(_nimoAPI.username) + '9cacbcc80cd0020b8c980ca80c2c3621383238353661366332373265643531362d383238353661366332373265643531364c')
}

/**
* Encodes a string to be sent by the websocket.
* @param {string} message
* @returns {string}
*/
NimoAPI.prototype.encodeMessageTag = function(message, userID, username)
{
    let tagBufferLength = username.length + 13 + 1;

    // 521 (base) - 2 (BR) - 4 (1046) - 6 (victti) - 1 (message) = 508
    let bufferLength = n2hex(508 + _nimoAPI.country.length + _nimoAPI.lang.length + _nimoAPI.username.length + message.length + tagBufferLength);

    let bufferLength2 = n2hex(467 + _nimoAPI.country.length + _nimoAPI.lang.length + _nimoAPI.username.length + message.length + tagBufferLength);

    let bufferLength3 = n2hex(453 + _nimoAPI.country.length + _nimoAPI.lang.length + _nimoAPI.username.length + message.length + tagBufferLength);

    return hex2a('00031d0001' + bufferLength + '0000' + bufferLength + '10032c3c400056066e696d6f7569660b73656e644d6573736167657d0001' + bufferLength2 + "0800010604745265711d0001" + bufferLength3 + '0a0a030000' + n2hex(_nimoAPI.uid) + '1609636f6d706f6e656e742700000158' + a2hex(_nimoAPI.token) + '361077656226312e302e34266e696d6f5456460056' + n2hex(_nimoAPI.lang.length) + '' + a2hex(_nimoAPI.lang) + '6603322e31706386' + n2hex(_nimoAPI.country.length) + '' + a2hex(_nimoAPI.country) + '9600a600b0050b13000000' + n2hex(_nimoAPI.channelID) + '26' + n2hex(message.length) + '' + a2hex(message) + '3c4a00ff10042c0b5a00ff10042c30014c50ff0b69' + '00010a030000' + n2hex(userID) + '16' + n2hex(username.length) + '' + a2hex(username) +'0b7c86' + n2hex(_nimoAPI.username.length) + '' + a2hex(_nimoAPI.username) + '9cacbcc80cd0020b8c980ca80c2c3621383238353661366332373265643531362d383238353661366332373265643531364c')
}

//#region events
NimoAPI.prototype.onOpenWB = function(evt)
{
    _nimoAPI.loopPackage(_nimoAPI.packages.hello);
}

NimoAPI.prototype.onMessageWB = function(evt)
{
    _nimoAPI.pack_receiv += 1;

    const data = evt.data;
    const dtView = new DataView(data);
    console.log(dtView)
    let packageData = _nimoAPI.readPackage(dtView, 0);

    // Troca de pacotes para receber informações do servidor
    if(packageData == '0004 1d00 006b 0000 006b 1003 2c3c 40ff')
    {
        _nimoAPI.intervalSendMsg = setInterval(_nimoAPI.sendMsgInterval, 10);
    }

    // Notificação recebida
    let header_pack = null;
    if(header_pack = packageData.match(/0016 1d00 01([0-9a-f]{2}) [0-9a-f]{2}06 116e 696d 6f3a 315f/))
    {
        let hexNotify = _nimoAPI.readPackage(dtView, 2).substr(0, 4);

        console.log("Chegou notificação");

        switch(true)
        {
            // Mensagem
            case hexNotify == _nimoAPI.type_package.newMsg:
                let header_data = packageData.replace(/[^0-9a-f]/gi, "");;
                header_data += _nimoAPI.readPackage(dtView, 1).replace(/[^0-9a-f]/gi, "");;

                let channelID = header_data[16] + "" + header_data[17];
                channelID = hex2a(header_data.substr(18, parseInt(channelID, 16) * 2));
                channelID = channelID.replace("nimo:1_", "");

                let from_userID = _nimoAPI.readPackage(dtView, 2).replace(/[^0-9a-f]/gi, "");

                from_userID = hex2n(from_userID.substr(21, 11));

                console.log("from id: " + from_userID);

                let from_msg = _nimoAPI.readPackage(dtView, 3).replace(/[^0-9a-f]/gi, "");
                from_msg += _nimoAPI.readPackage(dtView, 4).replace(/[^0-9a-f]/gi, "");

                let usrLength = from_msg[2] + "" + from_msg[3];
                from_msg = decode_utf8(hex2a(from_msg.substr(4, parseInt(usrLength, 16) * 2)));

                console.log("from user: " + from_msg);

                let msg = "";
                let buffer_i = 4;
                let msg_buffer = null;

                do {
                    msg_buffer = _nimoAPI.readPackage(dtView, buffer_i).replace(/[^0-9a-f]/gi, "");
                    buffer_i++;
                    msg += msg_buffer;
                } while(buffer_i < 12);
        
                let indexOfID26 = msg.indexOf(n2hex(Number(channelID)) + "26");
                
                let msgLength = hex2n(msg.substr(indexOfID26 + 12, 2));

                msg = msg.substr(indexOfID26 + 14, msgLength * 2);
                msg = decode_utf8(hex2a(msg));

                if(msg.match(/\:[0-9]{3}\:/))
                {
                    msg = msg.replace(/\:([0-9]{3})\:/gi, `<img src="./img/emote/$1.webp" width="26px" height="26px" style="padding: 0 5px 0 5px;"/>`);
                }

                console.log("with msg: " + msg);

                _nimoAPI.notifyDelegate({
                    type: "message",
                    channelID,
                    userID: from_userID,
                    nickname: from_msg,
                    msg
                });
                break;
            case hexNotify == _nimoAPI.type_package.trevo:
                // fodase trevo, mas pode ser qlqr "bit" tbm
                break;
            default:
                console.warn("Unknown hexNotify: " + hexNotify);
                break;
        }
    }
}

NimoAPI.prototype.onCloseWB = function(evt)
{
    console.log("WebSocket is closed now.");
}

NimoAPI.prototype.onErrorWB = function(evt)
{
    console.error("WebSocket error observed:", evt);
}
//#endregion

NimoAPI.prototype.stop = function()
{
    if(_nimoAPI.wbSocket != null)
    {
        _nimoAPI.wbSocket.close();

        _nimoAPI.wbSocket = null;
    }
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