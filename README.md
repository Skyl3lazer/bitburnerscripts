# bitburnerscripts
Scripts for BitBurner (Now on steam!)

Important: The way weights work has changed! The default values are closer to where you want to be, you might want to update your weights.

scanall.ns - Scans the tree of servers and puts their data into serverlist.txt (this will be used as a pseudo DB)

alphanuke.ns - Nukes all available servers every 30s based on what .exe's are available to you. Stops running once they're all hacked.

stonks.ns - Requires 4s TIX. Buy good stocks, sells bad ones. No manipulation. 

skysettings.ns - Configuration settings

hack/

..targetfinder.ns - Main script. Analyzes available hackable targets, sends Orders to port 1. Reads ports 2 and 3 for info on accepted orders and completed orders. Also fires off client.ns.

..client.ns - Coordinates Order (from port1) threads among hacked machines. Responds to accepted orders and completed orders on ports 2/3.

..grow/weaken.ns - Basic grow/weaken scripts

..hack.ns - Basic hack script, with configurable toasts

Configuration (in skyconfig)

	//Servers you never want to hack
	var exclude = ["home", "n00dles", "darkweb", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", ".", "The-Cave"];
	
	//Server priority scores are calculated like this
	//(((weight_maxMoney / server.maxMoney) * server.maxMoney) + server.maxMoney) * ((server.growth / 1000) * weight_growth)
	
	//How much weight you put on maxMoney. More = more weight.
	weight_maxMoney: 1,
	//How much weight you put on growth. More = more weight.
	weight_growth: 1500,
	
	//Don't hack if security is below this threshhold (plus base min)
	var securityThresh = 0; 
	
	//Don't start hwgw if money is below maxMoney * moneyThresh
	var moneyThresh = .65; 
	
	//Maximum amount of servers you want to concurrently be trying to hack (starting with most efficient)
	var maxConcurrent = 3; 
	
	//Won't run more than this many hack threads at once
	var hackThreadThresh = 15000; 
	
	//ms to delay between command ends in a hwgw
	var batchOffset = 5000;
	
	//How many chained hwhw will be placed on each concurrent server at most.
	//If this number is large, you'll basically only hack the most efficient server constantly
	var maxBatchSize = 99;
	
	//The prefix for your custom purchased servers
	var namedServerPrefix = "pserv";
	
	//Won't fill this many gb of ram on home, so you have a bit of free room to play with
	saveHomeRam: 64
