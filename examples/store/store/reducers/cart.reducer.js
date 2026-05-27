const PROMO_CODES = { PIZZA20: 20, BASIL10: 10 };

const initialState = {
    items: [],     // { id, name, price, qty }
    promoCode: null,
    discount: 0,   // percentage applied
};

export default function cartReducer(state = initialState, action) {
    switch (action.type) {

        case 'CART_ADD': {
            const existing = state.items.find(i => i.id === action.payload.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map(i =>
                        i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
                    ),
                };
            }
            return {
                ...state,
                items: [...state.items, { ...action.payload, qty: 1 }],
            };
        }

        case 'CART_REMOVE':
            return {
                ...state,
                items: state.items.filter(i => i.id !== action.payload),
            };

        case 'CART_UPDATE_QTY': {
            const { id, qty } = action.payload;
            if (qty <= 0) {
                return { ...state, items: state.items.filter(i => i.id !== id) };
            }
            return {
                ...state,
                items: state.items.map(i => i.id === id ? { ...i, qty } : i),
            };
        }

        case 'CART_CLEAR':
            return { ...state, items: [], promoCode: null, discount: 0 };

        case 'CART_APPLY_PROMO': {
            const code = String(action.payload).toUpperCase();
            const discount = PROMO_CODES[code] ?? 0;
            return {
                ...state,
                promoCode: discount > 0 ? code : state.promoCode,
                discount:  discount > 0 ? discount : state.discount,
            };
        }

        default: return state;
    }
}