import { SignalObject } from "./Signals.js";

const fnCache = new Map();
const tokenCache = new Map();

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
        // Optimization: Unique token extraction + Scope intersection.
        // Regex matches identifiers: starts with letter/$/_, followed by letter/number/$/_.
        // Tokens are per-expression constants — extract and sort them once.
        let tokens = tokenCache.get(expression);
        if (!tokens) {
            tokens = [...new Set(expression.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [])].sort();
            tokenCache.set(expression, tokens);
        }

        // Identify which tokens are actually in scope
        // (tokens are pre-sorted, so validKeys stays sorted → stable cache key)
        const validKeys = [];
        const values = [];
        for (const token of tokens) {
            if (token in scope) {
                validKeys.push(token);
                const value = scope[token];
                values.push(value instanceof SignalObject && !returnSignal ? value.value : value);
            }
        }

        // Cache Key: Expression + keys
        const cacheKey = expression + '::' + validKeys.join(',');
        
        let fn = fnCache.get(cacheKey);

        if (!fn) {
            const body = `return ${expression};`;
            fn = new Function(...validKeys, body);
            fnCache.set(cacheKey, fn);
        }

        return fn.apply(context, values);
    } catch (e) {
        // Suppress ReferenceError (treat as undefined)
        if (!(e instanceof ReferenceError)) {
            console.warn(`Error evaluating expression "${expression}":`, e);
        }
        return undefined;
    }
}