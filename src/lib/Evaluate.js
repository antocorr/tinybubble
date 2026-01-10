import { SignalObject } from "./Signals.js";

const fnCache = new Map();

/**
 * Helper to evaluate JS expressions within the data context
 * @param {string} expression 
 * @param {object} scope 
 * @param {object} context 
 * @param {boolean} returnResult 
 * @param {boolean} unwrap 
 * @returns {any}
 */
export function evaluate(expression, scope, context = null, returnSignal = false) {
    try {
        // Optimization: Unique token extraction + Scope intersection
        // Regex matches identifiers: starts with letter/$/_, followed by letter/number/$/_
        const tokens = expression.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
        const uniqueTokens = new Set(tokens);
        
        // Identify which tokens are actually in scope
        const validKeys = [];
        for (const token of uniqueTokens) {
            if (token in scope) {
                validKeys.push(token);
            }
        }
        // Sort to ensure cache consistency (a,b vs b,a)
        validKeys.sort();
        
        // Cache Key: Expression + keys
        const cacheKey = expression + '::' + validKeys.join(',');
        
        let fn = fnCache.get(cacheKey);

        if (!fn) {
            const body = `return ${expression};`;
            fn = new Function(...validKeys, body);
            fnCache.set(cacheKey, fn);
        }

        // Map values from scope. 
        // IMPORTANT: We pass the SignalObject itself, not .value!
        // This allows signal.value usage in expressions, and implicit usage via valueOf
        // Extract values in the same order as keys
        const values = validKeys.map(k => {
            return (scope[k] instanceof SignalObject && !returnSignal) ? scope[k].value : scope[k];
        });
        
        // Evaluate
        const result = fn.apply(context, values);
        return result;
    } catch (e) {
        // Suppress ReferenceError (treat as undefined)
        if (!(e instanceof ReferenceError)) {
            console.warn(`Error evaluating expression "${expression}":`, e);
        }
        return undefined;
    }
}