const fs = require('fs');
const rp = require('request-promise');

class GenericHelper {

    constructor(configFolder) {
        if (configFolder) {
            this.configFolder = configFolder;
            const config = JSON.parse(fs.readFileSync(`${configFolder}/ca-tools-config.json`, 'utf8'));
            this.config = config;
        }
    }

    buildRequest(method, uri, body = null, formData = null) {
        let request = {
            method: method,
            uri: uri,
            json: true
        };

        if (body) request.body = body;

        if (formData) {
            request.headers = {
                'Content-Type': 'multipart/form-data',
                'Cache-Control': 'no-cache'
            };
            request.formData = formData;
        }
        else {
            request.headers = {
                'Cache-Control': 'no-cache'
            };
        }

        return request;
    }

    buildReqFile(fileName) {
        return {
            value: fs.createReadStream(`${this.configFolder}/${fileName}`),
            options: {
                fileName: fileName,
                contentType: 'text/plain'
            }
        };
    }

    async getResponseObjID(requestOptions) {
        let id = '';

        try {
            const obj = await rp(requestOptions);
            id = obj.id;
        }
        catch (error) {
            console.error(`It was not possible to get the response ID from request.\n${requestOptions}`, error);
        }

        return id;
    }

}

module.exports = GenericHelper;