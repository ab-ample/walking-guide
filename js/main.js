let locations = [
    {
        id: '#diandra',
        name: 'Diandra',
        lat: 52.512525,
        lng: 13.342017
    },
    {
        id: '#otso',
        name: 'Otso',
        lat: 52.512709,
        lng: 13.365682
    },
    {
        id: '#manuel',
        name: 'Manuel',
        lat: 52.5116737,
        lng: 13.3621917
    },
    {
        id: '#paula',
        name: 'Paula',
        lat: 52.512070,
        lng: 13.360996
    },
    {
        id: '#louise',
        name: 'Louise',
        lat: 52.30453,
        lng: 13.21439
    }
];

// https://developer.apple.com/forums/thread/128376
let destination = locations[0]; // first is default

let title = document.querySelector('#title')
let direction = document.querySelector('#direction');
let distance = document.querySelector('#distance');

let startButton = document.querySelector('#start');

// THE MENU
let menuButton = document.getElementById('menu-button');
let menu = document.getElementById('menu');
let aboutButton = document.getElementById('about-button');
let tutorialButton = document.getElementById('tutorial-button');
let about = document.getElementById('about');
let tutorial = document.getElementById('tutorial');

// THE CONTENT
let closeButton = document.getElementsByClassName('close-button');

let count = 0;
let rotation;
let pointDegree;

// 🔑
let init = () => {
    // https://stackoverflow.com/questions/46689339/ionic-2-geolocation-timeout-error
    navigator.geolocation.watchPosition((position) => {

        currentCoord(position)
            .then(calculateRow)
            .then(printDistance);
        
        locationHandler(position);

    }, (error) => console.error(error),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });
}

let displayDirection = (isCorrect) => {
    if (isCorrect) {
        direction.innerHTML = 'This is the correct way';
        direction.classList.remove('notCorrect');
        direction.classList.add('correct');
    } else {
        direction.innerHTML = 'Not this way';
        direction.classList.remove('correct');
        direction.classList.add('notCorrect');
    }
}

// deviceOrientation on iOS devices
let requestDeviceOrientation = (event) => {

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener("deviceorientation", handler, true);

                    $('#permissions').hide();

                } else {
                    alert('Has to be allowed');
                }
            })
            .catch(console.error);
    } else {
        // handle regular non iOS 13+ devices
        console.log ("not iOS");

        $('#permissions').hide();
        window.addEventListener("deviceorientationabsolute", handler, true);
    }
}

// convert numeric degrees to radians
let toRad = (Value) => {
    return Value * Math.PI / 180;
}

// 📍 get current coordenates
let currentCoord = (position) => {
    return new Promise((resolve, reject) => {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        resolve({lat, lng});
    })
}

let calculateRow = (data) => {
    return new Promise((resolve, reject) => {

        let lat1 = data.lat;
        let lng1 = data.lng;
        let lat2 = destination.lat;
        let lng2 = destination.lng;

        let R = 6371; // km
        let dLat = toRad(lat2-lat1);
        let dLng = toRad(lng2-lng1);
        lat1 = toRad(lat1);
        lat2 = toRad(lat2);

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLng/2) * Math.sin(dLng/2) *
            Math.cos(lat1) * Math.cos(lat2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c;

        resolve(d);
    })
}

let printDistance = (data) => {
    return new Promise((resolve, reject) => {
        let meters = data * 1000 // Math.round((data * 1000) * 10) / 10
        meters = meters - (meters % 10);

        distance.innerHTML = `${meters} meters away`;
        if (data < 0.02) {
            distance.innerHTML = `You 've arrived to ${destination.name}`;
            if (!$('.popup').is(":visible")) {
                $(destination.id).show();
            }
        }
    })
}

let locationHandler = (position) => {
    
    let { latitude, longitude } = position.coords;
    pointDegree = calculateDegreeToPoint(latitude, longitude);

    if (pointDegree < 0) {
        pointDegree = pointDegree + 360;
    }

}

let calculateDegreeToPoint = (latitude, longitude) => {

    const phiK = (destination.lat * Math.PI) / 180.0;
    const lambdaK = (destination.lng * Math.PI) / 180.0;
    const phi = (latitude * Math.PI) / 180.0;
    const lambda = (longitude * Math.PI) / 180.0;
    const psi =
        (180.0 / Math.PI) *
        Math.atan2(
            Math.sin(lambdaK - lambda),
            Math.cos(phi) * Math.tan(phiK) -
            Math.sin(phi) * Math.cos(lambdaK - lambda)
        );
    
    return Math.round(psi);
}

let handler = () => {
    
    compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
    rotation = compass - pointDegree;

    direction.style.transform = `translate(-50%,-50%) rotate(${-rotation}deg)`;

    if (
        (pointDegree < Math.abs(compass) &&
        pointDegree + 15 > Math.abs(compass)) ||
        pointDegree > Math.abs(compass + 15) ||
        pointDegree < Math.abs(compass)
    ) {
        displayDirection(false);
    } else if (pointDegree) {
        displayDirection(true);
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    if ('geolocation' in navigator) {
        console.log('Geolocation supported');
        $('#press-to-start').click(() => {
            $('#press-to-start').remove();
            init();
        })
        // init();
    } else {
        console.error('Geolocation not supported');
        alert('Geolocation not supported');
    }
});

let changeDestination = () => {
    count = count >= locations.length -1 ? 0 : count + 1;
    destination = locations[count];
    title.innerHTML = destination.name;
}

direction.addEventListener('click', changeDestination, false);

// THE MENU
$('#menu-button').click(() => {
    $('#menu').toggle();
    $('#menu-button').toggleClass('open');
})

$('#about-button').click(() => {
    $('.popup').hide();
    $('#menu').hide();
    $('#about').show();
    $('#menu-button').toggleClass('open');
})

$('#tutorial-button').click(() => {
    $('.popup').hide();
    $('#menu').hide();
    $('#tutorial').show();
    $('#menu-button').toggleClass('open');
})

// THE CONTENT
$('.close-button').click(() => {
    $('.popup').hide();
})