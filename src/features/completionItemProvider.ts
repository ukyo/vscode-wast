'use strict';

import { CompletionItem, TextDocument, Position, CompletionItemKind, CompletionItemProvider, CancellationToken, WorkspaceConfiguration } from 'vscode';

const operators = `i32.load8_s|i32.load8_u|i32.load16_s|i32.load16_u|i32.load|i64.load_8_s|i64.load8_u|i64.load16_s|i64.load16_u|i64.load32_s|i64.load32_u|i64.load|f32.load|f64.load|i32.store8|i32.store16|i32.store|i64.store8|i64.store16|i64.store32|i64.store|f32.store|f64.store|i32.const|i64.const|f32.const|f64.const|i32.add|i32.sub|i32.mul|i32.div_s|i32.div_u|i32.rem_s|i32.rem_u|i32.and|i32.or|i32.xor|i32.shl|i32.shr_u|i32.shr_s|i32.rotr|i32.rotl|i32.eq|i32.ne|i32.lt_s|i32.le_s|i32.lt_u|i32.le_u|i32.gt_s|i32.ge_s|i32.gt_u|i32.ge_u|i32.clz|i32.ctz|i32.popcnt|i32.eqz|i64.add|i64.sub|i64.mul|i64.div_s|i64.div_u|i64.rem_s|i64.rem_u|i64.and|i64.or|i64.xor|i64.shl|i64.shr_u|i64.shr_s|i64.rotr|i64.rotl|i64.eq|i64.ne|i64.lt_s|i64.le_s|i64.lt_u|i64.le_u|i64.gt_s|i64.ge_s|i64.gt_u|i64.ge_u|i64.clz|i64.ctz|i64.popcnt|i64.eqz|f32.add|f32.sub|f32.mul|f32.div|f32.min|f32.max|f32.abs|f32.neg|f32.copysign|f32.ceil|f32.floor|f32.trunc|f32.nearest|f32.sqrt|f32.eq|f32.ne|f32.lt|f32.le|f32.gt|f32.ge|f64.add|f64.sub|f64.mul|f64.div|f64.min|f64.max|f64.abs|f64.neg|f64.copysign|f64.ceil|f64.floor|f64.trunc|f64.nearest|f64.sqrt|f64.eq|f64.ne|f64.lt|f64.le|f64.gt|f64.ge|i32.trunc_s/f32|i32.trunc_s/f64|i32.trunc_u/f32|i32.trunc_u/f64|i32.wrap/i64|i64.trunc_s/f32|i64.trunc_s/f64|i64.trunc_u/f32|i64.trunc_u/f64|i64.extend_s/i32|i64.extend_u/i32|f32.convert_s/i32|f32.convert_u/i32|f32.convert_s/i64|f32.convert_u/i64|f32.demote/f64|f32.reinterpret/i32|f64.convert_s/i32|f64.convert_u/i32|f64.convert_s/i64|f64.convert_u/i64|f64.promote/f32|f64.reinterpret/i64|i32.reinterpret/f32|i64.reinterpret/f64|grow_memory|current_memory|get_local|set_local|call|call_import|call_indirect|address_of|invoke`;
const declarations = `memory|import|export|func|param|local|module|result|unreachable|type`;
const controls = `nop|block|loop|if|if_else|br|br_if|br_table|return`;
const types = `i32|f32|i64|f64`;

const wastCompletionItems: CompletionItem[] = [operators,　declarations, controls, types].join('|').split('|').map(label => {
    const item = new CompletionItem(label);
    item.kind = CompletionItemKind.Keyword;
    return item;
});

const wastCompletionItemsMap = new Map<string, CompletionItem>();
wastCompletionItems.forEach(item => {
    wastCompletionItemsMap.set(item.label, item);
});

export class WastCompletionItemProvider implements CompletionItemProvider {
    constructor() {
        
    }
    
    public updateConfiguration(config: WorkspaceConfiguration): void {
        
    }
    
    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Promise<CompletionItem[]> {
        var range = document.getWordRangeAtPosition(position);
        var prefix = document.getText(range);
        return Promise.resolve(wastCompletionItems.filter(item => item.label.substr(0, prefix.length) === prefix));
    }
}