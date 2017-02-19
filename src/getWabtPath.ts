import * as vscode from 'vscode';
import * as fs from 'fs';
import * as constants from './constants';

export function getWabtPath() {
    const config = vscode.workspace.getConfiguration(constants.modeId);
    const wabtPath = config['wabtPath'];
    if (!wabtPath) {
        vscode.window.showErrorMessage('wabtPath does not exist');
        throw new Error('wabtPath does not exist');
    }
    return wabtPath;
}