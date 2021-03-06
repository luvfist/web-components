import { html, render } from './libs/lit-html/lit-html.js'
import { say, loadData } from './RandomService.js'
import './DataOutput.js'
import './Button.js'

class WJax extends HTMLElement {

    constructor() {
        super();
        this.root = this.attachShadow({mode: 'open'})
    }

    connectedCallback() {
        const template = html`
            <style>
                h2 {
                    background-color: lime;
                }
            </style>

            <h2>
                W-JAX rocks ${this.getAttribute('message')}
                ${say()}
            </h2>
            
            <ui5-button @click=${_ => this.onClick()}>click me</ui5-button>
        `;

        render(template, this.root);
    }

    onClick() {
        loadData();
    }
}

customElements.define("w-jax", WJax);
