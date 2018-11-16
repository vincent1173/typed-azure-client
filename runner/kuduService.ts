import minimist = require('minimist');
import kuduLib = require('../lib/azure-arm-app-service-kudu');

let mopts = {
	string: [
        'action',
        'scmUri',
        'username',
        'password',
        'packagePath'
	]
};

const validActions: string[] = ['zipdeploy'];

function main() {
    let argv = minimist(process.argv, mopts);

    if(!argv.scmUri || !argv.username || !argv.password || !argv.action) {
        throw Error('Specify --scmUri --username --password --action');
    }

    let requestedAction = argv.action;
    if(validActions.indexOf(requestedAction) == -1) {
        console.log("Invalid action requested. Valid Actions are " + JSON.stringify(validActions));
    }

    let kuduServiceObj = new kuduLib.Kudu(argv.scmUri, argv.username, argv.password);

    switch(requestedAction) {
        case validActions[0]: {
            let packagePath = argv.package;
            if(!packagePath) {
                throw Error("specify --package");
            }

            kuduServiceObj.zipDeploy(packagePath, [process.env['DEPLOYER'] || 'TYPED_AZURE_REST_AGENT', 'isAsync=true']).then((result) => {
                console.log(result);
                if(result.status == 4) {
                    console.log("Zip Deploy completed successfully");
                }
                else {
                    throw Error("Zip Deploy failed.");
                }
            }).catch((error) => {
                throw Error(error);
            });
            break;
        }
    }
}

main();