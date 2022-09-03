import Plugin from "src/plugin-system/plugin.class";

export default class BuyButtonStateSynchronizer extends Plugin {
  static options = {
    showDialogInsteadOfDisableButton: null,
  };

  static disableBuyButton(id, actionLabel = null, actionCallback = null) {
    const buyButton = document.getElementsByClassName("btn-buy").item(0);
    if (buyButton == null) {
      console.warn("Cannot disable buy button: No element with class btn-buy");
      return;
    }

    buyButton.setAttribute(`${id}-buy-button-disabled`, "");

    if (actionLabel == null || actionCallback == null) {
      return;
    }
    if (!window.buyButtonStateSynchronizerModalActions) {
      window.buyButtonStateSynchronizerModalActions = {};
    }
    window.buyButtonStateSynchronizerModalActions[id] = {
      label: actionLabel,
      callback: actionCallback,
    };
  }

  static enableBuyButton(id) {
    const buyButton = document.getElementsByClassName("btn-buy").item(0);
    if (buyButton == null) {
      console.warn("Cannot enable buy button: No element with class btn-buy");
      return;
    }

    buyButton.removeAttribute(`${id}-buy-button-disabled`);
    if (window.buyButtonStateSynchronizerModalActions) {
      delete window.buyButtonStateSynchronizerModalActions[id];
    }
  }

  init() {
    if (!window.buyButtonStateSynchronizerModalActions) {
      window.buyButtonStateSynchronizerModalActions = {};
    }
    this.isDisabled = this.isBuyButtonDisabled();
    this.buyButtonObserver = new MutationObserver(
      this.buyButtonNodeChanged.bind(this)
    );
    this.startObservingBuyButtonAttributeChanges();
    // We have to make sure that our initialization function
    // runs after all other plugins have been initialized.
    // Since there is no concept like a plugin priority in shopware
    // we have to exploit the single-threaded nature of javascript.
    // While the initialization logic is executed no other piece
    // of javascript code can run. We register a function with a
    // zero-timeout so that the function will be executed after
    // the initialization logic is complete.
    setTimeout(this.buyButtonNodeChanged.bind(this));

    if (this.options.showDialogInsteadOfDisableButton) {
      this.el.addEventListener("click", this.onBuyButtonClicked.bind(this));
      this.el.disabled = false;
    }
  }

  buyButtonNodeChanged() {
    this.isDisabled = this.isBuyButtonDisabled();
    if (!this.options.showDialogInsteadOfDisableButton) {
      // stop observing attribute changes...
      this.stopObservingBuyButtonAttributeChanges();
      // ...otherwise this line would cause an infinite loop...
      this.el.disabled = this.isDisabled;
      // ...start observing again
      this.startObservingBuyButtonAttributeChanges();
    }
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

  onBuyButtonClicked(e) {
    if (!this.isDisabled) {
      return true;
    }

    // Create a button for each registered action
    const actionButtons = [];
    for (const actionID in window.buyButtonStateSynchronizerModalActions) {
      const action = window.buyButtonStateSynchronizerModalActions[actionID];
      const actionButton = document.createElement("button");
      actionButton.classList.add("btn", "btn-primary");
      actionButton.innerText = action.label;
      actionButton.onclick = (e) => {
        $("#buy-button-state-synchronizer-modal").modal("hide");
        action.callback(e);
      };
      actionButtons.push(actionButton);
    }
    // Preserve the cancel button
    actionButtons.push(
      document.getElementById("buy-button-state-synchronizer-modal-cancel-btn")
    );
    // Replace all buttons
    document
      .getElementById("buy-button-state-synchronizer-modal-actions")
      .replaceChildren(...actionButtons);

    $("#buy-button-state-synchronizer-modal").modal("show");
    e.preventDefault();
    return false;
  }
}
