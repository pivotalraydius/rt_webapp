var roundtripMap = {

    init: function() {
        var key_suggestions = [];
        var $addinput;
        var start_lat, start_lon, end_lat,end_lon,startadd,endadd;
        var s_marker,e_marker;
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

        var map = handler.getMap();
        var markerArray = [];


        var directions = [];
        var instructios = [];
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        directionsDisplay.setMap(handler.getMap());
        // Instantiate an info window to hold step text.
        var stepDisplay = new google.maps.InfoWindow;

        var start_marker, destination_marker;


        var polylineOptions = {
            strokeColor: '#6855C9',
            strokeOpacity: 1,
            strokeWeight: 4
        };
        var walkingPolylineOptions = {
            strokeColor: '#6855C9',
            strokeOpacity: 0,
            strokeWeight: 4,
            icons: [{
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#6855C9',
                    fillOpacity: 1,
                    scale: 2,
                    strokeColor: '#6855C9',
                    strokeOpacity: 1,
                },
                offset: '0',
                repeat: '10px'
            }]
        };

        $('#setTime').timepicker();
        $('#setTime').timepicker('setTime', new Date());


        $("#from_input").on('change keydown keyup', function(){
            console.log($("#from_input").val())

            $addinput = $("#from_input");
            var basicSearch = new BasicSearch;
            var searchText = $addinput.val()
            basicSearch.searchVal = searchText;
            basicSearch.returnGeom = '1';
            basicSearch.GetSearchResults(displayData)
        });

        $("#to_input").on('change keydown keyup', function(){
            console.log($("#to_input").val())

            $addinput = $("#to_input");
            var basicSearch = new BasicSearch;
            var searchText = $addinput.val()
            basicSearch.searchVal = searchText;
            basicSearch.returnGeom = '1';
            basicSearch.GetSearchResults(displayData)

        });

        function displayData(resultData){
            var suggestions = [];
             key_suggestions = [];

            //debugger;

            var results = resultData.results;
            if (results=='No results'){
                console.log("No result(s) found")
                return false
            }
            else{
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    var latlng = row.X +","+ row.Y
                    var addname = row.SEARCHVAL

                    suggestions.push(row.SEARCHVAL);
                    //console.log(addname)
                    key_suggestions.push({name:addname,coor_x:row.X, coor_y:row.Y});
                }

            }

            console.log(key_suggestions)

            check_status = $addinput.attr("data-status")

            $addinput.autocomplete({
                focus: function( event, ui ) {
                    $addinput.val( ui.item.value );
                    return false;
                },
                source: suggestions ,
                create: function () {
                    $(this).data('ui-autocomplete')._renderItem = function (ul, item) {
                        return $('<li>')
                            .append( "<a>" + item.value + "</a>" )
                            .appendTo(ul);
                    };
                },
                select: function (event, ui){
                    $addinput.val( ui.item.value );
                    var code  = ui.item.value
                    var coor_x,coor_y;

                    for (var index in key_suggestions) {
                        console.log("check value")
                        console.log( key_suggestions[index]["name"] );
                        if (key_suggestions[index]["name"] == code){
                            coor_x =  key_suggestions[index]["coor_x"]
                            coor_y =  key_suggestions[index]["coor_y"]

                        }
                        // ...
                    }

                    if ($.isNumeric(code)){
                        $.ajax({
                            url: 'http://gothere.sg/maps/geo',
                            dataType: 'jsonp',
                            data: {
                                'output': 'json',
                                'q': code,
                                'client': '',
                                'sensor': false
                            },
                            type: 'GET',
                            success: function(data) {
                                var status;

                                var field, i, myString, placemark, status,address;
                                myString = '';
                                status = data.Status;
                                myString += 'Status.code: ' + status.code + '\n';
                                myString += 'Status.request: ' + status.request + '\n';
                                myString += 'Status.name: ' + status.name + '\n';
                                console.log(status.code)
                                if (status.code === 200) {
                                    i = 0;
                                    while (i < data.Placemark.length) {

                                        placemark = data.Placemark[i];
                                        address = placemark.address

                                        i++;
                                    }

                                    console.log(address)
                                    $addinput.val(address)


                                } else if (status.code === 603) {
                                    $addinput.val('No Record Found');
                                }
                            },
                            statusCode: {
                                404: function() {
                                    alert('Page not found');
                                }
                            }
                        });

                    }

                    console.log("result:")
                    // Initialization
                    var cv = new SVY21();
                    //// Computing Lat/Lon from SVY21
                    var resultLatLon = cv.computeLatLon( coor_y,coor_x);
                    console.log("SVY21 to lat / lon");
                    mLat = resultLatLon.lat
                    mLon = resultLatLon.lon



                    if (check_status == 0) {
                        start_lat = mLat;
                        start_lon = mLon;

                        if (start_marker != undefined) {
                            handler.removeMarkers(s_marker)
                        }

                        start_marker = [{
                            "lat":mLat,
                            "lng": mLon,
                            "picture": {
                                "url": "/assets/marker-6f538a8289542f22099aeb778f177e8c2767f6d2d7e7fccfe6965d8b07e21f68.png",
                                "width":  32,
                                "height": 32
                            },
                            "infowindow": $addinput.val()
                        }]

                        s_marker = handler.addMarkers(start_marker);
                        handler.bounds.extendWith(s_marker);
                        handler.fitMapToBounds();




                    } else{

                        end_lat = mLat;
                        end_lon = mLon;

                        if (destination_marker != undefined) {
                            handler.removeMarkers(e_marker)
                        }

                        destination_marker = [{
                            "lat": mLat,
                            "lng": mLon,
                            "picture": {
                                "url": "/assets/destination-aa36cf606c1a7d75918738830eaa38d815140329b3880d392f6a5069c1675ae7.png",
                                "width":  32,
                                "height": 32
                            },
                            "infowindow": $addinput.val()
                        }]

                        e_marker = handler.addMarkers(destination_marker);
                        handler.bounds.extendWith(e_marker);
                        handler.fitMapToBounds();





                    }


                }

            });


        }



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

        })



        $("#to_input").keydown(function (e) { if (e.keyCode == 13) {
            var from = $("#from_input").val();
            var to = $("#to_input").val();

            if(from.length && to.length) {
                console.log("Enter was pressed was presses");
                //$( "#search_btn" ).trigger( "click" );


            }else{
                alert("enter both from and to address")
            }

        } });


        $("#from_input").keydown(function (e) { if (e.keyCode == 13) {
            var from = $("#from_input").val();
            var to = $("#to_input").val();

            if(from.length && to.length) {
                console.log("Enter was pressed was presses");
                //$( "#search_btn" ).trigger( "click" );
            }
        } });


        function showPosition(position) {
            lat = position.coords.latitude;
            lng = position.coords.longitude;

            handler.getMap().setCenter(new google.maps.LatLng(lat,lng));

            handler.getMap().setZoom(13)


        }

        $("#clear_btn").on("click", function(){
            $("#from_input").val('');
            $("#to_input").val('');
            $('#setTime').timepicker('setTime', new Date());
            if (directions && directions.length > 0) {
                for (var i = 0; i < directions.length; i++)
                    directions[i].setMap(null);
            }
            directions = [];

        })

        $("#search_btn").on("click", function(){

            startadd = $("#from_input").val();
            endadd = $("#to_input").val();

            data_params = {start_latitude: start_lat, start_longitude: start_lon, end_latitude: end_lat, end_longitude: end_lon, mode: 'transit',transit_mode: 'subway'}

            console.log(data_params)
            $.ajax({
                type: 'get',
                data: data_params,
                success: function(html) {
                    var htmlobject = $(html);
                    var output = htmlobject.find("#fast_route_transit_info")[0];
                    var updateContent = new XMLSerializer().serializeToString(output);
                    $("#fast_route_transit_info").replaceWith(updateContent);

                    var output1 = htmlobject.find("#cheap_route_transit_info")[0];
                    var updateContent1 = new XMLSerializer().serializeToString(output1);
                    $("#cheap_route_transit_info").replaceWith(updateContent1);

                    $("#from_address").text(startadd);
                    $("#to_address").text(endadd);
                    $("#direction_result_wrapper").show();
                    $("#myTabContent").show();
                    $("#direction_query_wrapper").hide();

                    if (directions && directions.length > 0) {
                        for (var i = 0; i < directions.length; i++)
                            directions[i].setMap(null);
                    }
                    if (instructios && instructios.length > 0){
                        for (var i =0; i < instructios.length; i++)
                        instructios[i].setPanel(null);
                    }
                    directions = [];
                    instructios = [];


                    calculateAndDisplayRoute(directionsService, markerArray, stepDisplay, map, true, "SUBWAY");


                },
                error: function() {
                    alert('There has been an error, please alert us immediately');
                }
            });

        })

        $("#menuBack").on("click", function(){
            $("#from_input").val('');
            $("#to_input").val('');
            $("#direction_result_wrapper").hide();
            $("#myTabContent").hide();
            $("#direction_query_wrapper").show()

            if (directions && directions.length > 0) {
                for (var i = 0; i < directions.length; i++)
                    directions[i].setMap(null);
            }
            directions = [];

            start_marker.setMap(null);
            destination_marker.setMap(null);

        })

        //var  from_autocomplete, to_autocomplete;
        //
        //
        //from_autocomplete = new google.maps.places.Autocomplete(
        //    /** @type {HTMLInputElement} */(document.getElementById('from_input')),
        //    { types: ['geocode'] });
        //// When the user selects an address from the dropdown,
        //// populate the address fields in the form.
        //google.maps.event.addListener(from_autocomplete, 'place_changed', function() {
        //    fillInAddress();
        //});
        //
        //to_autocomplete = new google.maps.places.Autocomplete(
        //    /** @type {HTMLInputElement} */(document.getElementById('to_input')),
        //    { types: ['geocode'] });
        //// When the user selects an address from the dropdown,
        //// populate the address fields in the form.
        //google.maps.event.addListener(to_autocomplete, 'place_changed', function() {
        //    fillInAddress();
        //});
        //
        //
        //// [START region_fillform]
        //function fillInAddress() {
        //    // Get the place details from the autocomplete object.
        //    var from_place = from_autocomplete.getPlace();
        //    var to_place = to_autocomplete.getPlace();
        //    console.log("from_place",from_place)
        //    console.log("to_place",to_place)
        //
        //}




        function change_route_by_type(obj){

            type = $(obj).attr('data-type');

            var selectedMode,selectedType;
            if (type == 'bus'){
                selectedMode = "transit";
                selectedType = "bus"
                is_transit = true
                transport_type = "BUS"

            }else if(type == "train"){
                selectedMode = "transit";
                selectedType = "subway"
                is_transit = true
                transport_type = "SUBWAY"

            }else if(type == "taxi"){
                selectedMode = "taxi";
                selectedType = ""
                is_transit = false
                transport_type = "DRIVING"

            }else{
                selectedMode = "driving";
                selectedType = "driving"
                is_transit = false
                transport_type = "DRIVING"
            }

            $.ajax({
                type: 'get',
                data: {start_latitude: start_lat,start_longitude: start_lon,end_latitude: end_lat,end_longitude: end_lon, mode: selectedMode,transit_mode: selectedType},
                success: function(html) {
                    var htmlobject = $(html);
                    var output = htmlobject.find("#fast_route_transit_info")[0];
                    var updateContent = new XMLSerializer().serializeToString(output);
                    $("#fast_route_transit_info").replaceWith(updateContent);

                    var output1 = htmlobject.find("#cheap_route_transit_info")[0];
                    var updateContent1 = new XMLSerializer().serializeToString(output1);
                    $("#cheap_route_transit_info").replaceWith(updateContent1);


                    $("#direction_result_wrapper").show();
                    $("#myTabContent").show();


                    if (directions && directions.length > 0) {
                        for (var i = 0; i < directions.length; i++)
                            directions[i].setMap(null);
                    }
                    directions = [];

                    calculateAndDisplayRoute(directionsService, markerArray, stepDisplay, map, is_transit, transport_type);


                    $('.transport_type').each(function(index, obj){
                        //you can use this to access the current item
                        $(obj).removeClass("active_mode")
                    });

                    $(obj).find( "span").addClass("active_mode")
                },
                error: function() {
                    alert('There has been an error, please alert us immediately');
                }
            });


        }

        function draw_bustrain_line(obj){
            //route = $(obj).attr('data-route-legs');
            //time = $(obj).attr('data-route-total-estimated-time');
            //price = $(obj).attr('data-route-total-transit-price');
            //console.log("get route");
            //console.log(route)
            //console.log(time)
            //console.log(price)

            //$("#myTabContent").hide();
            //$("#route_instruction_wrapper").show();

        }


        function calculateAndDisplayRoute(directionsService,markerArray, stepDisplay, map, is_transit, transit_mode) {
            //var selectedMode = "TRANSIT";
            // First, remove any existing markers from the map.
            $("#route_instruction_wrapper").html("")
            for (var i = 0; i < markerArray.length; i++) {
                markerArray[i].setMap(null);
            }

            if (is_transit == true){
                var request = {
                    origin: {lat: start_lat, lng: start_lon},
                    destination: {lat: end_lat, lng: end_lon},
                    travelMode: google.maps.TravelMode.TRANSIT,
                    transitOptions: {
                        modes: [google.maps.TransitMode[transit_mode]],
                    },
                    provideRouteAlternatives: true
                };
            }else{
                var request = {
                    origin: {lat: start_lat, lng: start_lon},
                    destination: {lat: end_lat, lng: end_lon},
                    travelMode: google.maps.TravelMode[transit_mode],
                    provideRouteAlternatives: true
                };
            }


            // Retrieve the start and end locations and create a DirectionsRequest using

            directionsService.route(request, function(response, status) {
                // Route the directions and pass the response to a function to create
                console.log(response)
                console.log(response.routes[0])

                var iconSequence = {
                    icon: {
                        fillColor: '#6855C9', //or hexadecimal color such as: '#FF0000'
                        fillOpacity: 0.8,
                        scale: 3,
                        strokeColor: '#6855C9',
                        strokeWeight: 1,
                        strokeOpacity: 0.8,
                        path: google.maps.SymbolPath.CIRCLE
                    },
                    repeat: '10px'
                };


                if (status == google.maps.DirectionsStatus.OK) {
                    for (var i = 0, len = response.routes.length; i < len; i++) {

                        //renderer.setDirections(response);
                        //renderer.setMap(map);
                        //renderDirectionsPolylines(response);

                        directions.push(new google.maps.DirectionsRenderer({
                            panel: document.getElementById('route_instruction_wrapper'),
                            map: map,
                            directions: response,
                            routeIndex: i,
                            polylineOptions: {
                                strokeColor: '#6855C9',
                                strokeWeight: 6,
                                strokeOpacity: 0.7
                            },
                            DottedPolylineOptions: iconSequence,
                            suppressMarkers: true
                        }));

                        var transitLayer = new google.maps.TransitLayer();
                        transitLayer.setMap(map);

                        //showSteps(response, markerArray, stepDisplay, map);
                    }
                } else {
                    window.alert('Directions request failed due to ' + status);
                }



            });
        }



        function showSteps(directionResult, markerArray, stepDisplay, map) {
            // For each step, place a marker, and add the text to the marker's infowindow.
            // Also attach the marker to an array so we can keep track of it and remove it
            // when calculating new routes.
            var myRoute = directionResult.routes[0].legs[0];
            for (var i = 0; i < myRoute.steps.length; i++) {
                var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
                marker.setMap(map);
                marker.setPosition(myRoute.steps[i].start_location);
                attachInstructionText(
                    stepDisplay, marker, myRoute.steps[i].instructions, map);
            }
        }

        function attachInstructionText(stepDisplay, marker, text, map) {
            google.maps.event.addListener(marker, 'click', function() {
                // Open an info window when the marker is clicked on, containing the text
                // of the step.
                stepDisplay.setContent(text);
                stepDisplay.open(map, marker);
            });
        }


        window.draw_bustrain_line = draw_bustrain_line
        window.change_route_by_type = change_route_by_type


        //iconSequence must be a single instance of google.maps.IconSequence object
        google.maps.DirectionsRenderer.prototype.setDottedPolylineOptions = function (iconSequence) {
            //need a reference to the current 'this' object
            var obj = this;
            //in case this DirectionsRenderer's directions were just set an instant ago,
            //need a slight delay before we may access the j.polylines property of this object
            window.setTimeout(function () {
                console.log("override prototype")
                var i,
                    lines = obj.j.polylines,
                    len = lines.length;
                for (i = 0; i < len; i++) {
                    if (lines[i].icons) {
                        lines[i].setOptions(
                            {
                                icons: [iconSequence]
                            }
                        );
                    }
                }
            },1);
        };


    }




}


