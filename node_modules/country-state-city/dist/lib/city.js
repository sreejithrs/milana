"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var city_json_1 = __importDefault(require("../assets/city.json"));
var utils_1 = require("../utils");
// Get a list of all cities.
function getAllCities() {
    return city_json_1.default;
}
// Get a list of cities belonging to a specific state and country.
function getCitiesOfState(countryCode, stateCode) {
    if (!stateCode)
        return [];
    if (!countryCode)
        return [];
    var cities = city_json_1.default.filter(function (value) {
        return value.countryCode === countryCode && value.stateCode === stateCode;
    });
    return cities.sort(utils_1.compare);
}
// Get a list of cities belonging to a specific country.
function getCitiesOfCountry(countryCode) {
    if (!countryCode)
        return [];
    var cities = city_json_1.default.filter(function (value) {
        return value.countryCode === countryCode;
    });
    return cities.sort(utils_1.compare);
}
exports.default = {
    getAllCities: getAllCities,
    getCitiesOfState: getCitiesOfState,
    getCitiesOfCountry: getCitiesOfCountry,
};
