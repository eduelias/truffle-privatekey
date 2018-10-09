const ProviderEngine = require("web3-provider-engine");
const FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
const WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
const ProviderSubprovider = require("web3-provider-engine/subproviders/provider.js");
const EthereumjsWallet = require('ethereumjs-wallet');
const Web3 = require("web3");
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js');

function PrivateKeyProvider(providerUrl) {
    this.engine = new ProviderEngine();

    this.engine.addProvider(new FiltersSubprovider());
    this.engine.addProvider(new NonceSubprovider());

    // HACK: `sendAsync` was removed
    if (!Web3.providers.HttpProvider.prototype.sendAsync) {
        Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
    }

    this.engine.addProvider(new ProviderSubprovider(new Web3.providers.HttpProvider(providerUrl)));
    this.engine.start();
}

PrivateKeyProvider.prototype.sendAsync = function() {
    if (arguments[0].params && arguments[0].params.length > 0 && arguments[0].params[0].fromPvk) {

        const privateKey = arguments[0].params[0].fromPvk;
        this.wallet = EthereumjsWallet.fromPrivateKey(new Buffer(privateKey, "hex"));
        this.address = "0x" + this.wallet.getAddress().toString("hex");

        this.engine.addProvider(new WalletSubprovider(this.wallet, {}));
        console.log('Arguments: ', arguments[0].params[0].fromPvk);
    }
    this.engine.sendAsync.apply(this.engine, arguments);
};

PrivateKeyProvider.prototype.send = function() {
    if (arguments[0].params && arguments[0].params.length > 0 && arguments[0].params[0].fromPvk) {

        const privateKey = arguments[0].params[0].fromPvk;
        this.wallet = EthereumjsWallet.fromPrivateKey(new Buffer(privateKey, "hex"));
        this.address = "0x" + this.wallet.getAddress().toString("hex");

        this.engine.addProvider(new WalletSubprovider(this.wallet, {}));
        console.log('Arguments: ', arguments[0].params[0].fromPvk);
    }
    return this.engine.send.apply(this.engine, arguments);
};


module.exports = PrivateKeyProvider;