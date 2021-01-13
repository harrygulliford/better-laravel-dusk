const findUp = require('find-up');
const vscode = require('vscode');
const path = require('path');

module.exports = class DuskCommand {
    constructor(options) {
        this.runFullSuite = options !== undefined
            ? options.runFullSuite
            : false;

        this.runFile = options !== undefined
            ? options.runFile
            : false;

        this.lastOutput;
    }

    get output() {
        if (this.lastOutput) {
            return this.lastOutput;
        }

        if (this.runFullSuite) {
            this.lastOutput = `${this.binary} dusk${this.suffix}`
        } else if (this.runFile) {
            this.lastOutput = `${this.binary} dusk ${this.file}${this.configuration}${this.suffix}`;
        } else {
            this.lastOutput = `${this.binary} dusk ${this.file}${this.filter}${this.configuration}${this.suffix}`;
        }

        return this.lastOutput;
    }

    get file() {
        return this._normalizePath(vscode.window.activeTextEditor.document.fileName);
    }

    get filter() {
        return process.platform === "win32"
            ? (this.method ? ` --filter '^.*::${this.method}'` : '')
            : (this.method ? ` --filter '^.*::${this.method}( .*)?$'` : '');
    }

    get configuration() {
        return '';
    }

    get suffix() {
        let suffix = vscode.workspace.getConfiguration('better-laravel-dusk').get('commandSuffix');

        return suffix ? ' ' + suffix : ''; // Add a space before the suffix.
    }

	get windowsSuffix() {
        return process.platform === "win32"
            ? '.bat'
            : '';
    }

    get binary() {
        if (vscode.workspace.getConfiguration('better-laravel-dusk').get('artisanBinary')) {
            return vscode.workspace.getConfiguration('better-laravel-dusk').get('artisanBinary')
        }

        return this.subDirectory
            ? this._normalizePath(path.join(this.subDirectory, 'artisan'))
            : this._normalizePath(path.join(vscode.workspace.rootPath, 'artisan'));
    }

    get subDirectory() {
        // find the closest artisan file in the project.
        let artisanFile = findUp.sync(['artisan'], { cwd: vscode.window.activeTextEditor.document.fileName });

        return path.dirname(artisanFile) !== vscode.workspace.rootPath
            ? path.dirname(artisanFile)
            : null;
    }

    get method() {
        let line = vscode.window.activeTextEditor.selection.active.line;
        let method;

        while (line > 0) {
            const lineText = vscode.window.activeTextEditor.document.lineAt(line).text;
            const match = lineText.match(/^\s*(?:public|private|protected)?\s*function\s*(\w+)\s*\(.*$/);
            if (match) {
                method = match[1];
                break;
            }
            line = line - 1;
        }

        return method;
    }

    _normalizePath(path) {
        return path
            .replace(/\\/g, '/') // Convert backslashes from windows paths to forward slashes, otherwise the shell will ignore them.
            .replace(/ /g, '\\ '); // Escape spaces.
    }
}
