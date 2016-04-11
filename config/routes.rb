Rails.application.routes.draw do
  root 'home#index'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'

  namespace :api do

    match "roundtrip/get_route_by_travelMode"       => "roundtrip#get_route_by_travelMode"      , via: [:get, :post]
    match "roundtrip/driving_route_mode"            => "roundtrip#driving_route_mode"           , via: [:get, :post]
    match "roundtrip/bicycling_route_mode"          => "roundtrip#bicycling_route_mode"         , via: [:get, :post]
    match "roundtrip/walking_route_mode"            => "roundtrip#walking_route_mode"           , via: [:get, :post]

  end
end
