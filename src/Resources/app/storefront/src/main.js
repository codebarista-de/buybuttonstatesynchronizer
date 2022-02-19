import BuyButtonStateSynchronizer from "./buybuttonstatesynchronizer/buybuttonstatesynchronizer.plugin";

const PluginManager = window.PluginManager;
PluginManager.register(
    "BuyButtonStateSynchronizer",
    BuyButtonStateSynchronizer,
    "[data-buy-btn-state-synchronizer]"
);
