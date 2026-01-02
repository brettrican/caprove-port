import sys

with open("src/routes/user/oneclick/OneClickAppRouter.ts", "r") as f:
    content = f.read()

old_block = """router.get('/next-available-port/:port', function (req, res, next) {
    const dataStore = InjectionExtractor.extractUserFromInjected(res).user.dataStore;
    const checker = new PortConflictChecker(dataStore.getAppsDataStore());
    const nextPort = checker.findNextAvailablePort(parseInt(req.params.port));

    res.send({
        status: ApiStatusCodes.STATUS_OK,
        description: 'Next available port found',
        data: { nextPort }
    });
});"""

new_block = """router.get('/next-available-port/:port', function (req, res, next) {
    const dataStore = InjectionExtractor.extractUserFromInjected(res).user.dataStore;
    const checker = new PortConflictChecker(dataStore.getAppsDataStore());

    checker.findNextAvailablePort(parseInt(req.params.port))
        .then(nextPort => {
            res.send({
                status: ApiStatusCodes.STATUS_OK,
                description: 'Next available port found',
                data: { nextPort }
            });
        })
        .catch(next);
});"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open("src/routes/user/oneclick/OneClickAppRouter.ts", "w") as f:
        f.write(new_content)
    print("Success")
else:
    print("Old block not found exactly")
