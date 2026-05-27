const initialState = {
    items: [
        { id: 1, name: 'Margherita',          price: 7.50,  emoji: '🍅', desc: 'Tomato sauce, fior di latte, fresh basil' },
        { id: 2, name: 'Diavola',             price: 9.50,  emoji: '🌶️', desc: 'Tomato sauce, fior di latte, spicy salami' },
        { id: 3, name: 'Quattro Formaggi',    price: 10.50, emoji: '🧀', desc: 'Fior di latte, gorgonzola, provolone, parmesan' },
        { id: 4, name: 'Capricciosa',         price: 10.50, emoji: '🍄', desc: 'Tomato sauce, ham, mushrooms, artichokes, olives' },
        { id: 5, name: 'Napoli',              price: 9.00,  emoji: '🐟', desc: 'Tomato sauce, anchovies, capers, oregano' },
        { id: 6, name: 'Bufalina',            price: 12.00, emoji: '🌿', desc: 'Tomato sauce, buffalo mozzarella DOP, basil' },
        { id: 7, name: 'Prosciutto e Funghi', price: 9.50,  emoji: '🍖', desc: 'Tomato sauce, ham, champignon mushrooms' },
        { id: 8, name: 'Vegetariana',         price: 9.00,  emoji: '🥦', desc: 'Tomato sauce, grilled vegetables, olives, oregano' },
    ],
};

export default function menuReducer(state = initialState, action) {
    switch (action.type) {
        default: return state;
    }
}