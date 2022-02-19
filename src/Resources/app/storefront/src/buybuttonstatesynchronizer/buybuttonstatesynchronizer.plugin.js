import Plugin from "src/plugin-system/plugin.class";

export default class BuyButtonStateSynchronizer extends Plugin {
    init() {
        this.buyButtonObserver = new MutationObserver(() =>
            self.buyButtonNodeChanged()
        );
        // We have to make sure that our initialization function
        // runs after all other plugins have been initialized.
        // Since there is no concept for this like a plugin priority in shopware
        // we have to exploit the single-threaded nature of javascript.
        // While the initialization logic is executed we can be sure no other piece
        // of javascript code will run. If register a timeout function with a
        // zero-timeout then the function will be executed after the initialization logic
        // is complete.
        const self = this;
        setTimeout(() => self.buyButtonNodeChanged());
    }

    buyButtonNodeChanged() {
        // stop observing attribute changes...
        this.stopObservingBuyButtonAttributeChanges();
        // ...otherwise this line would cause an infinite loop...
        this.el.disabled = this.isBuyButtonDisabled();
        // ...start observing again
        this.startObservingBuyButtonAttributeChanges();
    }

    startObservingBuyButtonAttributeChanges() {
        // this.el is the element on which this plugin was initialized -> the buy button
        this.buyButtonObserver.observe(this.el, { attributes: true });
    }

    stopObservingBuyButtonAttributeChanges() {
        this.buyButtonObserver.disconnect();
    }

    isBuyButtonDisabled() {
        for (let attribute of this.el.attributes) {
            if (attribute.name.endsWith("-buy-button-disabled")) {
                return true;
            }
        }
        return false;
    }
}
