const xButton = document.querySelector('.buttonX');
const yInput = document.querySelector('input[name="Y"]');
const rButton = document.querySelector('.buttonR');
const chooseX = document.querySelector('input.chooseButton')
let x;
let y;
let r;
const form = document.querySelector('.form');
const clear = document.querySelector('#clearButton');

function checkR(){
    const checkedR = Array.from(document.querySelectorAll('input[name="R"]')).find(input => input.checked);
    if(checkedR === undefined){
        return null;
    }
    return checkedR.value;
}

chooseX.addEventListener("click", function () {
    chooseX.style.backgroundColor="darkgray";
});

clear.addEventListener("click", function (){
    dataStore.clear();
});

xButton.addEventListener("click", function(event){
    if(!event.target.matches('input[name="X"]')){
        return;
    }
    x = event.target.value;
});

yInput.addEventListener("input", function(event){
    //console.log(event.target.value);
    if (validateCoordinate(event.target.value) && +event.target.value > -5 && +event.target.value < 5){
        event.target.classList.remove("invalid");
        y = event.target.value;
    }
    else{
        event.target.classList.add("invalid");
    }
});

rButton.addEventListener("click", function(event){
    if(!event.target.matches('input[name="R"]')){
        return;
    }
    r = event.target.value;
});

form.addEventListener("submit", function(event){
    event.preventDefault();
    console.log(x, y, r);
    if(x === undefined || y === undefined || r === undefined){
        alert("NO NUMBERS OR WRONG INTERVAL FOR Y (-5; 5)");
    }
    else{
        handle_submit(x,y,r);
    }
});

const COORDINATE_REGULAR_EXPRESSION = /^-?\d+(.\d+)?$/;

function validateCoordinate(str){
    return COORDINATE_REGULAR_EXPRESSION.test(str);
}


const coordinateConverter = {
    R_Y_MAX: 540,
    R_Y_MIN: 39,
    R_X_MAX: 522,
    R_X_MIN: 21,
    toSvgCoordinates(x, y, r) {
        const svgX = (x/2/r + 1/2)*(this.R_X_MAX - this.R_X_MIN) + this.R_X_MIN;
        const svgY = (1/2 - y/2/r)*(this.R_Y_MAX - this.R_Y_MIN) + this.R_Y_MIN ;

        return { svgX, svgY };
    },
    toAbsoluteCoordinates(svgX, svgY, svgR) {
        const x = ((svgX - this.R_X_MIN)/(this.R_X_MAX - this.R_X_MIN) - 0.5) * 2 * svgR;
        const y = -((svgY - this.R_Y_MIN)/(this.R_Y_MAX - this.R_Y_MIN) - 0.5) * 2 * svgR;

        return { x, y };
    }
};

class SvgDrawer {
    constructor(svgSelector) {
        this.diagram = document.querySelector(svgSelector);

        if (this.diagram === null) {
            throw new Error("element does not exist");
        }

        this.draw = SVG().addTo(svgSelector).size(560, 560);

        this.diagram.addEventListener("click", this.eventHandler);
    }

    removePoints() {
        this.draw.clear();
        //todo remove all points
    }

    addPoint(x, y, color) {
        this.draw
            .circle(7)
            .attr({fill: color})
            .attr({opacity: '0.3'})
            .attr({class: "solid_area"})
            .move(x, y);
    }

    eventHandler(event) {
        const start = Date.now();
        const rect = event.currentTarget.getBoundingClientRect();
        const svgX = event.clientX - rect.left;
        const svgY = event.clientY - rect.top;

        const actualR = checkR();

        if(actualR === null){
            window.location.assign("https://youtu.be/Vdr5b_FuNEY");
            return;
        }
        const {x, y} = coordinateConverter.toAbsoluteCoordinates(svgX, svgY, actualR);
        const hit = event.target.classList.contains("solid_area");
        const finish = Date.now();
        dataStore.add({
            x,
            y,
            r: actualR,
            hit,
            scriptExecutionDuration: finish - start,
            date: new Date().toDateString(),
        });
    }
}

class DataStore {
    constructor(storage, onChange) {
        this.onChange = onChange;
        this.storage = storage;
        this.data = this.storage.load();
        this.onChange(this.data);
        // {
        //     x,
        //     y,
        //     r,
        //     hit,
        //     date,
        //     scriptExecutionDuration,
        // }
    }

    add(point) {
        this.data.push(point);
        if(this.data.length > 30){
            this.data.shift();
        }
        this.onChange(this.data);
        this.storage.save(this.data);
    }

    clear() {
        this.data = [];
        this.onChange(this.data);
        this.storage.save(this.data);
    }
}


class CookieStorage {
    save(a) {
        let cock = JSON.stringify(a);
        document.cookie = `cock=${cock}`;
    }

    load() {
        const cookieStr = document.cookie;
        const cookieArr = cookieStr.split("; ");
        const cookieCock = cookieArr.find(str => str.startsWith("cock="));
        if(cookieCock === undefined){
            return [];
        }
        const cookieValue = cookieCock.replace("cock=", "");
        const array = JSON.parse(cookieValue);
        return array;
    }
}


const svgDrawer = new SvgDrawer('.diagram');
const cookieStorage = new CookieStorage();

function onDataStoreChange(points) {
    svgDrawer.removePoints();
    points.forEach(point => {
        const {svgX, svgY} = coordinateConverter.toSvgCoordinates(
            point.x, point.y, point.r
        );
        svgDrawer.addPoint(svgX, svgY, point.hit ? "green" : "red");
    });
    fillTable(points);
}

const dataStore = new DataStore(cookieStorage, onDataStoreChange);

async function handle_submit(x, y, r){
    const start = Date.now();
    //const {svgX, svgY} = coordinateConverter.toSvgCoordinates(x, y, r);
    const response = await fetch(`/Web-2-1.0-SNAPSHOT/areacheck-servlet?X=${x}&Y=${y}&R=${r}`);    //ожидание ответа с сервера без блокировки
    console.log(response);
    const ok = await response.text();
    console.log(ok);
    console.log(ok.length);
    let hit = false;
    if(ok.length === 5){
        hit = true;
    }
    console.log(hit);
    const finish = Date.now();
    const veryNew = {
        x,
        y,
        r,
        hit,
        scriptExecutionDuration: finish - start,
        date: new Date().toDateString(),
    }
    console.log(veryNew);
    dataStore.add(veryNew);
    //svgDrawer.addPoint(svgX, svgY, hit ? "green" : "red");
}

function fillTable(a){
    const head = "<tr><th>X</th><th>Y</th><th>R</th><th>Попадание</th><th>Время исполнения скрипта</th><th>Дата и время</th></tr>";
    const body = a
        .map(obj => `<tr><td>${obj.x}</td><td>${obj.y}</td><td>${obj.r}</td><td>${String(obj.hit)}</td><td>${obj.scriptExecutionDuration}</td><td>${obj.date}</td></tr>`)
        .join("");
    const table = document.querySelector("table");
    table.innerHTML = head + body;
}
