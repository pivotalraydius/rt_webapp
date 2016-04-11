var roundtripMap = {

    init: function() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }

        handler = Gmaps.build('Google');
        handler.buildMap({
                provider: {
                    disableDefaultUI: true  ,
                    zoom: 13
                    // pass in other Google Maps API options here
                },
                internal: {
                    id: 'map-canvas'
                }
            },
            function(){

            }
        );

        $('#setTime').timepicker();
        $('#setTime').timepicker('setTime', new Date());

        $('select').on('change', function() {
            console.log( this.value ); // or $(this).val()
            if (this.value == 1){
                $('#setTime').timepicker('setTime', new Date());
            }
        });


        $("#swapIcon").on("click",function(){

            var $inputC = $("#from_input");
            var $inputD = $("#to_input");
            var temp = $inputC.val();
            $inputC.val($inputD.val());
            $inputD.val(temp);

        }) ;

        function showPosition(position) {
            lat = position.coords.latitude;
            lng = position.coords.longitude;

            handler.getMap().setCenter(new google.maps.LatLng(lat,lng));

            handler.getMap().setZoom(13)


        }

        var  from_autocomplete, to_autocomplete;


        from_autocomplete = new google.maps.places.Autocomplete(
            /** @type {HTMLInputElement} */(document.getElementById('from_input')),
            { types: ['geocode'] });
        // When the user selects an address from the dropdown,
        // populate the address fields in the form.
        google.maps.event.addListener(from_autocomplete, 'place_changed', function() {
            fillInAddress();
        });

        to_autocomplete = new google.maps.places.Autocomplete(
            /** @type {HTMLInputElement} */(document.getElementById('to_input')),
            { types: ['geocode'] });
        // When the user selects an address from the dropdown,
        // populate the address fields in the form.
        google.maps.event.addListener(to_autocomplete, 'place_changed', function() {
            fillInAddress();
        });


        // [START region_fillform]
        function fillInAddress() {
            // Get the place details from the autocomplete object.
            var from_place = from_autocomplete.getPlace();
            var to_place = to_autocomplete.getPlace();
            console.log("from_place",from_place)
            console.log("to_place",to_place)

        }

    }


}


