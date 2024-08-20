(function() {

    //const lat = 20.67444163271174;
    const lat = document.querySelector('#lat').value ||  -17.780340;
    //const lng = -103.38739216304566;
    const lng = document.querySelector('#lng').value || -63.164778;

    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker

    //utilizar Provider y Geocoder
    const  geocodeService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //el Pin
    marker = new L.marker([lat, lng],{
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)

    //detectar el movimiento del Pin
    marker.on('moveend', function(e){
        marker = e.target
        const posicion = marker.getLatLng();
        console.log(posicion)
        mapa.panTo(new L.LatLng(posicion.lat,posicion.lng))


        //Obtener la informacion de las calles
        geocodeService.reverse().latlng(posicion,13).run(function(error, resultado){
            //console.log(resultado)

            marker.bindPopup(resultado.address.LongLabel)

            //Llenar los campos
            document.querySelector('.calle').textContent = resultado.address.Address ?? '';
            document.querySelector('#calle').value = resultado.address.Address ?? '';

            document.querySelector('#lat').value = resultado.latlng.lat ?? '';
            document.querySelector('#lng').value = resultado.latlng.lng ?? '';






        })


    })



})()