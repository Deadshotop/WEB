const xButton = document.querySelector('.buttonX');
const yInput = document.querySelector('input[name="Y"]');
const rButton = document.querySelector('.buttonR');
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

const diagram = document.querySelector('.diagram');
const draw = SVG().addTo('.diagram').size(560, 560);
diagram.addEventListener("click", event => {
    const figure = event.target.classList.contains("solid_area");
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const R_Y_MAX = 540;
    const R_Y_MIN = 39;
    const R_X_MAX = 522;
    const R_X_MIN = 21;
    const actualR = checkR();
    if(actualR !== null){
        if(figure){
            draw.circle(7).attr({fill: 'green'}).attr({opacity: '0.3'}).attr({class: "solid_area"}).move(x, y);
            console.log("HIT " + "X: " + x + " ; Y: " + y);
        }
        else{
            draw.circle(7).attr({ fill: 'red'}).attr({opacity: '0.3'}).move(x, y);
            console.log("NO HIT " + "X: " + x + " ; Y: " + y);
        }
        const X = ((x - R_X_MIN)/(R_X_MAX - R_X_MIN) - 0.5)*2*actualR;
        const Y = -((y - R_Y_MIN)/(R_Y_MAX - R_Y_MIN) - 0.5)*2*actualR;
        console.log("COORDS: " + "X: " + X + " Y: " + Y + " R: " + actualR);
    }
    else{
        window.location.replace("https://youtu.be/Vdr5b_FuNEY");
    }

});

clear.addEventListener("click", function (event){
    save_cock([]);
    fillTable([]);
});

xButton.addEventListener("click", function(event){
    if(!event.target.matches('input[name="X"]')){
        return;
    }
    x = event.target.value;
    event.target.classList.add("clicked");
});

yInput.addEventListener("input", function(event){
    console.log(event.target.value);
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

function drawFromTable(x, y, r, check){
    const R_Y_MAX = 540;
    const R_Y_MIN = 39;
    const R_X_MAX = 522;
    const R_X_MIN = 21;
    const x_on_pic = (x/2/r + 1/2)*(R_X_MAX - R_X_MIN) + R_X_MIN;
    const y_on_pic = (1/2 - y/2/r)*(R_Y_MAX - R_Y_MIN) + R_Y_MIN ;
    if(check){
        draw.circle(7).attr({fill: 'green'}).attr({opacity: '0.3'}).attr({class: "solid_area"}).move(x_on_pic, y_on_pic);
    }
    else{
        draw.circle(7).attr({fill: 'red'}).attr({opacity: '0.3'}).attr({class: "solid_area"}).move(x_on_pic, y_on_pic);
    }
}

async function handle_submit(x, y, r){
    const start = Date.now();
    const response = await fetch(`/Web-2-1.0-SNAPSHOT/areacheck-servlet?X=${x}&Y=${y}&R=${r}`);    //ожидание ответа с сервера без блокировки
    console.log(response);
    const ok = await response.text();
    console.log(ok);
    const finish = Date.now();
    const full = read_cock();
    const timeS = finish - start;
    const time = new Date().toDateString();

    const veryNew = {
        x,
        y,
        r,
        ok,
        timeS,
        time,
    }
    full.push(veryNew);
    if(full.length > 30){
        full.shift();
    }
    save_cock(full);
    fillTable(full);
}

function fillTable(a){
    const head = "<tr><th>X</th><th>Y</th><th>R</th><th>Попадание</th><th>Время исполнения скрипта</th><th>Дата и время</th></tr>";
    const body = a
        .map(obj => `<tr><td>${obj.x}</td><td>${obj.y}</td><td>${obj.r}</td><td>${obj.jeka}</td><td>${obj.timeS}</td><td>${obj.time}</td></tr>`)
        .join("");
    const table = document.querySelector("table");
    table.innerHTML = head + body;
}



function save_cock(a){
    let cock = JSON.stringify(a);
    console.log(cock);
    document.cookie = `cock=${cock}`;
}

function read_cock(){
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

const call = read_cock();
fillTable(call);

"LA CRINGE"