# bitburnerscripts
Scripts for BitBurner (Now on steam!)

scanall.ns - Scans the tree of servers and puts their data into serverlist.txt (this will be used as a pseudo DB)

hack/

..targetfinder.ns - Main script. Analyzes available hackable targets, sends Orders to port 1. Reads ports 2 and 3 for info on accepted orders and completed orders. Also fires off client.ns

..client.ns - Coordinates Order (from port1) threads among hacked machines. Responds to accepted orders and completed orders on ports 2/3.

..grow/weaken.ns - Basic grow/weaken scripts

..hack.ns - Basic hack script, with configurable toasts