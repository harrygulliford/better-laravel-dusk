const vscode = require('vscode');
const DuskCommand = require('./dusk-command');

var globalCommand;

module.exports.activate = function (context) {
    let disposables = [];

    disposables.push(vscode.commands.registerCommand('better-laravel-dusk.run', async () => {
        await runCommand(
            new DuskCommand
        );
    }));

    disposables.push(vscode.commands.registerCommand('better-laravel-dusk.run-file', async () => {
        await runCommand(
            new DuskCommand({ runFile: true })
        );
    }));

    disposables.push(vscode.commands.registerCommand('better-laravel-dusk.run-suite', async () => {
        await runCommand(
            new DuskCommand({ runFullSuite: true })
        );
    }));

    disposables.push(vscode.commands.registerCommand('better-laravel-dusk.run-previous', async () => {
        await runPreviousCommand();
    }));

    disposables.push(vscode.tasks.registerTaskProvider('laravel-dusk', {
        provideTasks: () => {
            return [new vscode.Task(
                { type: "laravel-dusk", task: "run" },
                2,
                "run",
                'laravel-dusk',
                new vscode.ShellExecution(globalCommand.output),
                '$laravel-dusk'
            )];
        }
    }));

    context.subscriptions.push(disposables);
}

async function runCommand(command) {
    setGlobalCommandInstance(command);

    vscode.window.activeTextEditor
        || vscode.window.showErrorMessage('Better Laravel Dusk: open a file to run this command');

    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'laravel-dusk: run');
}

async function runPreviousCommand() {
    await vscode.commands.executeCommand('workbench.action.terminal.clear');
    await vscode.commands.executeCommand('workbench.action.tasks.runTask', 'laravel-dusk: run');
}

function setGlobalCommandInstance(commandInstance) {
    // Store this object globally for the provideTasks, "run-previous", and for tests to assert against.
    globalCommand = commandInstance;
}

// This method is exposed for testing purposes.
module.exports.getGlobalCommandInstance = function () {
    return globalCommand;
}
