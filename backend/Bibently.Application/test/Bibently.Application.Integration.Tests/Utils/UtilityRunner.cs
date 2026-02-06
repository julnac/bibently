// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="UtilityRunner.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Integration.Tests.Utils;

using Xunit;

public class UtilityRunner(ITestOutputHelper outputHelper)
{
    // [Fact(Skip = "Utility method - to be run manually when needed")]
    [Fact]
    public async Task RunAdminUserUtility()
    {
        var adminUserUtility = new AdminUserUtility(outputHelper);
        adminUserUtility.EnsureLocalAdminUserAsync("demo-admin-uid");
        var token = TokenTool.Generate("demo-admin-uid");
        outputHelper.WriteLine(token);
    }
}
