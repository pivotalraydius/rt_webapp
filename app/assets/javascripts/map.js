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

        var $addinput;

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

            console.log(resultData)
            console.log($addinput)
            //debugger;
            var suggestions = [];
            var results = resultData.results;
            if (results=='No results'){
                console.log("No result(s) found")
                return false
            }
            else{
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    suggestions.push(row.SEARCHVAL);
                }

            }

            $addinput.autocomplete({
                source: suggestions ,
                select: function (event, ui){
                    var code  = $addinput.val()
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
                $( "#search_btn" ).trigger( "click" );
            }else{
                alert("enter both from and to address")
            }

        } });


        $("#from_input").keydown(function (e) { if (e.keyCode == 13) {
            var from = $("#from_input").val();
            var to = $("#to_input").val();

            if(from.length && to.length) {
                console.log("Enter was pressed was presses");
                $( "#search_btn" ).trigger( "click" );
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
        })

        $("#search_btn").on("click", function(){

            var startadd = $("#from_input").val();
            var endaddd = $("#to_input").val();



            $.ajax({
                type: 'get',
                data: {start_address: startadd,end_address: endaddd, mode: 'transit'},
                success: function(html) {
                    var htmlobject = $(html);
                    var output = htmlobject.find("#fast_route_transit_info")[0];
                    var updateContent = new XMLSerializer().serializeToString(output);
                    $("#fast_route_transit_info").replaceWith(updateContent);

                    var output1 = htmlobject.find("#cheap_route_transit_info")[0];
                    var updateContent1 = new XMLSerializer().serializeToString(output1);
                    $("#cheap_route_transit_info").replaceWith(updateContent1);

                    $("#from_address").text(startadd);
                    $("#to_address").text(endaddd);
                    $("#direction_result_wrapper").show();
                    $("#myTabContent").show();
                    $("#direction_query_wrapper").hide();

                },
                error: function() {
                    alert('There has been an error, please alert us immediately');
                }
            });

        })

        $("#menuBack").on("click", function(){

            $("#direction_result_wrapper").hide();
            $("#myTabContent").hide();
            $("#direction_query_wrapper").show()

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



        //window.search = search

        function draw_bustrain_line(route_id){
            alert(route_id)
            $.ajax({
                type: 'get',
                data: {route_id: route_id},
                success: function(html) {
                    //var htmlobject = $(html);
                    //var output = htmlobject.find("#fast_route_transit_info")[0];
                    //var updateContent = new XMLSerializer().serializeToString(output);
                    //$("#fast_route_transit_info").replaceWith(updateContent);
                    //
                    //var output1 = htmlobject.find("#cheap_route_transit_info")[0];
                    //var updateContent1 = new XMLSerializer().serializeToString(output1);
                    //$("#cheap_route_transit_info").replaceWith(updateContent1);
                    //
                    //$("#from_address").text(startadd);
                    //$("#to_address").text(endaddd);
                    //$("#direction_result_wrapper").show();
                    //$("#myTabContent").show();
                    //$("#direction_query_wrapper").hide();

                },
                error: function() {
                    alert('There has been an error, please alert us immediately');
                }
            });

        }

        window.draw_bustrain_line = draw_bustrain_line

    }




}


