'use strict';

import * as path from 'path';
import * as cp from 'child_process';
import { window, workspace, TextDocument, Diagnostic, DiagnosticCollection, Uri, Position, Range, DiagnosticSeverity, TextDocumentChangeEvent } from 'vscode';
import * as constants from '../constants';
import { getWabtPath } from '../getWabtPath';

export class WastValidationProvider {
    private wabtPath: string;
    private documents = <{[fileName: string]: TextDocument}>{};
    private currentDocument: TextDocument;
    
    constructor(private currentDiagnostics: DiagnosticCollection) {
        workspace.onDidChangeConfiguration(this.onDidChangeConfiguration.bind(this));
        this.onDidChangeConfiguration();
        this.validate = this.validate.bind(this);
        let fileWatcher = workspace.createFileSystemWatcher('**/*.{was,wast}');
        fileWatcher.onDidChange(this.validate);
        fileWatcher.onDidCreate(this.validate);
        fileWatcher.onDidDelete(uri => this.currentDiagnostics.delete(uri));
    }
    
    onDidChangeConfiguration() {
        try {
            this.wabtPath = getWabtPath();
            this.validateAll();
        } catch (e) { }
    }

    validateAll() {
        workspace.findFiles('**/*.{was,wast}', '').then(uris => {
            uris.forEach(this.validate);
        });
    }

    validate(uri: Uri) {
        if (!uri || !this.wabtPath) return;
        cp.exec(`${this.wabtPath}/out/wast2wasm ${uri.fsPath}`, (err, stdout, stderr) => {
            if (stderr) {
                let parser = new WastErrorParser(stderr);
                parser.parse();
                this.currentDiagnostics.set(uri, parser.errors);
            } else {
                this.currentDiagnostics.delete(uri);
            }
        });
    }
}

class WastErrorParser {
    errors: Diagnostic[] = [];
    lines: string[];
    index = 0;
    currentMessage: string;
    currentStartPosition: Position;
    currentEndPosition: Position;

    constructor(stderr: string) {
        this.lines = stderr.trim().split('\n');
    }

    parse() {
        while(this.index < this.lines.length) {
            this.parseErrorInfoLine();
            this.parseErrorRangeLine();
            this.errors.push(new Diagnostic(new Range(this.currentStartPosition, this.currentEndPosition), this.currentMessage));
        }
    }

    parseErrorInfoLine() {
        let s = this.lines[this.index];
        let m = s.match(/^(.+wast):(\d+):(\d+):\s*(.+)$/);
        if (!m) return;
        let [, filePath, row, col, message] = m;
        this.currentMessage = message;
        this.currentStartPosition = this.currentEndPosition = new Position(+row - 1, +col - 1);
        this.index++;
    }

    parseErrorRangeLine() {
        if (this.index >= this.lines.length) return;
        let s = this.lines[this.index];
        if (/^(.+wast):(\d+):(\d+):\s*(.+)$/.test(s)) return;
        if (!/^\s*\^+\s*$/.test(s)) {
            this.index++;
            this.parseErrorRangeLine();
            return;
        }
        let len = s.match(/\^+/)[0].length;
        this.currentEndPosition = new Position(this.currentStartPosition.line, this.currentStartPosition.character + len);
        this.index++;
    }
}