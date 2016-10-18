# ROC
### Rapture Operator Console

Steps to run:

1. Start RaptureWebServer

2. Install the EntityTest, Widgets, DataEntities and DataSets features; run relevant script(s) to import data.

E.g. for getting country- and currency-related data into our system:

- cd ~/Rapture/Plugins/EntityTest; gradle clean installApp; cd ..; ./featTest.sh
- cd ~/Rapture/Plugins/Widgets; gradle clean installApp; cd ..; ./featWidget.sh
- cd ~/Rapture/Plugins/DataSets; gradle clean installApp
- cd ~/Rapture/Plugins/DataEntities; gradle clean installApp
- cd ..; ./featDS.sh (NOTE: this installs DataSets and DataEntities)
- cd ~/Rapture/Plugins/TestScripts/ImportCountries/; ~/Rapture/Apps/ReflexRunner/build/install/ReflexRunner/bin/ReflexRunner -u rapture -p rapture -r http://localhost:8665/rapture -f import.script (NOTE: this imports country data)
- cd ~/Rapture/Plugins/TestScripts/ImportCountries/; ~/Rapture/Apps/ReflexRunner/build/install/ReflexRunner/bin/ReflexRunner -u rapture -p rapture -r http://localhost:8665/rapture -f importCCY.script (NOTE: this imports currency data)

3. In ROC's root directory, run "npm install" to install all NPM dependencies.

4. Install private module(s): gulp rapturejs-latest --loc ~/RaptureJS/ --modules '["core-auth"]'

5. Now run "node server.js".

ROC should be up and running on http://localhost:8081
