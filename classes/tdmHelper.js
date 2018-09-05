const fs = require('fs');

class TDMHelper {
    constructor(configFolder) {
        if (configFolder) {
            this.configFolder = configFolder;
            const config = JSON.parse(fs.readFileSync(`${configFolder}/ca-tools-config.json`, 'utf8'));
            this.config = config.tdm;
        }
    }

}

module.exports = TDMHelper;