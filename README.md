# BuyButtonStateSynchronizer

If multiple Shopware plugins modify the disabled state of the buy-button (btn-buy), the plugin that modifies the state last will win.
BuyButtonStateSynchronizer allows multiple plugins to agree with each other on the disabled state of the buy button.

Instead of modifying the disabled state of the buy-button like this:

```javascript
export default class MyPlugin extends Plugin {
  init() {
      ...
      this.buyBtn = document.getElementsByClassName("btn-buy").item(0);
      ...
  }

  setBuyButtonEnabled(enabled) {
      this.buyBtn.disabled = !enabled;
  }
}
```

a compatible plugin should modify the buy-button like this:

```javascript
export default class MyPlugin extends Plugin {
  init() {
      ...
      this.buyBtn = document.getElementsByClassName("btn-buy").item(0);
      ...
  }

  setBuyButtonEnabled(enabled) {
    if ("BuyButtonStateSynchronizer" in window.PluginManager.getPluginList()) {
      const attributeName = "my-plugin-buy-button-disabled"; // Globally unique attribute name
      if (enabled) {
        this.buyBtn.removeAttribute(attributeName);
      } else {
        this.buyBtn.setAttribute(attributeName, "");
      }
    } else {
      this.buyBtn.disabled = !enabled; // Fallback if BuyButtonStateSynchronizer plugin is not installed
    }
  }
}
```

BuyButtonStateSynchronizer listens to attribute changes of the buy-button and evaluates all
attributes whose name ends with `-buy-button-disabled` to determine the disabled state of the buy-button.

If a plugin wants to disable the buy-button, it sets an attribute on it that starts with a unique name
and ends with `-buy-button-disabled`. The plugin removes the attribute if it intends to enable the buy-button.
