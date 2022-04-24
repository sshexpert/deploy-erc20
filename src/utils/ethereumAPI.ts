const Decimal = require('decimal.js');

export const applyDecimals = (rawValue: any, decimals: any, sign = "negative") => {
    if(!rawValue)
        return "";

    return Decimal(rawValue).mul(Decimal(10).pow(Decimal(sign === "positive" ? decimals : -decimals))).toFixed();
}
