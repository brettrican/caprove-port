official = open("OneClickAppRouter_official.ts").read()

# Add import
patched = "import PortConflictChecker from '../../../user/oneclick/PortConflictChecker'\n" + official

# Add routes
new_routes = """
router.post('/check-conflicts', function (req, res, next) {
    const dataStore = InjectionExtractor.extractUserFromInjected(res).user.dataStore;
    const checker = new PortConflictChecker(dataStore.getAppsDataStore());

    checker.checkConflicts(req.body.renderedServices)
        .then(conflicts => {
            res.send({
                status: ApiStatusCodes.STATUS_OK,
                description: 'Conflict check complete',
                data: { conflicts }
            });
        })
        .catch(next);
});

router.get('/next-available-port/:port', function (req, res, next) {
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
});
"""

# Insert after the interface definition
insert_point = official.find("logoUrl: string\n}") + len("logoUrl: string\n}")
if insert_point != -1:
    final_content = "import PortConflictChecker from '../../../user/oneclick/PortConflictChecker'\n" + official[:insert_point] + new_routes + official[insert_point:]
    with open("src/routes/user/oneclick/OneClickAppRouter.ts", "w") as f:
        f.write(final_content)
    print("Success")
else:
    print("Failed to find insertion point")
