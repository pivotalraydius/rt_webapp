class HomeController < ApplicationController
  require 'google_maps_service'

  def index
    mode = params[:mode]
    transit_mode = params[:transit_mode]
    start_latitude = params[:start_latitude]
    start_longitude = params[:start_longitude]
    end_latitude = params[:end_latitude]
    end_longitude = params[:end_longitude]

    start_address = params[:start_address]
    end_address = params[:end_address]

    if params[:mode]
      get_route_direction(mode,transit_mode,start_latitude,start_longitude,end_latitude ,end_longitude,start_address,end_address)
    end



  end

  def get_route_direction(modetype,transit_mode,start_latitude,start_longitude,end_latitude ,end_longitude,start_address,end_address)

    price1= 0.0
    price2= 0.0
    price3= 0.0
    gmaps = GoogleMapsService::Client.new(key: GoogleAPI::Google_Key)

    @flat_rate=0.0, @net_meterfare= 0.0,  @waiting_charge= 0.0, @peekhour_charge = 0.0 , @latehour_charge = 0.0 , @pbHoliday_charge= 0.0, @location_charge=0.0

    # Simple directions
    mode = modetype

    if modetype == "taxi"

      mode = "driving"

    elsif modetype == "bicycling"
      mode = "walking"

    end

    if transit_mode.present?
      if start_address.present?
        routes = gmaps.directions(
            start_address,
            end_address,
            transit_mode: transit_mode,
            mode: mode,
            alternatives: true)
      else
        routes = gmaps.directions(
            "#{start_latitude},#{start_longitude}",
            "#{end_latitude},#{end_longitude}",
            transit_mode: transit_mode,
            mode: mode,
            alternatives: true)
      end

    else
      if start_address.present?
        routes = gmaps.directions(
            start_address,
            end_address,
            mode: mode,
            alternatives: true)
      else
        routes = gmaps.directions(
            "#{start_latitude},#{start_longitude}",
            "#{end_latitude},#{end_longitude}",
            mode: mode,
            alternatives: true)
      end

    end


    totalestimateprice = 0.0
    @fastest_route = Hash.new
    @cheapest_route =Hash.new
    tempHash = Hash.new
    tempPrice1 = Hash.new
    tempPrice2 = Hash.new
    tempPrice3 = Hash.new


    routes =  routes if routes.size <= 1 # already sorted

    @fastest_route = routes.sort! { |x, y|x[:legs][0][:duration][:value].to_i <=> y[:legs][0][:duration][:value].to_i}


    p "fastest route"
    @fastest_route.each_with_index do |route, r_index|
      p route[:legs][0][:duration][:text]
      p route[:legs][0][:duration][:value]
    end

    # @estimate_price = 0.0

    @total_walking_distance = 0.0
    @total_estimated_time = 0.0
    totalprice = 0.0
    total_frist_walking_and_transit =0.0


    @fastest_route.each_with_index do |route, r_index|

      route_index = r_index+1
      tempid = Hash.new
      tempid[:id] = route_index
      route.merge!(tempid)
      @depature_address =  route[:legs][0][:start_address]

      if modetype == "taxi"

        drivingHash = Hash.new

        p "DRIVING"
        p total_distance_km =  (route[:legs][0][:distance][:value]* 0.001).round(1)
        p total_duration_min =  route[:legs][0][:duration][:value] / 60
        p total_estimated_fare = calculate_taxi_rate(total_distance_km, total_duration_min)

        p "calculate_taxi_rate"
        p "flat down rate"
        p @flat_rate
        p "net meter fare"
        p @net_meterfare
        p "waiting charge"
        p @waiting_charge
        p "peek hour charge"
        p @peekhour_charge
        p "late hour charge"
        p @latehour_charge
        p "public holiday charge"
        p @pbHoliday_charge
        p "location charge"
        p @location_charge


        p "total estiamte price"
        p totalestimateprice = total_estimated_fare.round(2)
        today = Time.new.utc.in_time_zone
        tempHash = Hash.new
        drivingHash= Hash.new

        drivingHash = { total_transit_price:totalestimateprice,servertime: today,flate_rate: @flat_rate, net_meter_fare: @net_meterfare,
                        waiting_charge: @waiting_charge, peek_hour_charge: @peekhour_charge,
                        late_hour_charge: @latehour_charge, public_holidy_charge: @pbHoliday_charge ,
                        location_charge: @location_charge}


        route.merge!(drivingHash)
      end


      ncd_price = 0.0
      enl_price = 0.0
      ew_ns_lrt = 0.0
      nel_ccl_dtl = 0.0
      bus_distance = 0.0

      steps = route[:legs][0][:steps]
      steps.each_with_index do |step,s_index|

        value = step[:duration][:value].to_i
        step_duration = value/60.to_f
        step_duration = step_duration.round(2).ceil
        @total_estimated_time = @total_estimated_time + step_duration

        if step[:travel_mode] == "TRANSIT"
          vehicle = step[:transit_details][:line][:vehicle]
          station = step[:transit_details][:line][:name]
          step_distance = (step[:distance][:value]* 0.001).round(1)

          if vehicle[:type] == "SUBWAY"
            if station ==  "North East Line" || station == "Circle Line" || station == "Downtown Line"
              p "NE | CC | DTL "
              p nel_ccl_dtl = nel_ccl_dtl + step[:distance][:value]
            else
              p "EW | NS | LRT "
              p ew_ns_lrt = ew_ns_lrt + step[:distance][:value]
            end
          else
            p "Bus"
            p bus_distance = step[:distance][:value]
          end


          # if vehicle[:type] == "SUBWAY"
          #
          #   p "smrt station"
          #   station = step[:transit_details][:line][:name]
          #   if station ==  "North East Line" || station == "Circle Line" || station == "Downtown Line"
          #     p "station with NE CC DT"
          #     p station
          #     p step[:distance][:value]
          #     nel_ccl_dtl = nel_ccl_dtl + step[:distance][:value]* 0.001
          #   else
          #     p "station with EW NS LRT"
          #     p station
          #     p step[:distance][:value]
          #     ew_ns_lrt = ew_ns_lrt + step[:distance][:value]* 0.001
          #   end
          #
          #   if nel_ccl_dtl >= 40.2
          #     ncd_price =  2.28
          #   elsif nel_ccl_dtl > 0
          #     CSV.foreach("db/NE-CC-DT.csv") do |row|
          #       range = row[0]
          #       num1= range.match(",").pre_match.to_f
          #       num2= range.match(",").post_match.to_f
          #
          #       if nel_ccl_dtl.between?(num1,num2)
          #         p "ncd_price"
          #         p ncd_price =  (row[1].to_i* 0.01)
          #       end
          #
          #     end
          #   end
          #
          #   if ew_ns_lrt >= 40.2
          #     enl_price =  2.03
          #
          #   elsif ew_ns_lrt > 0
          #     CSV.foreach("db/NS-EW-LRT.csv") do |row|
          #       range = row[0]
          #       num1= range.match(",").pre_match.to_f
          #       num2= range.match(",").post_match.to_f
          #
          #       if ew_ns_lrt.between?(num1,num2)
          #         p "enl_price"
          #         p enl_price =  (row[1].to_i* 0.01)
          #       end
          #
          #     end
          #   end
          #
          # else
          #   # p "bus number"
          #   # p station
          #   # p "calculate price based on buses"
          #   if step_distance >= 40.2
          #     price3 =  2.03
          #   else
          #
          #     CSV.foreach("db/sms-bus.csv") do |row|
          #       range = row[0]
          #       num1= range.match(",").pre_match.to_f
          #       num2= range.match(",").post_match.to_f
          #
          #       if step_distance.between?(num1,num2)
          #
          #         price3 =  (row[1].to_i* 0.01)
          #         price3 = price3.round(2)
          #       end
          #
          #     end
          #
          #   end
          #   tempPrice3[:estimate_price] = price3
          #   step[:distance].merge!(tempPrice3)
          #   p price3
          # end



        elsif step[:travel_mode] == "DRIVING"





        elsif step[:travel_mode] == "WALKING"

          step_distance = (step[:distance][:value]* 0.001).round(1)
          @total_walking_distance = @total_walking_distance + step_distance

          total_frist_walking_and_transit = 0.0
        end




      end

      tempTime = Hash.new
      tempTime[:total_estimated_time] = @total_estimated_time

      route.merge!(tempTime)

      fare = calculate_transit_fare(ew_ns_lrt,nel_ccl_dtl,bus_distance)

      priceHash = Hash.new
      priceHash[:total_transit_price] = fare
      p "merge to route total price"
      p  fare
      route.merge!(priceHash)


    end


    p "fastest route"
    @fastest_route.each_with_index do |route, r_index|
      p route[:legs][0][:duration][:text]
    end



  end


  def calculate_taxi_rate( total_distance_km, total_duration_min)
    p "DEPATURE ADD"
    p depature= @depature_address.downcase!
    depature= depature.to_s
    p distance = total_distance_km - 1
    total_time = total_duration_min

    @flat_rate = 3.2
    firstmeter =  0.55                # (0.22 for every 400 m | 0.55 per km thereafter or less > 1 km and ≤ 10 km)
    secondmeter = 0.63                # (0.22 for every 350 m | 0.63 per km thereafter or less > 10 km)
    waiting_rate = 0.30               # (0.22 every 45 seconds or less | 0.30 per min)
    peekhour = 0.25                   # 25% of metered fare (Monday to Friday 0600 - 0930 and 1800 – 0000 hours)
    public_holiday = 0.25             # 25% of metered fare
    late_night = 0.5                  # 50% of metered fare (0000 – 0559 hours)

    # location
    changi_airport_friday_to_Sunday = 5 # (Singapore Changi Airport: Friday - Sunday from 1700 to 0000 hours)
    changi_airport = 3
    seletar_airport = 3                   # (Seletar Airport)
    sentosa = 3                           # S$3.00 (Resorts World Sentosa)
    expo = 2                              # S$2.00 (Singapore Expo)
    waiting_min = total_distance_km/2       # for 10 km waiting time is 5mins

    p today = Time.new.utc.in_time_zone

    morning_t1 = Time.zone.parse('06:00')
    morning_t2 = Time.zone.parse('09:30')
    evening_t1 = Time.zone.parse('18:00')
    evening_t2 = Time.zone.parse('00:00')
    late_t1    = Time.zone.parse('00:00')
    late_t2    = Time.zone.parse('05:59')

    changi_t1 = Time.zone.parse('17:00')
    changi_t2 = Time.zone.parse('00:00')

    first_10km = 0.0,rest_km =0.0

    @net_meterfare= 0.0,  @waiting_charge= 0.0, @peekhour_charge = 0.0 , @latehour_charge = 0.0 , @pbHoliday_charge= 0.0, @location_charge=0.0

    if distance >  0

      p "first 10 km"
      p first_10km = 10 * firstmeter
      if distance > 10
        p "rest meter"
        restmeter = distance - 10
        p rest_km = restmeter * secondmeter
      end

      # sum of the first 10 km and rest km for net meter fare
      p "net meter fare"
      p @net_meterfare = (first_10km + rest_km).round(2)

      # calculate charge for waiting time in traffic
      @waiting_charge = (waiting_min * waiting_rate).round(2)


      # calculate charge for peek hours
      if !(today.saturday? || today.sunday?)
        p "it's weekdays"
        if today.to_f > morning_t1.to_f and today.to_f < morning_t2.to_f
          p "time is between morning peekhour"
          p @peekhour_charge = @net_meterfare * peekhour
        end
      end

      if  today.to_f > evening_t1.to_f and today.to_f < evening_t2.to_f
        p "time is between evening peekhour"
        p @peekhour_charge = @net_meterfare * peekhour
      end


      # calculate charge for late night

      if  today.to_f > late_t1.to_f and today.to_f < late_t2.to_f
        p "time is between evening peekhour"
        @latehour_charge = @net_meterfare * late_night
      end


      # calculate charge for holidays
      publicH = Holidays.on(today, :sg)

      if publicH.count == 1
        pbHoliday_charge = @net_meterfare * public_holiday
      end

      # calculate charge based on location
      if depature.include?('seletar') ||  depature.include?('sentosa') ||  depature.include?('resorts world')
        @location_charge = 3
      end

      if depature.include?('expo')
        @location_charge = 2
      end

      if depature.include?('changi') ||  depature.include?('terminal') ||  depature.include?('airport')

        if today.friday? || today.saturday? || today.sunday?
          p "today is friday to sunday"
          if  today.to_f > changi_t1.to_f and today.to_f < changi_t2.to_f
            @location_charge = 5
          else
            @location_charge = 3
          end

        else
          p "not friday nor sunday"
          p @location_charge = 3
        end
      end



      p total_estimated_fare = @flat_rate + @net_meterfare + @waiting_charge +  @peekhour_charge + @latehour_charge + @pbHoliday_charge + @location_charge


      return total_estimated_fare
    end

  end

  def street

  end

  def calculate_transit_fare(smrt, sbs, bus)

    total_distance = (smrt + sbs + bus) * 0.001
    compare_distance = []
    p 'compare_distance'
    p compare_distance.push(smrt,sbs,bus)
    max_distance = compare_distance.max
    p "look up price table"
    if max_distance == smrt
      p "SMRT"
      price_table = "db/NS-EW-LRT.csv"
      total_fare = 2.03 if total_distance >= 40.2
    elsif max_distance == sbs
      p "SBS"
      price_table = "db/NE-CC-DT.csv"
      total_fare = 2.28 if total_distance >= 40.2
    else
      p "BUS"
      total_fare = 2.03 if total_distance >= 40.2
      price_table = "db/sms-bus.csv"
    end


    if total_distance > 0
      CSV.foreach(price_table) do |row|
        range = row[0]
        num1= range.match(",").pre_match.to_f
        num2= range.match(",").post_match.to_f

        if total_distance.between?(num1,num2)
          total_fare =  (row[1].to_i* 0.01)
        end
      end
    end

    total_fare.round(2)

  end


end
