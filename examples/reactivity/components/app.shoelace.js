import { createComponent } from "../../../src/index.js";
const App = {
    name: 'ShoelaceTest',
    template() {
        /* html */
        return `<sl-card class="card-overview">
                    <img
                        slot="image"
                        src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
                    />

                    <strong>Mittens</strong><br />
                    This kitten is as cute as he is playful. Bring him home today!<br />
                    <small>6 weeks old</small>
                    <div><strong>Vote: {{score}}</strong></div>
                    <div slot="footer">
                        <sl-button variant="primary" pill>More Info</sl-button>
                        <sl-rating ref="rating"></sl-rating>
                    </div>
                </sl-card>`
    },
    data() {
        return {
           score: 0
        }
    },
    init() {
        this.refs.rating.addEventListener('sl-change', (ev) => {
            this.data.score.value = ev.target.value;
        })  
    },
    style() {
        /*css*/
        return `
        .card-overview {
            max-width: 300px;
        }

        .card-overview small {
            color: var(--sl-color-neutral-500);
        }

        .card-overview [slot='footer'] {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }`
    }
}

const app = createComponent(App);
app.appendTo(document.getElementById('app'));