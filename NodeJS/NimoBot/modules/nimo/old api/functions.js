const btoa = require('btoa');
const atob = require('atob');

function encodeBase64(data) {
    if (typeof btoa === "function") {
        return btoa(data);
    } else if (typeof Buffer === "function") {
        return Buffer.from(data, "utf-8").toString("base64");
    } else {
        throw new Error("Failed to determine the platform specific encoder");
    }
}

function decodeBase64(data) {
    if (typeof atob === "function") {
        return atob(data);
    } else if (typeof Buffer === "function") {
        return Buffer.from(data, "base64").toString("utf-8");
    } else {
        throw new Error("Failed to determine the platform specific decoder");
    }
}

function a2hex(str) {
  let arr = [];
  
  for (let i = 0, l = str.length; i < l; i ++) {
    let hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  
  return arr.join('');
}

function hex2a(hexx) {
    let hex = hexx.toString();
    let str = '';
    
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    return str;
}

function n2hex(num)
{
    let hex = num.toString(16);

    return hex.length % 2 ? '0' + hex : hex;
}

function hex2n(hex)
{
    return parseInt(hex, 16)
}

function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
    try
    {
        s = decodeURIComponent(escape(s))
    } catch {}
    return s;
}

module.exports = {
    encodeBase64,
    decodeBase64,
    a2hex,
    hex2a,
    n2hex,
    hex2n,
    encode_utf8,
    decode_utf8
}