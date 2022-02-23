"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var country_json_1 = __importDefault(require("../assets/country.json"));
var utils_1 = require("../utils");
// Get a country by isoCode.
function getCountryByCode(isoCode) {
    if (!isoCode)
        return undefined;
    return utils_1.findEntryByCode(country_json_1.default, isoCode);
}
// Get a list of all countries.
function getAllCountries() {
    return country_json_1.default;
}
exports.default = {
    getCountryByCode: getCountryByCode,
    getAllCountries: getAllCountries,
};
