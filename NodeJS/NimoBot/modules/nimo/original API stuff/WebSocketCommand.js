function WebSocketCommand()
{
    this.iCmdType = 0;

    this.vData;

    this.lRequestId = 0;

    this.traceId = "";

    this.iEncryptType = 0;

    this.readFrom(JceInputStream)
    {
        this.iCmdType = JceInputStream.readInt32();
        this.vData = JceInputStream.readBytes();
        this.lRequestId = JceInputStream.readInt64();
        this.traceId = JceInputStream.readString();
        this.iEncryptType = JceInputStream.readInt32();
    }
}

module.exports = WebSocketCommand;