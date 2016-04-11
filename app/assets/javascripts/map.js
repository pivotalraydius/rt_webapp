var handler = Gmaps.build('Google');

handler.buildMap({
    provider: {
        disableDefaultUI:true,
        zoom: 18,
        streetViewControl: false,
        panControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DEFAULT,
            mapTypeIds: [
                google.maps.MapTypeId.ROADMAP,
                google.maps.MapTypeId.TERRAIN
            ]
        },
        zoomControl: false,
    },
    internal: {id: 'map-canvas'}
}, function(){
handler.fitMapToBounds();
});


