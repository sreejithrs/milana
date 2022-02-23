"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateByCode = exports.getStateByCodeAndCountry = exports.getStatesOfCountry = exports.getAllStates = void 0;
var state_json_1 = __importDefault(require("../assets/state.json"));
var utils_1 = require("../utils");
// Get a list of all states.
function getAllStates() {
    return state_json_1.default;
}
exports.getAllStates = getAllStates;
// Get a list of states belonging to a specific country.
function getStatesOfCountry(countryCode) {
    if (!countryCode)
        return [];
    var states = state_json_1.default.filter(function (value) {
        return value.countryCode === countryCode;
    });
    return states.sort(utils_1.compare);
}
exports.getStatesOfCountry = getStatesOfCountry;
// Find a country by it's ISO code and the country in which it is contained.
function getStateByCodeAndCountry(stateCode, countryCode) {
    if (!stateCode)
        return undefined;
    if (!countryCode)
        return undefined;
    return utils_1.findStateByCodeAndCountryCode(state_json_1.default, stateCode, countryCode);
}
exports.getStateByCodeAndCountry = getStateByCodeAndCountry;
// to be deprecate
function getStateByCode(isoCode) {
    // eslint-disable-next-line no-console
    console.warn("WARNING! 'getStateByCode' has been deprecated, please use the new 'getStateByCodeAndCountry' function instead!");
    if (!isoCode)
        return undefined;
    return utils_1.findEntryByCode(state_json_1.default, isoCode);
}
exports.getStateByCode = getStateByCode;
exports.default = {
    getAllStates: getAllStates,
    getStatesOfCountry: getStatesOfCountry,
    getStateByCodeAndCountry: getStateByCodeAndCountry,
    getStateByCode: getStateByCode,
};
