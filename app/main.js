import '../assets/sass/main.scss';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1Ijoib3NjYXJsb3BlemIiLCJhIjoiY2twYTE2Ynp4MDltMDJubGs2emR4dHE4ZiJ9.4SGEhinRUzZ4tcO8etLEew'

window.addEventListener("load", () => {
    loadMapView();
});

let markersPositions;
let mapPosition;
let map;

const app = document.querySelector(".app");
const modalWindow = app.querySelector(".modal");
const modalWindowBg = app.querySelector(".modal_bg");

let weather;



const loadMapView = () => {
    loadMarkers();
    loadMapInfo();

    renderMapViewHeader();
    renderMapViewMain();
    renderMapViewFooter();
}



const loadMarkers = () => {
    const localStorageMarkers = localStorage.getItem("markers");
    if (localStorageMarkers == null) {
        markersPositions = [];
    } else {
        markersPositions = JSON.parse(localStorageMarkers);
    }
}

const loadMapInfo = () => {
    const localStoragePosition = localStorage.getItem("map-info");
    if (localStoragePosition == null) {
        mapPosition = {
            center: [0, 0],
            zoom: 12,
        };
    } else {
        mapPosition = JSON.parse(localStoragePosition);
    }
}

const renderMapViewHeader = () => {
    const header = document.querySelector('.header');
    header.innerHTML = `
        <div class="consultar">Consulta el tiempo de tu zona</div>
    `;
}

const renderMapViewMain = () => {
    const main = document.querySelector('.main');
    main.innerHTML = '<div id="oscarmapa"></div>';
    renderMap();

    renderMarkers();
    initMapEvents();
}

const renderMapViewFooter = () => {
    const footer = document.querySelector('.footer');
    
    footer.innerHTML = `

        <div class="footermodal">

            <div class="ubicacion cerrar">
                <div class="fa fa-crosshairs"></div>
                <p>Volver a mi ubicación</p>
            </div>

        </div>
        
`
    footer.addEventListener("click", () => {
        flyToLocation();
    });
}

const renderMap = () => {
    map = new mapboxgl.Map({
        container: 'oscarmapa',
        style: 'mapbox://styles/oscarlopezb/ckpbdlu117rqm18pv0flv0ot8',
        center: [mapPosition.lng, mapPosition.lat],
        zoom: mapPosition.zoom
    });
}

const renderMarkers = () => {
    markersPositions.forEach(m => {
        new mapboxgl.Marker().setLngLat([m.coord.lon, m.coord.lat]).addTo(map);
    })
}

const flyToLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        map.flyTo({
            center: [lng, lat],
            zoom: 12,
        })
    });
}

const initMapEvents = () => {
    map.on("move", (ev) => {
        const center = ev.target.getCenter();
        const zoom = ev.target.getZoom();
        const storingObj = {
            lat: center.lat,
            lng: center.lng,
            zoom: zoom,
        };
        localStorage.setItem("map-info", JSON.stringify(storingObj));
    });


    map.on("click", async (ev) => {
        loadSingleView(ev.lngLat);
    });
}

const loadSingleView = async (lngLat) => {
    loadSpinner();
    await fetchData(lngLat);
    unloadSpinner();
    renderModal();

    modalWindow.classList.add("opened");
    modalWindowBg.classList.add("opened");

    location.hash = "single";

    modalWindowBg.addEventListener("click", () => {
        modalWindow.classList.remove("opened");
        modalWindowBg.classList.remove("opened");
        location.hash = "map";
    })

    const botonCerrar = app.querySelectorAll(".cerrar");

    botonCerrar.forEach(botonCerrar => {
        botonCerrar.addEventListener("click", () => {
            modalWindow.classList.remove("opened");
            modalWindowBg.classList.remove("opened");
            location.hash = "map";
        })
    })
}

const loadSpinner = () => {
    const spinner = document.querySelector(".spinner");
    spinner.classList.add("opened");
}

const unloadSpinner = () => {
    const spinner = document.querySelector(".spinner");
    spinner.classList.remove("opened");
}

const fetchData = async (lngLat) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lngLat.lat}&lon=${lngLat.lng}&appid=083f19514de775916c615a6d803b575e&units=metric`;
    weather = await fetch(url).then(d => d.json()).then(d => d);
}

// Modal Window

const renderModal = () => {
    modalWindow.innerHTML = `
        <header>
            <h1 class="lugar">${weather.name}</h1>
            <div class="cerrar">
                <div class="fa fa-times"></div>
            </div>
        </header>

        <main>
            <div class="weather_items">
                <div class="weather_item">

                    <div class="tiempo">
                        <div class="fa fa-cloud"></div>
                        <p>${weather.main.temp}°C</p>
                    </div>

                    <div class="humedad">
                        <div class="fa fa-tint"></div>
                        <p>${weather.main.humidity}%</p>
                    </div>

                    <div class="viento">
                        <div class="fa fa-location-arrow"></div>
                        <p>${weather.wind.speed}mph</p>
                    </div>

                </div>
            </div>
        </main>

        <footer>
            <div class="cerrar">
                <div class="fa fa-arrow-left"></div>
                <p>Volver al mapa</p>
            </div>
            <div class="guardar">
                <div class="fa fa-map-marker"></div>
            </div>
        </footer>
    `
    saveMarker()
}

const saveMarker = () => {
    const guardar = modalWindow.querySelector(".guardar")
    markersPositions.push(weather)
    guardar.addEventListener("click", () => {
        modalWindow.classList.remove("opened");
        modalWindowBg.classList.remove("opened");
        location.hash = "map";

        localStorage.setItem("markers", JSON.stringify(markersPositions))
        loadMapView();
    })
}