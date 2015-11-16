##Automating RPAT Runs for Sensitivity Analysis  
####Brian Gregor, P.E.  
####Oregon Systems Analytics LLC  
####November 16, 2015  

###Purpose  
The Rapid Policy Assessment Tool (RPAT) is a strategic planning model for metropolitan areas which enables users to analyze the effects of different land use and transportation scenarios on a number of outcomes such as emissions, congestion, vehicle travel, and costs. The RPAT program is set up to set up and run one scenario at a time using a graphical user interface (GUI). This memo describes an alternate way of running RPAT which automates the setup and running of scenarios. The objective of an automated process is to enable sensitivity testing where alternative input levels are defined for various categories of inputs and scenarios are created from different combinations of input category levels. For example, if two levels of public transit inputs are defined and three levels of roadway inputs are defined, then six scenarios would be created from all of the combinations of levels for those two input categories. In addition to describing procedures for automating the setup and running of scenarios, this memo describes methods for processing the RPAT outputs to create summary tables, and for creating a dynamic data visualization to enable uses to interact with the outputs.  

###Modifying RPAT  
The RPAT distribution is an executable that installs a number of things including:  
- The R computer language that is used to carry out the RPAT calculations, supplemental R packages that the calculations rely on, and R scripts that carry out the calculations;  
- The Python computer language and supporting Python programs that are used to implement the GUI; and  
- Demo parameter and input files.  

Only three R scripts are needed from the RPAT distribution in order to run RPAT in an automated manner as described in this memo. These are:  
- SmartGAP.r  
- SmartGAP_Inputs.r  
- SmartGAP_Sim.r  

Two other files should be copied, although they are unnecessary in order to run RPAT. These include the “license.txt” file which is the software license for the code, and the “outputs.csv” file which describes the RPAT outputs. The latter is valuable documentation of the measurement units of the outputs.  

The rest of the RPAT distribution is unnecessary except that R will need to be installed on the computer and several R packages will need to be installed as well: jsonlite, reshape, data.table. These packages can be installed by entering the following command in the R console:  

`Install.packages(c(“jsonlite”, “reshape”, “data.table”))`  

There is no GUI for running the RPAT in this automated manner so a basic familiarity of how to run R scripts using the R console will be necessary. 

Another consideration for running RPAT in this manner is that it enables RPAT to be run on computers running the Linux or Macintosh operating systems. To date, the RPAT installer only works on Windows computers.

In order to run RPAT in an automated manner, the “SmartGAP.r” script will need to be modified by commenting out several lines of the script so that they are not run. This has already been done in the copy of the script that is included in the software repository accompanying this memo. 

Two additional R scripts have been written to enable automated scenario creation and runs:  
- make_scenarios.r  
- run_many_scenarios.r  
The "make_scenarios.r" script creates all the scenarios by combining inputs from all of the input category levels. These are saved in a directory named "scenarios". The "run_many_scenarios.r" script runs RPAT for each of the scenarios that have been created. After the runs have been completed, the script creates and saves several output tables which combine the outputs for all the scenarios. It also creates a file named "summary_comparison.csv" lists for each scenario, the level for each input category and six output measures: fatality/injury rate (fatality and injury accidents per year per 1000 persons), average household cost (dollars per person per year), average daily vehicle miles traveled (DVMT per person), average emissions (metric tons per person per year), fuel consumption (gallons per person per year), vehicle delay due to congestion (vehicle-hours per person per year). In addition, the script writes out this table in a javascript format that is used in a dynamic data visualization.  

The files for an automated RPAT application are set up at follows (directories, i.e. folders, are noted by {}):
```
    {factors}    
        {common}    
        {unique}    
        readme.txt    
    {parameters}    
    {scenarios}    
    {scripts}    
        license.txt    
        outputs.csv    
        SmartGAP.r    
        SmartGAP_Inputs.r    
        SmartGAP_Sim.r    
    make_scenarios.r    
    run_many_scenarios.r    
```
The "factors" directory contains organized in two directories. The "common" directory contains all of the inputs that are common to all scenarios. The "unique" directory organizes inputs by category and level. This is described in more detail in the next section. The directories included in this repository show an example of how these inputs can be organized. The "readme.txt" file provides a short explanation of the categories and levels.    

The "parameters" directory includes all of the RPAT parameter files.    

