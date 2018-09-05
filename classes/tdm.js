const TDMHelper = require('./tdmHelper');

class TDM {
    constructor(configFolder) {
        this.configFolder = configFolder;
        this.helper = new TDMHelper(configFolder);
    }


}

module.exports = TDM;