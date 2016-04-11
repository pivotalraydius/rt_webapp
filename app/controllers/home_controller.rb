class HomeController < ApplicationController
  def index

    @google_apikey =  GoogleAPI::Google_Key
  end
end
