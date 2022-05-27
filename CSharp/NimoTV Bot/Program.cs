using Microsoft.Extensions.DependencyInjection;

namespace NimoTV_Bot
{
    internal class Program
    {
        private static Task Main(string[] args)
        {
            bool debug;
#if DEBUG
            debug = true;
#else
            debug = false;
#endif

            var container = BuildServiceProvider(debug);
            var bot = container.GetRequiredService<VicBot>();
            return bot.InitializeAsync();
        }

        private static IServiceProvider BuildServiceProvider(bool debug)
        {
            return new ServiceCollection()
                .AddSingleton(_ => new Configuration(debug))
                .AddSingleton<VicBot>()
                .BuildServiceProvider();
        }
    }
}
