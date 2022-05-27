const { Console } = require('console');
const WebSocket = require('ws'); 
const {encodeBase64, decodeBase64, a2hex, hex2a, n2hex, decode_utf8, hex2n} = require("./old api/functions");

module.exports = class NimoChannel
{
    constructor(username, lUid, sGuid, sUA, sAppSrc, sCookie, sToken, channelID, notifyDelegate)
    {
        this.username = username;
        this.uid = lUid;
        this.token = sToken;
        this.channelID = channelID;
        let _lUid = n2hex(lUid);
        let _sGuid_length = n2hex(sGuid.length);
        let _sGuid = a2hex(sGuid);
        let _sUA = a2hex(sUA);
        let _sAppSrc = a2hex(sAppSrc);
        let _sCookie = a2hex(sCookie);
        let _sToken = a2hex(sToken);
        this.country = sAppSrc.split("&")[1];
        this.lang = sAppSrc.split("&")[2];
        let bufferLength = n2hex((1 + 8) + (sUA.length + 1) + (sAppSrc.length + 1) + (sCookie.length + 4) + (sGuid.length + 1) + (1 + 4) + 1);

        let _channelID = a2hex(channelID + "");
    
        this.packages = {
            hello: [
                encodeBase64(hex2a("00031d0001008b0000008b10032c3c40ff56066c61756e6368660877734c61756e63687d0000660800010604745265711d0000590a030000" + _lUid + "16" + _sGuid_length + "" + _sGuid + "2610776562683526302e302e31266e696d6f360c4e494d4f26425226313034364a060016002600360046000b0b8c980ca80c2c36004c5c6600")),
                encodeBase64(hex2a("000a1d0001" + bufferLength + "030000" + _lUid + "16" + n2hex(sUA.length) + "" + _sUA + "270000" + n2hex(sCookie.length) + "" + _sCookie + "36" + _sGuid_length + "" + _sGuid + "400156" + n2hex(sAppSrc.length) + "" + _sAppSrc + "2c36004c5c6600"))
            ],
            info: [
                encodeBase64(hex2a("00101d0001010f09000f06086e696d6f3a616c6c06116e696d6f3a315f" + _channelID + "06166e696d6f3a31335f" + _channelID + "5f77656206186e696d6f3a315f" + _channelID + "5f42525f77656206096e696d6f3a325f4252060a6e696d6f3a335f776562060b6e696d6f3a345f31303436060f6e696d6f3a375f313034365f776562060e6e696d6f3a355f42525f3130343606126e696d6f3a365f42525f313034365f776562060b6e696d6f3a385f31303436060e6e696d6f3a395f31305f31303436060a6e696d6f3a31305f313006176e696d6f3a31345f" + _channelID + "5f31303436061e6e696d6f3a31355f" + _channelID + "5f42525f313034365f77656216002c36004c")),
                encodeBase64(hex2a("00031d000101f5000001f510032c3c400656066e696d6f7569660b4f6e557365724576656e747d000101cc0800010604745265711d000101be0a0a030000" + _lUid + "1609636f6d706f6e656e742700000158" + _sToken + "361077656226312e302e34266e696d6f5456460056" + n2hex(this.lang.length) + "" + a2hex(this.lang) + "6603322e31706386" + n2hex(this.country.length) + "" + a2hex(this.country) + "9600a600b0050b1001230000022eae538fee33000000" + n2hex(channelID) + "4001560669676e6f72650b8c980ca80c2c3621366532633566643563376461383766312d366532633566643563376461383766314c")),
                `AAMdAAECBgAAAgYQAyw8QBxWBm5pbW91aWYPT25Vc2VySGVhcnRCZWF0fQABAdkIAAEGBHRSZXEdAAEBywoKAwAAAi6uU4/uFiAwYTQ3Njk0ZTY0Yzc5MTYwMWQxMjY2OGI2NzhiN2IzMicAAAFYQVFBZEtUaV8yLWpxcVNDUnU0S2J6RVhnT29EaG11QkVpVXdYazVuVkd5bHRxdHNzRmVsSWxRN2l2LWRROFhySnpqWnZ5NXQwODRBc0YtTERKOUVIekNqQ3prX3FmdTRPbW1wVHhiaUNzbkZ0bWY3SjVnU2tiWlFpLUVOc09aUVZiTkc5Mk8wYzAtYWhwbEtvUWxRekdGR2VXNWVxU3pvcGdzU0xuZVliQ3VfNU5kWTFvTG1zci1BZHI5aE5WYmEydF9fSmJpM1dCZmlZUXp2RVNVM0pDSVZBMHNmazFwUVVUUVcyUGk0TU9BaDU4anFXQWN5R1pRdFF4Tm1NRi1vdGJNa3I4SmRSYkRQNWlxaFppV1I1eGt2bmZxclJCcGtzTVNQSkc3TFppS1RxN01weWhoV2xQSXlMY1JvSWFlODJKTWJmbmgxMjNGXzY3eXZ6SlV2SDhwMko2EHdlYiYxLjAuNCZuaW1vVFZGAFYEMTA0NmYDMi4xcGOGAkJSlgCmALAFCxMAAAIurlOP7iMAAAABgBFJazABC4yYDKgMLDYhYmM4ZDExY2MxODNkZjQwMS1iYzhkMTFjYzE4M2RmNDAxTA==`,
                `AAMdAAEAjAAAAIwQAyw8QP9WBmxhdW5jaGYMcXVlcnlIdHRwRG5zfQAAYwgAAQYEdFJlcR0AAFYKAwAAAi6uU4/uFhB3ZWJoNSYwLjAuMSZuaW1vKQACBhBjZG4ud3VwLmh1eWEuY29tBhJjZG53cy5hcGkuaHV5YS5jb202DE5JTU8mQlImMTA0NkYAC4yYDKgMLDYATA==`,
            ]
        }

        // let hex = "00031d000102090000020910032c3c400056066e696d6f7569660b73656e644d6573736167657d000101E00800010604745265711d000101D20a0a030000022EAE541A3C1609636f6d706f6e656e7427000001584151414C796E56566F68503733697967334F4B413633325F70387662485F76795732657A6B54736C48375631387A495F326F4A486F53526372494E476955655F5650465442774C7471566D587850776349656B334A6A7A384E585A4C77666A534549533877363964495256546D5658486A6B6576664B424E5F364C57715F5738696F654E5572652D35526F7A494B556A3349617A536D355273614F327A5A624F6A765943514F346F694C6A6A755935686D616E49664F6B4B68315650367166354B44625A4F5643676F44534B6A5362466B353136634A323469352D364B525F7131344636596C585A655632725F5666544A4E78544A596A6B47664E484A464D5655683058524F7557414E6F3838424A3453656C78596B75365F4636744F6B526C4C36534D724A4B4C6E4931414C4A4F514D65455633796B776E484946714B787775736E5F575466434851756A656D497247496C775A376B7A361077656226312e302e34266e696d6f545646005604313034366603322e317063860242529600a600b0050b13000000018011496B2603E29C853c4a00ff10042c0b5a00ff10042c30014c50ff0b690c7c8606766963626F749cacbcc80cd0020b8c980ca80c2c3621383238353661366332373265643531362d383238353661366332373265643531364c";

        // let i = 0;
        // while(i < 200)
        // {
        //     let hexfromHex = hex.substr(i * 32, 32);

        //     let finalHex = "";
        //     for(let j = 0; j < hexfromHex.length; j++)
        //     {
        //         if(j % 4 == 0)
        //         {
        //             finalHex += " ";
        //         }

        //         finalHex += hexfromHex[j];
        //     }

        //     console.log("000000" + n2hex(i) + ":" + finalHex);

        //     i++;
        // }

        this.type_package = {
            newMsg: "781d",
            newFollow: "009c",
            like: "7a1d",
            onLive: /[a-f0-9]{2}1d/,
            onLive2: "d91d",
            trevo: "281d"
        };

        this.notifyDelegate = notifyDelegate;
        this.wbSocket = null;
        this.pack_receiv = 0;
    }

    start()
    {
        if(this.wbSocket != null)
        {
            this.stop();
        }

        this.wbSocket = new WebSocket('wss://wsapi.master.live/?APPSRC=NIMO&BR&1046');
        this.wbSocket.binaryType = 'arraybuffer';
        this.pack_receiv = 0;

        // Events
        this.wbSocket.on('open', () => this.onOpenWB(null));
        this.wbSocket.on('close', () => this.onCloseWB(null));
        this.wbSocket.on('error', (evt) => this.onErrorWB(evt));
        this.wbSocket.on('message', (evt) => this.onMessageWB(evt))
    }

    /**
    * Send a message to the chat.
    * @param {string} message 
    */
    sendMessage(message)
    {
        if(this.wbSocket.readyState == WebSocket.OPEN)
        {
            this.wbSocket.send(this.sendData(this.encodeMessage(message), false));
        }
    }

    /**
    * Send a message to the chat tagging a specific user.
    * @param {string} message 
    */
    sendMessageTag(message, userID, username)
    {
        if(this.wbSocket.readyState == WebSocket.OPEN)
        {
            this.wbSocket.send(this.sendData(this.encodeMessageTag(message, userID, username), false));
        }
    }

    /**
    * Loops through all values from a package and sends to the websocket.
    * @param {Array} packageData
    */
    loopPackage(packageData)
    {
        for(let i = 0; i < packageData.length; i++)
        {
            this.wbSocket.send(this.sendData(packageData[i], true));
        }
    }

    /**
    * Sends a ping from the info packages to the websocket.
    */
    ping()
    {
        this.wbSocket.send(this.sendData(this.packages.info[3], true));
    }

    /**
    * Send data to the websocket.
    * @param {string} data
    * @param {boolean} base64
    */
    sendData(data, base64 = false)
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

    sendMsgInterval()
    {
        if(this.pack_receiv == 2)
        {
            this.loopPackage(this.packages.info);
            this.pack_receiv = 0;
            clearInterval(this.intervalSendMsg);

            // Ping
            setInterval(() => this.ping(), 30000);
        }
    }

    /**
    * Reads a package received from the websocket and returns the HEX value.
    * @param {DataView} packageData
    * @param {number} block
    * @returns {string}
    */
    readPackage(packageData, block)
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
    encodeMessage(message)
    {
        // 521 (base) - 2 (BR) - 4 (1046) - 6 (victti) - 1 (message) = 508
        let bufferLength = n2hex(508 + this.country.length + this.lang.length + this.username.length + message.length);

        let bufferLength2 = n2hex(467 + this.country.length + this.lang.length + this.username.length + message.length);

        let bufferLength3 = n2hex(453 + this.country.length + this.lang.length + this.username.length + message.length);

        return hex2a('00031d0001' + bufferLength + '0000' + bufferLength + '10032c3c400056066e696d6f7569660b73656e644d6573736167657d0001' + bufferLength2 + "0800010604745265711d0001" + bufferLength3 + '0a0a030000' + n2hex(this.uid) + '1609636f6d706f6e656e742700000158' + a2hex(this.token) + '361077656226312e302e34266e696d6f5456460056' + n2hex(this.lang.length) + '' + a2hex(this.lang) + '6603322e31706386' + n2hex(this.country.length) + '' + a2hex(this.country) + '9600a600b0050b13000000' + n2hex(this.channelID) + '26' + n2hex(message.length) + '' + a2hex(message) + '3c4a00ff10042c0b5a00ff10042c30014c50ff0b690c7c86' + n2hex(this.username.length) + '' + a2hex(this.username) + '9cacbcc80cd0020b8c980ca80c2c3621383238353661366332373265643531362d383238353661366332373265643531364c')
    }

    /**
    * Encodes a string to be sent by the websocket.
    * @param {string} message
    * @returns {string}
    */
    encodeMessageTag(message, userID, username)
    {
        let tagBufferLength = username.length + 13 + 1;

        // 521 (base) - 2 (BR) - 4 (1046) - 6 (victti) - 1 (message) = 508
        let bufferLength = n2hex(508 + this.country.length + this.lang.length + this.username.length + message.length + tagBufferLength);

        let bufferLength2 = n2hex(467 + this.country.length + this.lang.length + this.username.length + message.length + tagBufferLength);

        let bufferLength3 = n2hex(453 + this.country.length + this.lang.length + this.username.length + message.length + tagBufferLength);

        return hex2a('00031d0001' + bufferLength + '0000' + bufferLength + '10032c3c400056066e696d6f7569660b73656e644d6573736167657d0001' + bufferLength2 + "0800010604745265711d0001" + bufferLength3 + '0a0a030000' + n2hex(this.uid) + '1609636f6d706f6e656e742700000158' + a2hex(this.token) + '361077656226312e302e34266e696d6f5456460056' + n2hex(this.lang.length) + '' + a2hex(this.lang) + '6603322e31706386' + n2hex(this.country.length) + '' + a2hex(this.country) + '9600a600b0050b13000000' + n2hex(this.channelID) + '26' + n2hex(message.length) + '' + a2hex(message) + '3c4a00ff10042c0b5a00ff10042c30014c50ff0b69' + '00010a030000' + n2hex(userID) + '16' + n2hex(username.length) + '' + a2hex(username) +'0b7c86' + n2hex(this.username.length) + '' + a2hex(this.username) + '9cacbcc80cd0020b8c980ca80c2c3621383238353661366332373265643531362d383238353661366332373265643531364c')
    }

    //#region events
    onOpenWB(evt)
    {
        this.loopPackage(this.packages.hello);
    }

    onMessageWB(evt)
    {
        this.pack_receiv += 1;

        const dtView = new DataView(evt);
        let packageData = this.readPackage(dtView, 0);

        // Troca de pacotes para receber informações do servidor
        if(packageData == '0004 1d00 006d 0000 006d 1003 2c3c 40ff')
        {
            this.intervalSendMsg = setInterval(() => this.sendMsgInterval(), 10);
        }

        // Notificação recebida
        let header_pack = null;
        if(header_pack = packageData.match(/0016 1d00 01([0-9a-f]{2}) [0-9a-f]{2}06 116e 696d 6f3a 315f/))
        {
            let hexNotify = this.readPackage(dtView, 2).substr(0, 4);

            console.log("Chegou notificação");

            // Check for messages
            let fullData = "";

            let msg_buffer = null;
            let buffer_i = 0;
            do
            {
                msg_buffer = this.readPackage(dtView, buffer_i).replace(/[^0-9a-f]/gi, "");
                buffer_i++;
                fullData += msg_buffer;

                if(fullData.includes("000b2c36004c5c6600"))
                {
                    break;
                }
            } while(buffer_i < 100)

            let splitMessages = fullData.split("0105781d0001");
            for(let i = 1; i < splitMessages.length; i++)
            {
                let multiUserID = hex2n(splitMessages[i].substr(12).substr(0, 12));

                let multiUsrStr = splitMessages[i].substr(26);
                let multiUsrLength = multiUsrStr[0] + multiUsrStr[1];
                let multiUsrname = decode_utf8(hex2a(multiUsrStr.substr(2, parseInt(multiUsrLength, 16) * 2)));

                let multiMsgStr = splitMessages[i].substr(splitMessages[i].indexOf(n2hex(Number(this.channelID)) + "26") + 12);
                let multiMsgLength = hex2n(multiMsgStr.substr(0, 2));
                let multiMsg = multiMsgStr.substr(2, multiMsgLength * 2);
                multiMsg = decode_utf8(hex2a(multiMsg));
                
                console.log('\x1b[33m%s\x1b[0m', multiUsrname + ": " + multiMsg);

                this.notifyDelegate({
                    type: "message",
                    channelID: this.channelID,
                    userID: multiUserID,
                    nickname: multiUsrname,
                    msg: multiMsg
                });
            }

            switch(true)
            {
                case hexNotify == this.type_package.newMsg:
                    // moved
                    break;

                case hexNotify == this.type_package.trevo:
                    // fodase trevo, mas pode ser qlqr "bit" tbm
                    break;
                case hexNotify == "821d":
                    let content = "";
                    let buffer_i2 = 3;
                    let buffer = null;
                    
                    do {
                        buffer = this.readPackage(dtView, buffer_i2).replace(/[^0-9a-f]/gi, "");
                        content += buffer;
        
                        buffer_i2++;
                    } while(buffer_i2 < 7);

                    if(content != "")
                    {
                        let userID = hex2n(content.substr(49, 9));
                        let username = hex2a(content.substr(62, parseInt(content.substr(60, 2) * 2)))

                        //console.log('\x1b[33m%s\x1b[0m', username + " is on the channel");
                    }

                    break;
                default:
                    console.warn("Unknown hexNotify: " + hexNotify);
                    break;
            }
        }
    }

    onCloseWB(evt)
    {
        console.log("WebSocket is closed now.");
    }

    onErrorWB(evt)
    {
        console.error("WebSocket error observed:", evt);
    }
    //#endregion

    stop()
    {
        if(this.wbSocket != null)
        {
            this.wbSocket.close();

            this.wbSocket = null;
        }
    }
}