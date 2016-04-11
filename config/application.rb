require File.expand_path('../boot', __FILE__)

require 'rails/all'
require 'csv'
# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module RtWebapp
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end


module GoogleAPI
  Google_Key = "AIzaSyCmCjZVJvI5h2Qg7XcdI9jTFjyK-IgzyQk"
end