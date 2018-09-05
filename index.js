const SV = require('./classes/sv');
const TDM = require('./classes/tdm');

function init(configFolder) {
    let sv = new SV(configFolder);
    let tdm = new TDM(configFolder);

    return {
        sv: sv,
        tdm: tdm
    };
}

module.exports = init;