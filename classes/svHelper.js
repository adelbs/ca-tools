const fs = require('fs');
const rp = require('request-promise');
const token = require('basic-auth-token');

class SVHelper {

    constructor(configFolder) {
        if (configFolder) {
            this.configFolder = configFolder;
            const config = JSON.parse(fs.readFileSync(`${configFolder}/ca-tools-config.json`, 'utf8'));
            this.config = config.sv;
        }
    }

    buildRequest(method, uri, body = null, formData = null) {
        let request = {
            method: method,
            uri: `http://${this.config.host}:${this.config.port}/lisa-virtualize-invoke/api/v2/vses${uri}`,
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

        request.headers.Authorization = `Basic ${token('admin', 'admin')}`;

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

    async getResponseObjID(options) {
        let id = '';

        try {
            const obj = await rp(options);
            id = obj.id;
        }
        catch (error) {
            console.error(`It was not possible to get the response ID from request.\n${options}`, error);
        }

        return id;
    }

    async getVseId() {
        const request = this.buildRequest('GET', '/');
        let vseId = '';

        try {
            const vsesRsp = await rp(request);
            const vses = vsesRsp._embedded.vses;

            for (let i = 0; i < vses.length; i++) {
                if (vses[i].name === this.config.vseName) {
                    vseId = vses[i]._links.self.href;
                    vseId = vseId.replace(request.uri, '');
                }
            }
        }
        catch (error) {
            console.error('It was not possible to get the VSEs.', error);
        }

        return vseId;
    }

    async createBuilderSession(vseId, serviceName) {
        const request = this.buildRequest('POST', `/${vseId}/vsBuilderSessions`, { name: serviceName });
        return await this.getResponseObjID(request);
    }

    async createTransportProtocol(vseId, builderSessionId, vsPort) {
        const request = this.buildRequest('POST',
            `/${vseId}/vsBuilderSessions/${builderSessionId}/transportProtocols`,
            {
                typeId: 'HTTP',
                basePath: '/',
                useGateway: true,
                hostHeaderPassThrough: false,
                recordingEndpoint: {
                    host: 'localhost',
                    port: vsPort
                },
                targetEndpoint: {
                    host: 'localhost',
                    port: '8080'
                }
            });

        return await this.getResponseObjID(request);
    }

    async addDataProtocol(vseId, builderSessionId, transportProtocolId, forRequest, typeId) {
        const request = this.buildRequest('POST',
            `/${vseId}/vsBuilderSessions/${builderSessionId}/transportProtocols/${transportProtocolId}/dataProtocols`,
            {
                forRequest: forRequest,
                typeId: typeId
            });

        return await this.getResponseObjID(request);
    }

    async createTransactionBundle(vseId) {
        const request = this.buildRequest('POST', `/${vseId}/bundles`, {});
        return await this.getResponseObjID(request);
    }

    async createInputContainer(vseId, transactionBundleId) {
        const request = this.buildRequest('POST', `/${vseId}/bundles/${transactionBundleId}/inputContainers`, {});
        return await this.getResponseObjID(request);
    }

    async uploadRRPair(vseId, transactionBundleId, inputContainerId, fileActionName) {

        // let files = fs.readdirSync(this.configFolder);
        // files.forEach(file => {
        //     if (file.startsWith(fileActionName))
        //         console.log(file);
        // });

        const request = this.buildRequest('POST',
            `/${vseId}/bundles/${transactionBundleId}/inputContainers/${inputContainerId}/contents`, null,
            {
                file1: this.buildReqFile(`${fileActionName}-req.txt`),
                file2: this.buildReqFile(`${fileActionName}-rsp.txt`)
            });

        await rp(request);
    }

    async processInputProcessor(vseId, transactionBundleId, inputContainerId) {
        const request = this.buildRequest('POST', `/${vseId}/bundles/${transactionBundleId}/inputProcessors`,
            {
                container: inputContainerId
            });
        return await this.getResponseObjID(request);
    }

    async inputProcessorStatus(vseId, transactionBundleId, inputProcessorId) {
        const request = this.buildRequest('GET',
            `/${vseId}/bundles/${transactionBundleId}/inputProcessors/${inputProcessorId}`);

        const obj = await rp(request);
        return obj.status;
    }

    async deleteInputProcessor(vseId, transactionBundleId, inputProcessorId) {
        const request = this.buildRequest('DELETE',
            `/${vseId}/bundles/${transactionBundleId}/inputProcessors/${inputProcessorId}`);

        rp(request).catch(error => console.log('error ' + error));
    }

    async createBundleProcessor(vseId, builderSessionId, transactionBundleId) {
        const request = this.buildRequest('POST', `/${vseId}/bundleProcessors`,
            {
                sessionId: builderSessionId,
                bundleId: transactionBundleId
            });
        return await this.getResponseObjID(request);
    }

    async bundleProcessorStatus(vseId, builderSessionId, transactionBundleId, bundleProcessorId) {
        const request = this.buildRequest('GET', `/${vseId}/bundleProcessors/${bundleProcessorId}`,
            {
                sessionId: builderSessionId,
                bundleId: transactionBundleId
            });

        const obj = await rp(request);
        return obj.status;
    }

    async deleteBundleProcessor(vseId, bundleProcessorId) {
        const request = this.buildRequest('DELETE', `/${vseId}/bundleProcessors/${bundleProcessorId}`);

        rp(request).catch(error => console.log('error ' + error));
    }

    async downloadVS(vseId, builderSessionId, serviceName) {
        const request = this.buildRequest('GET', `/${vseId}/vsBuilderSessions/${builderSessionId}`);
        request.headers.Accept = 'application/zip';
        request.encoding = null;
     
        const res = await rp(request);
        const buffer = Buffer.from(res);
        fs.writeFileSync(`${this.configFolder}/${serviceName}.mar`, buffer);
    }

    async deleteBuilderSession(vseId, builderSessionId) {
        const request = this.buildRequest('DELETE', `/${vseId}/vsBuilderSessions/${builderSessionId}`);
        
        rp(request).catch(error => console.log('error ' + error));
    }

    async deployMar(serviceName) {
        const request = this.buildRequest('POST', '/', null,
            {
                file: this.buildReqFile(`${serviceName}.mar`),
            });

        request.uri = `http://${this.config.host}:${this.config.port}/api/Dcm/VSEs/${this.config.vseName}/actions/deployMar`,
        request.headers.Accept = '*/*';

        await rp(request);
    }

    async deleteVS(serviceName) {
        const request = this.buildRequest('DELETE', '/', null);
        request.uri = `http://${this.config.host}:${this.config.port}/api/Dcm/VSEs/${this.config.vseName}/${serviceName}`,
        request.headers.Accept = '*/*';

        await rp(request).catch(err => {});
    }
}

module.exports = SVHelper;