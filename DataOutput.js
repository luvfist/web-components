import { html, render } from './libs/lit-html/lit-html.js'

class DataOutput extends HTMLElement {

    constructor() {
        super();
        this.root = this.attachShadow({mode: 'open'})
    }

    connectedCallback() {
        window.addEventListener('fetchEvent', e => this.onDataLoaded(e));
    }

    onDataLoaded(e) {
        const template = html`
            <table>
                <thead>
                    <tr>
                        <th>last name</th>
                        <th>first name</th>
                        <th>age</th>
                    </tr>
                </thead>
                <tbody>
                    ${e.detail.map((item, i) => html`
                    <tr>
                        <td>${item.lastName}</td>
                        <td>${item.firstName}</td>
                        <td>${item.age}</td>
                    </tr>`)}
                </tbody>
            </table>
        `;

        render(template, this.root)
    }
}

customElements.define("data-output", DataOutput);