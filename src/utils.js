function getFormattedTemperature(temperature, units){
    if(units === 'c') return Math.round(temperature * 10) / 10 + getUnitsSymbol(units);
    return Math.round(celsiusToFarenheit(temperature) * 10) / 10 + getUnitsSymbol(units);
}

function celsiusToFarenheit(celsius){
    return celsius * 9 / 5 + 32;
}

function fahrenheitToCelsius(fahrenheit){
    return (fahrenheit - 32) * 5 / 9;
}

function getUnitsSymbol(units){
    if(units === 'c') return " °C";
    return " °F"
}

export {getFormattedTemperature, celsiusToFarenheit, fahrenheitToCelsius, getUnitsSymbol};