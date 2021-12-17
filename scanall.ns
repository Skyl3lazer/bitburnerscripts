/** @param {NS} ns **/
export async function main(ns) {
	//ns.disableLog("ALL");

	var maxDepth = 15;

	var depthOneServers = ns.scan("home");
	var completedServers = ["home"];
	var hasChildServers = depthOneServers.length > 0 ? true : false;
	var serverIterator = depthOneServers;
	var currentDepth = 0;
	var servers = [];

	ns.print(depthOneServers.length + " servers Depth 0");

	while (currentDepth < maxDepth && hasChildServers) {
		var childServers = [];
		for (var i = 0; i < serverIterator.length; i++) {
			var current = serverIterator[i];
			var portsReq = ns.getServerNumPortsRequired(current);
			var srv = new Server(current, portsReq);
			srv.maxMoney = ns.getServerMaxMoney(current);
			srv.growTime = ns.getGrowTime(current);
			srv.weakenTime = ns.getWeakenTime(current);
			srv.hackTime = ns.getHackTime(current);
			srv.growth = ns.getServerGrowth(current);
			srv.minSec = ns.getServerMinSecurityLevel(current);
			srv.hackLevel = ns.getServerRequiredHackingLevel(current);
			srv.money = ns.getServerMoneyAvailable(current);
			srv.security = ns.getServerSecurityLevel(current);
			srv.maxRam = ns.getServerMaxRam(current);
			srv.hasRoot = ns.hasRootAccess(current);
			servers.push(srv);
			childServers = childServers.concat(ns.scan(current));
			completedServers.push(current);
		}


		serverIterator = childServers.filter(function (el) {
			return !completedServers.includes(el);
		});

		ns.print(serverIterator.toString());

		if (serverIterator.length > 0) {
			hasChildServers = true;
		} else {
			hasChildServers = false;
			ns.print("No accessible servers remaining.");
		}
		currentDepth++;
		ns.print(serverIterator.length + " new children at depth " + currentDepth);
	}

	if (currentDepth == maxDepth) {
		ns.print("Reached max depth");
	}
	ns.write("serverlist.txt", JSON.stringify(servers), "w");
}

export class Server {
	name = "";
	portsReq = 0;
	hackLevel = 0;
	growTime = 0;
	maxMoney = 0;
	growth = 0;
	weakenTime = 0;
	hackTime = 0;
	minSec = 0;
	money = 0;
	security = 0;
	maxRam = 0;
	hasRoot = false;
	constructor(cname, cports) {
		this.name = cname;
		this.portsReq = cports;
	}
}