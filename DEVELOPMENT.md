Service names are never changed:
- `ide` is always about browser IDE
- `app` about web application
- `custom_service` about your own service connected to the docker stack,
the example could be `app_ws` - service for communicating front and back using websockets,
for example we might want to use PHP Workerman lib.

Usage scenarios:
- scaffold sandbox
- run/stop sandbox
- en/dis specific service
- edit specific service, eg. exposing port of the service, ex. run workernman inside php service and expose workerman on 6002 port
- add new service



Suggestions to add new custom services.
Wodby provide us some default images like `wodby/adminer:$ADMINER_TAG`. Let's suggest the latest image version from github,
Allow user to define custom image: `Enter service version: 1.14`.
But often we need completely different image to build custom service, for example we might want to use TestCafe image,
ro run tests for our app.
[TBD] - define what we need from docker stack to run tests in this case.

- provider (wodby, tokaido)
- 


Check: 

Bundling CLI into single executable package
Running CLI on Mac and Debian

Tasks:
- install script
-- including requirements


```shell script
sandbox up
sandbox cmd provision
sandbox cmd installDrupal
sandbox config:set service.php version
```

sandbox could be run from any location.
So if you will be inside project dir then app tries to find project root: [ROOT]/.config/sandbox/config


DESIGN TASKS:
- make global service to get configs
- make service to log, debug events (to cli, or file)


~/projects/UW/frank/web_app/sandbox/bin/run

Fix owners on creating docker-compose.yml in proj dir
