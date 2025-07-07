import React, { Component } from 'react';
import './App.css';
import { AppsBar } from 'components/AppsBar';
import Map from './Map';
import Header from './Header';
import TemperatureBar from './TemperatureBar';
import CountryStatus from './CountryStatus';
import CountrySelector from './CountrySelector';
import { withTranslation } from 'react-i18next';
import timezones from './timezones.json';

const userCountryCode = timezones[Intl.DateTimeFormat().resolvedOptions().timeZone];
const userUnits = [
    "us",
    "lr",
    "fm",
    "vi",
    "ky",
    "mh",
].includes(userCountryCode) ? "f" : "c";

class _App extends Component {

    constructor(props) {
        super(props);
        this.languages = ["en", "es", "pt"];
        let language = this.props.i18n.language.split("-")[0];
        if(!this.languages.includes(language)) language = this.languages[0];
        this.props.i18n.changeLanguage(language);
        document.title = this.props.t("pageTitle");
        const units = localStorage.getItem("chromatic-units") ?? userUnits;
        this.state = {
            size: undefined,
            temperatureRange: [0.75, 0.95],
            temperatureLimits: [null, null],
            temperatureMapLimits: undefined,
            grabbing: false,
            data: undefined,
            selectedCountry: this.getCountry(),
            countrySelectorVisible: false,
            units
        }
        this.dataCache = {};
        this.props.i18n.on("languageChanged", () => {
            document.title = this.props.t("pageTitle");
        })
    }

    componentDidMount() {
        this.setState({size:[this.containerRef.offsetWidth,this.containerRef.offsetHeight]})
        const resizeObserver = new ResizeObserver((entries) => {
            for(const entry of entries){
                this.setState({size:[entry.contentRect.width, entry.contentRect.height]})
            }
        })
        resizeObserver.observe(this.containerRef);
        this.loadData();
    }

    getCountry() {
        const storedCountry = localStorage.getItem("chromatic-country");
        if(storedCountry) return storedCountry;
        const countryCodes = Object.keys(this.props.i18n.getResourceBundle(this.props.i18n.language).countries);
        let countryCode = userCountryCode;
        if(!countryCode || !countryCodes.includes(countryCode)) countryCode = "gb";
        localStorage.setItem("chromatic-country", countryCode);
        return countryCode;
    }

    loadData(){
        if(!this.dataCache[this.state.selectedCountry]){
            fetch(`./data/${this.state.selectedCountry}.json`).then(response => response.json()).then(data => {
                this.dataCache[this.state.selectedCountry] = data;
                this.setState({data: data});
            }).catch(error => {
                console.error("Error fetching data:", error);
            });
        }
        else this.setState({data: this.dataCache[this.state.selectedCountry]});
    }

    setTemperatureMapLimits(temperatureMapLimits){
        this.setState({temperatureMapLimits});
    }

    setGrabbing(grabbing) {
        this.setState({grabbing: grabbing});
    }

    setTemperatureRange(temperatureRange) {
        this.setState({temperatureRange});
    }

    changeCountry(country){
        this.setState({
            selectedCountry: country, 
            temperatureLimits: [null, null],
        }, () => {
            localStorage.setItem("chromatic-country", country);
            this.loadData();
        });
    }

    changeMaxTemperature(temperature) {
        this.setState({temperatureLimits: [this.state.temperatureLimits[0], temperature]});
    }

    changeMinTemperature(temperature) {
        this.setState({temperatureLimits: [temperature, this.state.temperatureLimits[1]]});
        
    }

    setUnits(units) {
        this.setState({units}, () => {
            localStorage.setItem("chromatic-units", units);
        })
    }


    render() {
        return (
            <AppsBar current='calor'>
                <div
                    className={`app${this.state.grabbing ? ' grabbing' : ''}${window.innerWidth < 1000 && window.innerHeight < 1200 ? ' small' : ''}`}
                >
                    <Header
                        units={this.state.units}
                        setUnits={(units) => this.setUnits(units)}
                        languages={this.languages}
                    />
                    <CountryStatus
                        countryCode={this.state.selectedCountry}
                        onClick={() => {
                            this.setState({countrySelectorVisible: true})
                        }}
                    />
                    {
                        this.state.temperatureMapLimits &&
                        <TemperatureBar
                            temperatureRange={this.state.temperatureRange}
                            temperatureMapLimits={this.state.temperatureMapLimits}
                            setGrabbing={(grabbing) => this.setGrabbing(grabbing)}
                            setTemperatureRange={(temperatureRange) => this.setTemperatureRange(temperatureRange)}
                            temperatureLimits={this.state.temperatureLimits}
                            changeMaxTemperature={(temperature) => {
                                this.changeMaxTemperature(temperature);
                            }}
                            changeMinTemperature={(temperature) => {
                                this.changeMinTemperature(temperature)
                            }}
                            units={this.state.units}
                        />
                    }
                    <div
                        className="container"
                        ref={(containerRef) => this.containerRef = containerRef}
                    >
                        {
                            this.state.size && this.state.data &&
                            <Map
                                data={this.state.data}
                                size={this.state.size}
                                easterEgg={this.state.selectedCountry === "ma" && this.props.i18n.language === "es"}
                                temperatureRange={this.state.temperatureRange}
                                setTemperatureMapLimits={(temperatureMapLimits) => this.setTemperatureMapLimits(temperatureMapLimits)}
                                temperatureLimits={this.state.temperatureLimits}
                                units={this.state.units}
                            />
                        }
                    </div>
                    <CountrySelector
                        open={this.state.countrySelectorVisible}
                        close={() => {
                            this.setState({countrySelectorVisible: false})
                        }}
                        selectedCountry={this.state.selectedCountry}
                        selectCountry={(country) => {
                            this.setState({countrySelectorVisible: false}, () => {
                                this.changeCountry(country);
                            });
                        }}
                    />
                </div>
            </AppsBar>
        )
    }
}

const App = withTranslation()(_App)
export default App;
