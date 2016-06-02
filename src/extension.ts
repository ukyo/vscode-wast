'use strict';

import * as path from 'path';
import * as cp from 'child_process';

import { window, languages, workspace, TextDocument, ExtensionContext } from 'vscode';
import { WastCompletionItemProvider } from './features/completionItemProvider';
import { WastValidationProvider } from './features/validationProvider';
import * as constants from './constants';

export function activate(context: ExtensionContext) {
    languages.setLanguageConfiguration(constants.modeId, {
        indentationRules: {
            decreaseIndentPattern: /^[^(]*\).*/,
            increaseIndentPattern: /.*\([^)]*$/
        },
        comments: {
            lineComment: ';;',
            blockComment: ['(;', ';)']
        },
        brackets: [
            ['(', ')']
        ],
        wordPattern: /(-?\d*\.\d\w*)|([^\(\)\=\\\'\"\s]+)/g
    });
    languages.registerCompletionItemProvider(constants.modeId, new WastCompletionItemProvider());
    const validationProvider = new WastValidationProvider();
}