The "scenarios" directory is initially an empty directory. It is populated with the scenario inputs when the "make_scenario.r" script is run. It is populated with the scenario outputs when the "run_many_scenarios.r" script is run.    
    
###Setting Up and Creating Sensitivity Scenarios    
Scenario inputs are placed in the "factors" directory. Inputs that are common to all scenarios are placed in the "common" directory. Inputs that vary by scenario are placed in the "unique" directory. The unique directory contains a subdirectory for each input category for which several levels of inputs are to be defined. An input category can address one or more input files. The example in this repository has only one file per category. One could, however, define categories based on several input files. For example, a community design category could be defined with respect to input files for place type growth, transportation supply growth, and parking growth. The demo files included in this repository organize the categories are levels as follows:  
```
B - Bikes/Light vehicles (light_vehicles.csv)
	1- Base bike diversion (9.75%)
	2- Double bike diversion (19.5%) 
C - Cost (vmt_charge.csv)
	1- Base, no charge
	2- 4 cents per mile
	3- 8 cents per mile
D - Demand Management (commute_options.csv)
	1- Base
	2- Double all participation rates	
	3- Double all participation rates and transit subsidy level
L - Land Use - (place_type_growth.csv)
	1- Base, growth proportions same as base proportions
	2- Half suburban population and employment growth (-13%), distribute to urban core R/E (+4%), urban core MU (+5%), and close in communities R/E (+4%)
P - Parking (parking.csv)
	1- Base, existing costs and proportions paid
	2- Increase parking fees to 20% of workforce and 20% of other
	3- Same as 2 but double parking cost
T - Transit (transit_growth.csv)
	1- Base, supply stays at present level
	2- Double transit supply
	3- Triple transit supply
```    

The inputs for each category are placed in a separate directory. The convention for naming these directories is to use a single capital letter. For example, "B" might be used for the bicycling category. Within each category directory there directories for each level. The convention is to name these with single numbers. The reason for this convention is that the created scenarios are named using the category and level directory names. This enables you to determine the nature of the scenario from the scenario name. For example, considering the example above, a scenario named "B1C3D2L1P3T1" would mean: bike/light-vehicle level 1, cost level 3, demand management level 2, land use level 1, parking level 3, transit level 1.    

The total number of scenarios is the product of the number of levels in each category. If you run the demo, 324 scenarios will be created.

Once all the input files have been set up, start the R console and set the working directory in the directory where all of the files and folders have been set up. In the case of the demonstration files this would be the "multi-run" directory. There are several ways this can be done including:    
1) Using the "setwd" function,    
2) Launching the R console from an R shortcut that you copy into the directory. The "Start in:" value of the shortcut properties must be blank.    
3) If RStudio is installed, start a new project in the directory.    

Once the R console is running, run the "make_scenarios.r" script. That can be done in several ways including:    
1) Dragging and dropping the file from a file explorer window to the R console window,     
2) Entering `source("make_scenarios.r")` in the console, or
3) Opening the script in RStudio and running it from there.

###Running RPAT for Sensitivity Scenarios    
After the scenarios have been created, run the "run_many_scenarios.r" script in the same way to run RPAT for each scenario and create summary output datasets. It will likely take several hours to complete all of the runs. The amount of time will depend on the number of scenarios and the size of the metropolitan area. 

Before running the script it important to check that there is plenty of room on the computer hard disk to store all of the output files that will be generated during the model runs. The demo generates about 9 megabytes per scenario. That is for a fairly small metropolitan area (approximately 70 thousand persons).


###Producing the Web-based Visualization
Among other things, running the "run_many_scenarios.r" script creates a file named "metro-measures.js" in the "scenarios" directory. This file can be used in the "VizRPAT" dynamic data display web application. This application enables users to query the data dynamically to gain a better understanding of how sensitive various outputs are to the inputs. The "metro-measures.js" file is copied into the "data" directory of the "VizRPAT" directory. The web app is started by opening the "index.html" file in your web browser. This will not work in older versions of Internet Explorer.    

It should be noted that VizRPAT is only able to display scenario results when the categories, number of levels, and output measures are exactly the same as in the demo. Changing any of these things requires rewriting sections of the "index.html" file. VizRPAT will be changed in the future so that it can accommodate different categories, levels, and measures.
