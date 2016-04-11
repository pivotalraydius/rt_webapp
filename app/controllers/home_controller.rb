class HomeController < ApplicationController
  require 'google_maps_service'

  def index
    @google_apikey =  GoogleAPI::Google_Key
  end

end
