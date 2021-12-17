export async function main(ns) {
	//disableLog("ALL");
	////Runs scriptToUpdate across all <=2 port servers, and advScriptToUpdate on >=3.
	//These can be the same script, but eventually they'll start eating all the money on a server in a tick
	
	//Configuration
	var target = "joesguns";
	var advTarget = "megacorp";
	var scriptToUpdate = "basichack.script";
	var advScriptToUpdate = "advhack.script";
	var maxDepth = 15;
	var maxHack = 1;
	
	
	var depthOneServers = scan("home");
	var completedServers = ["home"];
	var hasChildServers = depthOneServers.length > 0 ? true : false;
	var serverIterator = depthOneServers;
	var currentDepth = 0;
	
	print(depthOneServers.length + " servers Depth 0");
	
	while (currentDepth < maxDepth && hasChildServers) {
		var childServers = [];
		for (var i = 0; i < serverIterator.length; i++) {
			var current = serverIterator[i];
			var portsReq = getServerNumPortsRequired(current);
			if (hasRootAccess(current) && portsReq < 3) {
				TransferAndRun(current);
				} else if ((hasRootAccess(current) && portsReq >= 3)) {
				TransferAndRun(current, true);
				} else if (portsReq === 0) {
				print("Nuking " + current);
				nuke(current);
				TransferAndRun(current);
				} else if (maxHack >= 1 && portsReq == 1) {
				print("BruteSSH " + current);
				brutessh(current);
				print("Nuking " + current);
				nuke(current);
				TransferAndRun(current);
				} else if (maxHack >= 2 && portsReq == 2) {
				print("BruteSSH " + current);
				brutessh(current);
				print("FTPCracking " + current);
				ftpcrack(current);
				print("Nuking " + current);
				nuke(current);
				TransferAndRun(current);
				} else if (maxHack >= 3 && portsReq == 3) {
				print("relaySMTP " + current);
				relaysmtp(current);
				print("BruteSSH " + current);
				brutessh(current);
				print("FTPCracking " + current);
				ftpcrack(current);
				print("Nuking " + current);
				nuke(current);
				TransferAndRun(current, true);
				} else if (maxHack >= 4 && portsReq == 4) {
				print("HTTPworm " + current);
				httpworm(current);
				print("relaySMTP " + current);
				relaysmtp(current);
				print("BruteSSH " + current);
				brutessh(current);
				print("FTPCracking " + current);
				ftpcrack(current);
				print("Nuking " + current);
				nuke(current);
				TransferAndRun(current, true);
				} else if (maxHack >= 5 && portsReq == 5) {
				print("SQLInject " + current);
				sqlinject(current);
				print("HTTPworm " + current);
				httpworm(current);
				print("relaySMTP " + current);
				relaysmtp(current);
				print("BruteSSH " + current);
				brutessh(current);
				print("FTPCracking " + current);
				ftpcrack(current);
				print("Nuking " + current);
				nuke(current);
				TransferAndRun(current, true);
				} else {
				print(current + " is not <= " + maxHack + " port(s) required to hack.");
			}
			if (portsReq <= maxHack) {
				HackAtHome(current);
			}
			childServers = childServers.concat(scan(current));
			//if(current.startsWith())
		}
		
		serverIterator = childServers.filter(function (el) {
			return !completedServers.includes(el);
		});
		
		print(serverIterator.toString());
		
		if (serverIterator.length > 0) {
			hasChildServers = true;
			} else {
			hasChildServers = false;
			print("No accessible servers remaining.");
		}
		currentDepth++;
		print(serverIterator.length + " new children at depth " + currentDepth);
	}
	
	if (currentDepth == maxDepth) {
		print("Reached max depth");
	}
	
	function HackAtHome(current) {
		var maxMoney = getServerMaxMoney(current);
		var moneyThreadsToRun = Math.floor(maxMoney / 5000000);
		var hat = hackAnalyzeThreads(current, maxMoney);
		var maxThreadsToRun = Math.floor(hat);
		
		// This line can be deleted if hackAnalyzeThreads is updated 
		// https://www.reddit.com/r/Bitburner/comments/crm3g3/hackanalyzethreads_doesnt_work_as_expected/
		maxThreadsToRun = moneyThreadsToRun;
		//
		
		var threadsToRun = maxThreadsToRun < moneyThreadsToRun ? maxThreadsToRun : moneyThreadsToRun;
		if (threadsToRun > 0 && current != target && current != advTarget) {
			kill(scriptToUpdate, "home", current);
			exec(scriptToUpdate, "home", threadsToRun, current);
		}
	}
	
	function TransferAndRun(current, advanced) {
		var sc = advanced || 0 ? advScriptToUpdate : scriptToUpdate;
		var threadCount = Math.floor(getServerMaxRam(current) / getScriptRam(sc, "home"));
		if (threadCount === 0) {
			print("Not enough RAM to run script");
			completedServers.push(current);
			return;
			} else {
			print("Server " + current + " can run " + threadCount + " threads");
			scp(sc, "home", current);
			killall(current);
			exec(sc, current, threadCount, advanced || 0 ? advTarget : target);
			completedServers.push(current);
			print("Transferred and updated server " + current);
			return;
		}
	}
}	