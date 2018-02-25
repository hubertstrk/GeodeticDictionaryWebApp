using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(gdDictionaryWebApp.Startup))]
namespace gdDictionaryWebApp
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
