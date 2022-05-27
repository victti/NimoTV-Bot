function JceInputStream(buffer)
{
    this.DataHelp = {
        EN_INT8: 0,
        EN_INT16: 1,
        EN_INT32: 2,
        EN_INT64: 3,
        EN_FLOAT: 4,
        EN_DOUBLE: 5,
        EN_STRING1: 6,
        EN_STRING4: 7,
        EN_MAP: 8,
        EN_LIST: 9,
        EN_STRUCTBEGIN: 10,
        EN_STRUCTEND: 11,
        EN_ZERO: 12,
        EN_SIMPLELIST: 13
    };

    this.buf = new buf(buffer);

    this.readFrom = function()
    {
        var t = this.buf.readUint8(), e = (240 & t) >> 4, n = 15 & t;
        return 15 <= e && (e = this.buf.readUInt8()), {
            tag: e,
            type: n
        }
    }

    this.readInt32 = function()
    {
        var i = this.readFrom();
        switch (i.type) {
            case this.DataHelp.EN_ZERO:
                return 0;
            case this.DataHelp.EN_INT8:
                return this.buf.readInt8();
            case this.DataHelp.EN_INT16:
                return this.buf.readInt16();
            case this.DataHelp.EN_INT32:
                return this.buf.readInt32()
        }
    }

    this.readBytes = function() {
        var i = this.readFrom();
        if (i.type == t.DataHelp.EN_SIMPLELIST) {
            var o = this.readFrom();
            if (o.type != t.DataHelp.EN_INT8) throw Error("type mismatch, type:" + i.type + "," + o.type);
            if ((a = this.readInt32(0, !0)) < 0) throw Error("invalid size, type:" + i.type + "," + o.type);
            return this.buf.readBytes(a)
        }
        if (i.type != t.DataHelp.EN_LIST) throw Error("type mismatch, type:" + i.type);
        var a = this.readInt32(0, !0);
        return this.buf.readBytes(a)
    }
}

function buf(buffer)
{
    this.position = 0;
    this.buffer = buffer;

    this.readUint8 = function()
    {
        return this.position += 1, this.buffer.getUint8(this.position - 1);
    }

    this.readInt8 = function()
    {
        return this.buffer.getInt8(this.position++)
    }

    this.readInt16 = function()
    {
        return this.position += 2, this.buffer.getInt16(this.position - 2)
    }

    this.readInt32 = function()
    {
        return this.position += 4, this.buffer.getInt32(this.position - 4)
    }
}

module.exports = JceInputStream;