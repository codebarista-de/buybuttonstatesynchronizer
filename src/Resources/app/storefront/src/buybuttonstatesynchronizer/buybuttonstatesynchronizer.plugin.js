import Plugin from "src/plugin-system/plugin.class";

export default class BuyButtonStateSynchronizer extends Plugin {
  static options = {
    showDialogInsteadOfDisableButton: null,
  };

  /**
   * The callback that might be invoked when option `showDialogInsteadOfDisableButton` is set
   * and the user presses the buy button while there is at least one disable vote.
   * For details see the documentation of `disableBuyButton`.
   *
   * The callback can be used to explain the user why the buy button is disabled and which
   * steps are necessary to enable it. If the callback is used together with an `actionLabel`
   * the callback should invoke the action that is described by the label.
   *
   * E.g. if the user has to upload a file before he can press the buy button you can
   * call `disableBuyButton` with `actionLabel="Upload file"` and an `actionCallback`
   * that opens a file dialog, uploads the selected file and finally calls `enableBuyButton`
   * with the same ID used in the disable call.
   * When the user presses the buy button before uploading the required file,
   * a dialog with a button "Upload file" will be shown.
   *
   * If the user has to fill some form field before he can press the buy button you can call
   * `disableBuyButton` without an `actionLabel` but an `actionCallback` that scrolls
   * the form field into view and highlights it.
   * When the user presses the buy button before filling out the form field the action
   * will be executed unless there are other votes that take precedence.
   *
   * @callback actionCallback
   */

  /** Casts a vote to disable the buy button.
   *
   *  As long as there is atleast one vote to disable the the buy button the buy action will be blocked.
   *  To withdraw the disable vote `enableBuyButton` must be called with the same ID.
   *
   *  @param {string} id - globally unique ID that identifies the vote.
   *  @param {string} [actionLabel] - optional label for a button in the dialog that is shown when the user presses the
   *                                  buy button while it is disabled. This is only relevant if option `showDialogInsteadOfDisableButton`
   *                                  is set. If no label is given but an `actionCallback` is defined, no button is rendered in the
   *                                  action dialog for this vote. The `actionCallback` will be executed if there is no vote left
   *                                  with an `actionLabel`. In that case, no dialog will be shown and if there are multiple votes with
   *                                  an `actionCallback` but no `actionLabel` only the callback of the vote that was cast first is executed.
   *  @param {actionCallback} actionCallback - optional callback that will be executed when the user presses the corresponding button in
   *                                           the action dialog or, if no `actionLabel` is defined and no other vote that takes precedence
   *                                           is left.
   */
  static disableBuyButton(id, actionLabel = null, actionCallback = null) {
    const buyButton = document.getElementsByClassName("btn-buy").item(0);
    if (buyButton == null) {
      console.warn("Cannot disable buy button: No element with class btn-buy");
      return;
    }

    buyButton.setAttribute(`${id}-buy-button-disabled`, "");

    if (actionCallback == null) {
      return;
    }
    if (!window.buyButtonStateSynchronizerActions) {
      window.buyButtonStateSynchronizerActions = {};
    }
    window.buyButtonStateSynchronizerActions[id] = {
      label: actionLabel,
      callback: actionCallback,
    };
  }

  /**
   * Withdraws the disable vote with the given identifier.
   *
   * If no disable vote is left after this call, the buy button will be enabled.
   *
   * @param {string} id The ID of the vote that is withdrawn.
   */
  static enableBuyButton(id) {
    const buyButton = document.getElementsByClassName("btn-buy").item(0);
    if (buyButton == null) {
      console.warn("Cannot enable buy button: No element with class btn-buy");
      return;
    }

    buyButton.removeAttribute(`${id}-buy-button-disabled`);
    if (window.buyButtonStateSynchronizerActions) {
      delete window.buyButtonStateSynchronizerActions[id];
    }
  }

  init() {
    if (!window.buyButtonStateSynchronizerActions) {
      window.buyButtonStateSynchronizerActions = {};
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

    // Prevent form submit by pressing enter if buy button is disabled
    const buyForm = document.getElementById("productDetailPageBuyProductForm");
    buyForm.addEventListener("keydown", (event) => {
      if (event.code == "Enter" || event.code == "NumpadEnter") {
        return this.onBuyButtonClicked(event);
      }
    })
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
    for (const actionID in window.buyButtonStateSynchronizerActions) {
      const action = window.buyButtonStateSynchronizerActions[actionID];
      if (action.label != null) {
        const actionButton = document.createElement("button");
        actionButton.classList.add("btn", "btn-primary");
        actionButton.innerText = action.label;
        actionButton.onclick = (e) => {
          $("#buy-button-state-synchronizer-modal").modal("hide");
          action.callback(e);
        };
        actionButtons.push(actionButton);
      }
    }
    if (actionButtons.length > 0) {
      // Preserve the cancel button
      actionButtons.push(
        document.getElementById(
          "buy-button-state-synchronizer-modal-cancel-btn"
        )
      );
      // Replace all buttons
      document
        .getElementById("buy-button-state-synchronizer-modal-actions")
        .replaceChildren(...actionButtons);
    } else {
      // If there is no labled action for which a button in the dialog
      // can be shown we search for an action that we can invole
      for (const actionID in window.buyButtonStateSynchronizerActions) {
        const action = window.buyButtonStateSynchronizerActions[actionID];
        if (action.callback != null) {
          action.callback();
          e.preventDefault();
          return false;
        }
      }
    }

    $("#buy-button-state-synchronizer-modal").modal("show");
    e.preventDefault();
    return false;
  }
}
