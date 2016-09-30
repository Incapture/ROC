# ROC
Rapture Operator Console

Steps to run:
1. Start RaptureWebServer

2. Install the EntityTest, Widgets, DataEntities and DataSets features; run relevant script to import data.
E.g. for getting country-related data into our system:
i. cd ~/Rapture/Plugins/EntityTest; gradle clean installApp; cd ..; ./featTest.sh
ii. cd ~/Rapture/Plugins/Widgets; gradle clean installApp; cd ..; ./featWidget.sh
iii. cd ~/Rapture/Plugins/DataEntities; gradle clean installApp
iv. cd ~/Rapture/Plugins/DataSets; gradle clean installApp; cd ..; ./featDS.sh
v. cd ~/Rapture/Plugins/TestScripts/ImportCountries/; ~/Rapture/Apps/ReflexRunner/build/install/ReflexRunner/bin/ReflexRunner -u rapture -p rapture -r http://localhost:8665/rapture -f import.script

3. In ROC's root directory, run "npm install" to install all NPM dependencies.

4. Now run "node server.js". 

ROC should be up and running on http://localhost:8081
