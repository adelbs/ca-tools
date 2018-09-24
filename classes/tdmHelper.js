const GenericHelper = require('./genericHelper');

const fs = require('fs');
const rp = require('request-promise');
const token = require('basic-auth-token');

class TDMHelper extends GenericHelper {

    async buildRequest(method, uri, body = null, formData = null) {
        let request = super.buildRequest(method,
            `http://${this.config.tdm.host}:${this.config.tdm.port}${uri}`, body, formData);

        if (!this.securityToken) {
            //Espera um tempo pois o javascript aparentemente é mais rapido que o TDM
            this.securityToken = await this.generateSecurityToken();
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        request.headers.Authorization = `Bearer ${this.securityToken}`;

        return request;
    }

    async generateSecurityToken() {
        let request = super.buildRequest('POST', `http://${this.config.tdm.host}:${this.config.tdm.port}/TestDataManager/user/login`);

        request.headers.Authorization = `Basic ${token(this.config.tdm.user, this.config.tdm.pwd)}`;
        const response = await rp(request).catch(err => console.log('Error generating security token'));
        return response.token;
    }

    async eval(expression) {
        const options = await this.buildRequest('POST',
            '/TDMGeneratorService/api/ca/v1/generators/validateExpression?columnId=',
            { expression: expression });

        const res = await rp(options).catch(err => console.log('Error evaluating the expression'));
        return res.response;
    }
}

module.exports = TDMHelper;