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
        <div class="ubicacion">
            <div class="fa fa-crosshairs"></div>
            <p>Volver a mi ubicación</p>
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

    // navigator.geolocation.getCurrentPosition(({ coords }) => {
    //     map.flyTo({
    //         center: [coords.longitude, coords.latitude],
    //         zoom: 10,
    //     });
    // });
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
    await fetchData(lngLat);
    renderModal();

    modalWindow.classList.add("opened");
    modalWindowBg.classList.add("opened");

    location.hash = "single";

    modalWindowBg.addEventListener("click", () => {
        modalWindow.classList.remove("opened");
        modalWindowBg.classList.remove("opened");
        location.hash = "map";
    })

    const botonCerrar = modalWindow.querySelectorAll(".cerrar");

    botonCerrar.forEach(botonCerrar => {
        botonCerrar.addEventListener("click", () => {
            modalWindow.classList.remove("opened");
            modalWindowBg.classList.remove("opened");
            location.hash = "map";
        })
    })
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
            <div class="weather_list">
                <div class="weather_list_item">

                    <div class="humedad">
                        <div class="gota">
                            <div class="fa fa-tint"></div>
                        </div>
                        <p class="porcentaje_humedad">${weather.main.humidity}%</p>
                    </div>

                    <div class="weather">
                        <div class="weather_icon">
                            <div class="fa fa-cloud"></div>
                        </div>
                        <p class="temperature">${weather.main.temp}°C</p>
                    </div>

                    <div class="wind">
                        <div class="direction">
                            <div class="fa fa-location-arrow"></div>
                        </div>
                        <p class="velocity">${weather.wind.speed}mph</p>
                    </div>

                </div>
            </div>
        </main>

        <footer>
            <div class="cerrar">
                <div class="back">
                    <div class="fa fa-arrow-left"></div>
                    <p>Volver al mapa</p>
                </div>
            </div>
            <div class="save_place">
                <div class="save">
                    <div class="fa fa-map-marker"></div>
                </div>
            </div>
        </footer>    
    `
    saveMarker()
}

const saveMarker = () => {
    const save = modalWindow.querySelector(".save_place")
    markersPositions.push(weather)
    save.addEventListener("click", () => {
        modalWindow.classList.remove("opened");
        modalWindowBg.classList.remove("opened");
        location.hash = "map";

        localStorage.setItem("markers", JSON.stringify(markersPositions))
        loadMapView();
    })
}