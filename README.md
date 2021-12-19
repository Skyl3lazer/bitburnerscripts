# bitburnerscripts
Scripts for BitBurner (Now on steam!)

scanall.ns - Scans the tree of servers and puts their data into serverlist.txt (this will be used as a pseudo DB)

alphanuke.ns - Nukes all available servers every 30s based on what .exe's are available to you. Stops running once they're all hacked.

hack/

..targetfinder.ns - Main script. Analyzes available hackable targets, sends Orders to port 1. Reads ports 2 and 3 for info on accepted orders and completed orders. Also fires off client.ns.

..client.ns - Coordinates Order (from port1) threads among hacked machines. Responds to accepted orders and completed orders on ports 2/3.

..grow/weaken.ns - Basic grow/weaken scripts

..hack.ns - Basic hack script, with configurable toasts

Configuration (in targetfinder)

	//Servers you never want to hack
	var exclude = ["home", "n00dles", "darkweb", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", ".", "The-Cave"];
	
	//How much weight you put on maxMoney. More = more weight.
	var weight_maxMoney = 10;
	
	//How much weight you put on growth. More = more weight.
	var weight_growth = 2000000;
	
	//Don't hack if security is below this threshhold (plus base min)
	var securityThresh = 0; 
	
	//Don't start hwgw if money is below maxMoney * moneyThresh
	var moneyThresh = .65; 
	
	//Maximum amount of servers you want to concurrently be trying to hack (starting with most efficient)
	var maxConcurrent = 3; 
	
	//Won't run more than this many hack threads at once
	var hackThreadThresh = 15000; 
	
	//ms to delay between command ends in a hwgw
	var batchOffset = 2500;
	
	//How many chained hwhw will be placed on each concurrent server at most.
	//If this number is large, you'll basically only hack the most efficient server constantly
	var maxBatchSize = 99;