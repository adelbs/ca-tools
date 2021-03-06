# ca-tools
![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg) [![GitHub](https://img.shields.io/badge/npm-gray.svg?logo=npm)](https://www.npmjs.com/package/ca-tools) [![GitHub](https://img.shields.io/badge/GitHub-green.svg?logo=github)](https://github.com/adelbs/ca-tools)

Lib to integrate your Javascript code with CA Technologies tools

#### Install

`$ npm install ca-tools`


### Features

- Generate Rest Virtual Services (smarter alternative to traditional mocks)
- Generate Test Data (Data generated into databases, plain files or inside the Virtual Services)
- Everything integrated with your unit tests
- It is possible to evaluate TDM expressions
- PS.: The TDM lib is under construction


### Links (about the tools)

- About the SV: [CA Service Virtualization](https://www.ca.com/us/products/ca-service-virtualization.html)
- About the TDM: [CA Test Data Manager](https://www.ca.com/us/products/test-data-management.html)
- CodeSV (Java tool like this): [CA CodeSV](http://www.codesv.io/)


### Usage

#### SV Hello World

```javascript
const { sv } = require('ca-tools')('./ca-tools');

sv.run('SimpleService', '8001', [ { req: 'GET /hello', rsp: 'Hello World' } ]);
```

#### TDM Hello World

```javascript
const { tdm } = require('ca-tools')('./ca-tools');
const dp = tdm.dataPainter;

console.log(`Hello ${tdm.eval(dp.randLOV(dp.seedList.FirstName))}`);
```


### All features

#### Config File (ca-tools-config.json)

```json
{
    "sv": {
        "host": "localhost",
        "port": 1505,
        "user": "admin",
        "pwd": "admin",
        "vseName": "VSE"
    },
    "tdm": {
        "host": "localhost",
        "port": 8088,
        "user": "administrator",
        "pwd": "marmite",
        "defaultProject": {
            "projectId": 2365,
            "versionId": 2366
        }
    }
}
```

#### Javascript code

```javascript
//The './ca-tools' is the path to the config file
const { sv, tdm } = require('ca-tools')('./ca-tools');

//Array with any data (objects, strings, numbers, etc.)
let customers = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Martha' },
    { id: 3, name: 'Oliver' },
    { id: 4, name: 'Michael' }
];

//Or you can integrate it with TDM, using the evaluation method
const dp = tdm.dataPainter;
for (let i = 5; i < 100; i++)
    customers.push({ id: i, name: tdm.eval(dp.randLOV(dp.seedList.FirstName)) });

//Simple way - It will create and deploy a virtual service with these endpoints
sv.run('SimpleService', '8001', [
    { req: 'GET /customer', rsp: customers },
    { req: 'GET /customer/1', rsp: customers[0] },
    { req: 'GET /clienter/2', rsp: customers[2] },
    { req: 'GET /clienter/3', rsp: customers[3] }
]);

//Sophisticated way
//You can configure requests to any method (GET, POST, PUT, etc.)
//It's possible to add any header and body content
let rrPair = [
    {
        req: {
            GET: '/customer',
            'Content-Type': 'application/json',
            Connection: 'Keep-Alive',
            Host: 'devtest.ca.com'
            body: { some: 'body content' }
        },
        rsp: {
            'Content-Type': 'application/json',
            body: customers
        }
    }
];

customers.forEach(customer => rrPair.push({
    req: {
        GET: `/customer/${customer.id}`,
        'Content-Type': 'application/json',
        Connection: 'Keep-Alive',
        Host: 'devtest.ca.com'
        body: { some: 'body content' }
    },
    rsp: {
        'Content-Type': 'application/json',
        body: customer
    }
});

sv.run('AdvancedService', '8002', rrPair);

```
