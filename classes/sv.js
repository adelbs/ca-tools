const fs = require('fs');
const SvHelper = require('./svHelper');

class SV {

    constructor(configFolder) {
        this.configFolder = configFolder;
        this.helper = new SvHelper(configFolder);
    }

    async run(svName, vsPort, rrPair = []) {

        let fileCount = 1;
        let cleanRRFiles = false;

        //Se vierem parametros de RR, cria os arquivos antes
        rrPair.forEach(rr => {
            let fileContent = '';

            //Arquivos req
            if (typeof (rr.req) === 'object') {
                for (let key in rr.req) {
                    if (';GET;POST;PUT;DELETE;'.indexOf(`;${key};`) > -1)
                        fileContent += `${key} ${rr.req[key]} HTTP/1.1\n`;
                    else if (key === 'body')
                        fileContent += `\n${JSON.stringify(rr.req[key])}\n`;
                    else {
                        fileContent += `${key}: ${rr.req[key]}\n`;
                    }
                }
            }
            else {
                fileContent += `${rr.req} HTTP/1.1\n`;
            }

            fs.writeFileSync(`${this.configFolder}/${svName}-${fileCount}-req.txt`, fileContent);

            //Arquivos rsp
            fileContent = 'HTTP/1.1 200\n';
            if (rr.rsp.body) {
                for (let key in rr.rsp) {
                    if (key === 'body')
                        fileContent += `\n${JSON.stringify(rr.rsp[key])}\n`;
                    else {
                        fileContent += `${key}: ${rr.rsp[key]}\n`;
                    }
                }
            }
            else {
                fileContent += `\n${JSON.stringify(rr.rsp)}\n`;
            }

            fs.writeFileSync(`${this.configFolder}/${svName}-${fileCount}-rsp.txt`, fileContent);

            fileCount++;
            cleanRRFiles = true;
        });

        //Preparando as entidades do SV que vão processar a criação do serviço
        const vseId = await this.helper.getVseId();
        const builderSessionId = await this.helper.createBuilderSession(vseId, svName);
        const transportProtocolId = await this.helper.createTransportProtocol(vseId, builderSessionId, vsPort);
        const dataProtocolId = await this.helper.addDataProtocol(vseId, builderSessionId, transportProtocolId, true, 'JSONDPH');
        const transactionBundleId = await this.helper.createTransactionBundle(vseId);
        const inputContainerId = await this.helper.createInputContainer(vseId, transactionBundleId);

        //Fazendo upload de todos os arquivos RR Pair
        fileCount = 1;
        while (fs.existsSync(`${this.configFolder}/${svName}-${fileCount}-req.txt`)) {
            await this.helper.uploadRRPair(vseId, transactionBundleId, inputContainerId, `${svName}-${fileCount}`);
            fileCount++;
        }

        //Processando os arquivos. Espera até concluir.
        let status;
        let attempt;

        attempt = 0;
        const processorId = await this.helper.processInputProcessor(vseId, transactionBundleId, inputContainerId);
        status = await this.helper.inputProcessorStatus(vseId, transactionBundleId, processorId);
        while (status !== 'COMPLETED' && attempt < 20) {
            await setTimeout(() => { }, 250);
            status = await this.helper.inputProcessorStatus(vseId, transactionBundleId, processorId);
            attempt++;
        }

        attempt = 0;
        const bundleProcessorId = await this.helper.createBundleProcessor(vseId, builderSessionId, transactionBundleId);
        status = await this.helper.bundleProcessorStatus(vseId, builderSessionId, transactionBundleId, bundleProcessorId);
        while (status !== 'FINISHED' && attempt < 20) {
            await setTimeout(() => { }, 250);
            status = await this.helper.bundleProcessorStatus(vseId, builderSessionId, transactionBundleId, bundleProcessorId);
            attempt++;
        }

        //Download do Mar do serviço gerado
        await this.helper.downloadVS(vseId, builderSessionId, svName);

        //Limpando artefatos de criação
        await this.helper.deleteInputProcessor(vseId, transactionBundleId, processorId);
        await this.helper.deleteBundleProcessor(vseId, bundleProcessorId);
        await this.helper.deleteBuilderSession(vseId, builderSessionId);

        //Excluindo o serviço caso já exista um com o mesmo nome
        await this.helper.deleteVS(svName);

        //Fazendo deploy do serviço gerado
        await this.helper.deployMar(svName);

        //Excluindo o Mar baixado e os arquivos RR pair gerados
        fs.unlinkSync(`${this.configFolder}/${svName}.mar`);
        if (cleanRRFiles) {
            fileCount = 1;
            while (fs.existsSync(`${this.configFolder}/${svName}-${fileCount}-req.txt`)) {
                fs.unlinkSync(`${this.configFolder}/${svName}-${fileCount}-req.txt`);
                fs.unlinkSync(`${this.configFolder}/${svName}-${fileCount}-rsp.txt`);
                fileCount++;
            }
        }

        console.log('Service created!');
    }
}

module.exports = SV;