const TDMHelper = require('./tdmHelper');
const functions = require('./tdmFunc');

class TDM {
    constructor(configFolder) {
        this.configFolder = configFolder;
        this.helper = new TDMHelper(configFolder);
        this.dataPainter = functions;
    }

    async eval(expression) {
        const result = await this.helper.eval(expression);
        return result;
    }

    async run(generatorName, generatorOptions = {
        tables: [
            {
                name: '',
                columns: [{}]
            }
        ]
    }) {

        this.helper.securityToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBZG1pbmlzdHJhdG9yIiwiYXVkIjoiQUxMIiwiUFdEX0hBU0hfQ0xBSU0iOiI4MzkzMTQyODMiLCJpc3MiOiJDQSBUZWNobm9sb2dpZXMiLCJVU0VSX0lEIjoiMSIsImV4cCI6MTUzNjYwNzM5MywiaWF0IjoxNTM2NTIwOTkzLCJBQ0NFU1NfUEVSTUlTU0lPTlMiOiJ7XCJBTExfUFJPSkVDVFNcIjpbMTAwXX0ifQ.PLdgwEMnlbkhNp25EdYxUhF89mb6IFRgC5KSu8-4bNY';




    }
}

module.exports = TDM;