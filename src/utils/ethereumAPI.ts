const Decimal = require('decimal.js');

export const applyDecimals = (rawValue?: any, decimals?: any, sign = "negative") => {
    //return Decimal(rawValue).mul(Decimal(10).pow(Decimal(sign === "positive" ? decimals : -decimals))).toFixed();
    return Decimal(rawValue).mul(Decimal(10).pow(Decimal(18))).toFixed()
}
