'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import { window, workspace, TextDocument } from 'vscode';
import * as constants from '../constants';

export class WastValidationProvider {
    private sexprwasmPath: string;
    private documents = <{[fileName: string]: TextDocument}>{};
    private currentDocument: TextDocument;
    private channel = window.createOutputChannel('sexpr-wasm output');
    
    constructor() {
        workspace.onDidOpenTextDocument(this.onDidOpenDocument.bind(this));
        workspace.onDidSaveTextDocument(this.onDidSaveDocument.bind(this));
        workspace.onDidCloseTextDocument(this.onDidCloseDocument.bind(this));
        workspace.onDidChangeConfiguration(this.onDidChangeConfiguration.bind(this));
        this.onDidChangeConfiguration();
    }
    
    onDidOpenDocument(document: TextDocument) {
        if (document.isUntitled) return;
        this.documents[document.fileName] = document;
        this.currentDocument = document;
        this.validate(document);
    }
    
    onDidCloseDocument(document: TextDocument) {
        if (document.isUntitled) return;
        delete this.documents[document.fileName];
    }
    
    onDidSaveDocument(document: TextDocument) {
        this.currentDocument = document;
        this.validate(document);
    }
    
    onDidChangeConfiguration() {
        const config = workspace.getConfiguration(constants.modeId);
        this.sexprwasmPath = config.get(constants.config.sexprwasmPath, null);
        this.validate(this.currentDocument);
    }
    
    validate(document: TextDocument) {
        if (!document || !this.sexprwasmPath) return;
        cp.exec(`${this.sexprwasmPath} ${document.fileName}`, (err, stdout, stderr) => {
            if (stderr) {
                this.channel.clear();
                this.channel.append(stderr);
                this.channel.show();
            } else {
                this.channel.hide();
            }
        });
    }
}