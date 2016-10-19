# ROC
### Rapture Operator Console

Steps to run:

1. Start RaptureWebServer

2. Install the EntityTest, Widgets, DataEntities and DataSets features; run relevant script(s) to import data.
E.g. for getting country- and currency-related data into our system:

  -   ```cd ~/Rapture/Plugins/EntityTest; gradle clean installApp; cd ..; ./featTest.sh```
  -   ```cd ~/Rapture/Plugins/Widgets; gradle clean installApp; cd ..; ./featWidget.sh```
  -   ```cd ~/Rapture/Plugins/DataSets; gradle clean installApp```
  -   ```cd ~/Rapture/Plugins/DataEntities; gradle clean installApp```
  -   ```cd ..; ./featDS.sh``` _(NOTE: this installs DataSets and DataEntities)_
  -   ```cd ~/Rapture/Plugins/TestScripts/ImportCountries/; ~/Rapture/Apps/ReflexRunner/build/install/ReflexRunner/bin/ReflexRunner -u rapture -p rapture -r http://localhost:8665/rapture -f import.script```_(NOTE: this imports country data)_
  -   ```cd ~/Rapture/Plugins/TestScripts/ImportCountries/; ~/Rapture/Apps/ReflexRunner/build/install/ReflexRunner/bin/ReflexRunner -u rapture -p rapture -r http://localhost:8665/rapture -f importCCY.script``` _(NOTE: this imports currency data)_

3. In ROC's root directory, run ```npm install``` to install all NPM dependencies.

4. (Optional step: ONLY IF you do not have the latest private modules from https://github.com/Incapture/RaptureJS under ROC/node_modules_incapture/):
  - pull/fork a local copy of the RaptureJS repository (https://github.com/Incapture/RaptureJS)
  - In ROC's root directory, run ```gulp rapturejs-latest --loc ~/RaptureJS/ --modules '["core-auth"]'``` _(where 'loc' is the location of RaptureJS on your local, 'modules' is an array of modules that you want your project to utilize)_

5. Now run ```node server.js```

ROC should be up and running at http://localhost:8081
