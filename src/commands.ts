import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { getWabtPath } from './getWabtPath';

export const outputChannel = vscode.window.createOutputChannel('wast');

function run(command: string, options: string) {
    try {
        const s = path.join(getWabtPath(), command) + ' ' + options;
        cp.exec(s, (error, stdout, stderr) => {
            outputChannel.show();
            outputChannel.appendLine(s);
            outputChannel.append(stdout);
            outputChannel.append(stderr);
        });
    } catch (e) { }
}

export function registerCommands() {
    vscode.commands.registerCommand('wast.test', () => {
        run(`test/run-interp.py`, `--spec ${vscode.window.activeTextEditor.document.uri.fsPath}`);
    });

    vscode.commands.registerCommand('wast.dump', () => {
        run(`out/wast2wasm`, `-d ${vscode.window.activeTextEditor.document.uri.fsPath}`);
    });

    vscode.commands.registerCommand('wast.info', () => {
        run(`out/wast2wasm` ,`-v ${vscode.window.activeTextEditor.document.uri.fsPath}`);
    });

    vscode.commands.registerCommand('wast.build', () => {
        const { fsPath } = vscode.window.activeTextEditor.document.uri;
        const outPath = fsPath.replace(/\.wast?$/, ".wasm");
        run(`out/wast2wasm`, `${fsPath} -o ${outPath}`);
    });
}
