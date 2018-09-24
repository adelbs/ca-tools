
function f(fName, params = []) {
    let ret = `@${fName}(`;
    params.forEach(param => {
        if (param) {
            if (Array.isArray(param)) {
                let arrValues = '';
                param.forEach(arrVal => arrValues += `${arrVal},`);
                ret += `[${arrValues.substr(0, arrValues.length - 1)}],`;
            }
            else {
                ret += `${param},`;
            }
        }
    });

    return (params.length > 0 ? `${ret.substr(0, ret.length - 1)})@` : `${ret})@`);
}

const functions = {
    //Numeric
    abs: (number) => { return f('abs', [number]); },
    add: (number1, number2) => { return f('add', [number1, number2]); },
    addCheckSum: (number, method) => { return f('addchecksum', [number, method]); },
    addLuhn: (number) => { return f('addluhn', [number]); },
    addMod97: (number) => { return f('addmod97', [number]); },
    addRand: (number, min, max) => { return f('addrand', [number, min, max]); },
    addVerHoef: (number) => { return f('addverhoef', [number]); },
    char: (number) => { return f('char', [number]); },
    convBase: (number, base, digits = null) => { return f('convbase', [number, base, digits]); },
    exp: (number, power) => { return f('exp', [number, power]); },
    hash: (number, maxval, seed = null) => { return f('hash', [number, maxval, seed]); },
    jDate: (date, precision = null) => { return f('jdate', [date, precision]); },
    long: (number) => { return f('long', [number]); },
    longTen: (number) => { return f('longten', [number]); },
    luhn: (number) => { return f('luhn', [number]); },
    max: (number = []) => { return f('max', [number]); },
    min: (number = []) => { return f('min', [number]); },
    mod: (number1, number2) => { return f('mod', [number1, number2]); },
    multiply: (number1, number2) => { return f('multiply', [number1, number2]); },
    nextVal: (sequence, startval = null) => { return f('nextval', [sequence, startval]); },

    //Date Time
    addDays: (date, days) => { return f('adddays', [date, days]); },
    addMicrosecs: (timestamp, microsecs) => { return f('addmicrosecs', [timestamp, microsecs]); },
    addMillisecs: (timestamp, millisecs) => { return f('addmillisecs', [timestamp, millisecs]); },
    addMonths: (date, months) => { return f('addmonths', [date, months]); },
    addRandDays: (date, min, max) => { return f('addranddays', [date, min, max]); },
    addSeconds: (datetime, seconds) => { return f('addseconds', [datetime, seconds]); },
    addYears: (date, years) => { return f('addyears', [date, years]); },
    date: (string, format = null) => { return f('date', [string, format]); },
    dateTime: (string, format = null) => { return f('datetime', [string, format]); },
    randDate: (min, max) => { return f('randdate', [min, max]); },
    randTime: (min, max) => { return f('randtime', [min, max]); },

    //Control
    and: (boolean = []) => { return f('and', [boolean]); },
    if: (boolean, trueExp, falseExp) => { return f('if', [boolean, trueExp, falseExp]); },
    ifNull: (exp, nullExp) => { return f('ifnull', [exp, nullExp]); },
    not: (boolean) => { return f('not', [boolean]); },
    or: (boolean = []) => { return f('or', [boolean]); },
    repeat: (value, occurs, separator) => { return f('repeat', [value, occurs, separator]); },

    //String
    alphanum: (string) => { return f('alphanum', [string]); },
    asc: (string) => { return f('asc', [string]); },
    atSign: () => { return f('atSign'); },
    caret: () => { return f('caret'); },
    collapse: (string) => { return f('collapse', [string]); },

    //Aggregate
    count: (value = []) => { return f('count', [value]); },

    //Code
    guid: (collapse = null) => { return f('guid', [collapse]); },
    iban: (isoCountryCode = null, bankCode = null, account = null) => { return f('iban', [isoCountryCode, bankCode, account]); },

    //List of values
    list: (list = []) => { return f('list', [list]); },
    sqlList: (connection, sql) => { return f('sqllist', [connection, sql]); },
    randLOV: (list, column = null, percNull = '0', invalidAll = null) => { return f('randlov', [percNull, list, column, invalidAll]); },
    seqLOV: (list, column = null, percNull = '0', invalidAll = null) => { return f('seqlov', [percNull, list, column, invalidAll]); },

    //SQL
    execSql: (connection, sql) => { return f('execsql', [connection, sql]); },
    execSqlCount: (connection, sql) => { return f('execsqlcount', [connection, sql]); },

    //SeedLists
    seedList: {
        AustralianPostalCodes: '@seedlist(Australian Postal Codes)@',
        BelgiumCities: '@seedlist(Belgium Cities)@',
        BusinessTypes: '@seedlist(Business Types)@',
        Companies: '@seedlist(Companies)@',
        Country: '@seedlist(Country)@',
        CountryCodes: '@seedlist(Country Codes)@',
        CreditCard: '@seedlist(Credit Card)@',
        CreditCardType: '@seedlist(CreditCardType)@',
        CurrencyCode: '@seedlist(Currency Code)@',
        DayOfWeek: '@seedlist(DayOfWeek)@',
        EmailProviders: '@seedlist(Email Providers)@',
        FemaleNames: '@seedlist(Female Names)@',
        FirstName: '@seedlist(FirstName)@',
        FirstNameTitle: '@seedlist(FirstNameTitle)@',
        FirstNameGender: '@seedlist(FirstNameGender)@',
        Flowers: '@seedlist(Flowers)@',
        Fruit: '@seedlist(Fruit)@',
        JobTitles: '@seedlist(Job Titles)@',
        LastName: '@seedlist(LastNames)@',
        MaleNames: '@seedlist(MaleNames)@',
        MaritalStatus: '@seedlist(Marital Status)@',
        Month: '@seedlist(Month)@',
        Name: '@seedlist(Name)@',
        RandomText: '@seedlist(Random Text)@',
        Sex: '@seedlist(Sex)@',
        SocialNetworks: '@seedlist(Social Networks)@',
        StreetName: '@seedlist(StreetName)@',
        StreetNamePortugal: '@seedlist(StreetName-Portugal)@',
        SurName: '@seedlist(Surname)@',
        YesNo: '@seedlist(YesNo)@'
    }
}

module.exports = functions;