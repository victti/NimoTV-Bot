using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NimoTV_Bot
{
    internal static class Extensions
    {
        public static int Utf8Length(this string utf8String)
        {
            return Encoding.UTF8.GetByteCount(utf8String);
        }
    }
}
