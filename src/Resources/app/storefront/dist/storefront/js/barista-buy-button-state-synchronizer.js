"use strict";(self.webpackChunk=self.webpackChunk||[]).push([["barista-buy-button-state-synchronizer"],{6844:(t,n,e)=>{var o,i,u,s=e(6285);class r extends s.Z{static disableBuyButton(t,n=null,e=null){const o=document.querySelector(".btn-buy");null!=o?(o.setAttribute(`${t}-buy-button-disabled`,""),null!=e&&(window.buyButtonStateSynchronizerActions||(window.buyButtonStateSynchronizerActions={}),window.buyButtonStateSynchronizerActions[t]={label:n,callback:e})):console.warn("Cannot disable buy button: No element with class btn-buy")}static enableBuyButton(t){const n=document.querySelector(".btn-buy");null!=n?(n.removeAttribute(`${t}-buy-button-disabled`),window.buyButtonStateSynchronizerActions&&delete window.buyButtonStateSynchronizerActions[t]):console.warn("Cannot enable buy button: No element with class btn-buy")}init(){const t=document.getElementById("productDetailPageBuyProductForm");null!=t&&(this.buyButton=document.querySelector(".btn-buy"),null!=this.buyButton?(window.buyButtonStateSynchronizerActions||(window.buyButtonStateSynchronizerActions={}),this.isDisabled=this.isBuyButtonDisabled(),this.buyButtonObserver=new MutationObserver(this.buyButtonNodeChanged.bind(this)),this.startObservingBuyButtonAttributeChanges(),setTimeout(this.buyButtonNodeChanged.bind(this)),this.options.showDialogInsteadOfDisableButton&&(this.buyButton.addEventListener("click",this.onBuyButtonClicked.bind(this)),this.buyButton.disabled=!1),t.addEventListener("keydown",(t=>{if("Enter"==t.code||"NumpadEnter"==t.code)return this.onBuyButtonClicked(t)}))):console.warn("Cannot initialize: No element with class btn-buy"))}buyButtonNodeChanged(){this.isDisabled=this.isBuyButtonDisabled(),this.options.showDialogInsteadOfDisableButton||(this.stopObservingBuyButtonAttributeChanges(),this.buyButton.disabled=this.isDisabled,this.startObservingBuyButtonAttributeChanges())}startObservingBuyButtonAttributeChanges(){this.buyButtonObserver.observe(this.buyButton,{attributes:!0})}stopObservingBuyButtonAttributeChanges(){this.buyButtonObserver.disconnect()}isBuyButtonDisabled(){for(let t of this.buyButton.attributes)if(t.name.endsWith("-buy-button-disabled"))return!0;return!1}onBuyButtonClicked(t){if(!this.isDisabled)return!0;const n=document.querySelector("#buy-button-state-synchronizer-modal");if(n){const e=[];for(const t in window.buyButtonStateSynchronizerActions){const o=window.buyButtonStateSynchronizerActions[t];if(null!=o.label){const t=document.createElement("button");t.classList.add("btn","btn-primary"),t.innerHTML=o.label,t.onclick=t=>{n.close(),o.callback(t)},e.push(t)}}if(0===e.length)for(const n in window.buyButtonStateSynchronizerActions){const e=window.buyButtonStateSynchronizerActions[n];if(null!=e.callback)return e.callback(),t.preventDefault(),!1}const o=document.createElement("button");o.classList.add("btn","btn-secondary"),o.innerHTML=n.getAttribute("data-cancel-btn-label"),o.onclick=()=>n.close(),e.push(o),document.getElementById("buy-button-state-synchronizer-modal-actions").replaceChildren(...e),n.showModal()}return t.preventDefault(),!1}}o=r,u={showDialogInsteadOfDisableButton:!1},(i=function(t){var n=function(t,n){if("object"!=typeof t||null===t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var o=e.call(t,n||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(t)}(t,"string");return"symbol"==typeof n?n:String(n)}(i="options"))in o?Object.defineProperty(o,i,{value:u,enumerable:!0,configurable:!0,writable:!0}):o[i]=u;window.PluginManager.register("BuyButtonStateSynchronizer",r,"[data-buy-button-state-synchronizer]")}},t=>{t.O(0,["vendor-node","vendor-shared"],(()=>{return n=6844,t(t.s=n);var n}));t.O()}]);