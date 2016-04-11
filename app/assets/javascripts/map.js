var roundtripMap = {

    init: function() {
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
                markers = handler.addMarkers([
                    {
                        "lat": 1.317907,
                        "lng": 103.843643,
                        "infowindow": "hello!"
                    }
                ]);
                handler.bounds.extendWith(markers);
                handler.fitMapToBounds();
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

        var api_key = "#{@google_apikey}"
        console.log(api_key)

        $("#swapIcon").on("click",function(){

            var $inputC = $("#from_input");
            var $inputD = $("#to_input");
            var temp = $inputC.val();
            $inputC.val($inputD.val());
            $inputD.val(temp);

        })

    }
}


