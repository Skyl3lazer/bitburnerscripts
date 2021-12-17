/** @param {NS} ns **/
import { Server } from "scanall.ns"
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("getHackingLevel");
	/*
	Port Mapping:
	Port 1 = Output Order objects
	Port 2 = Input threads put on target
	Port 3 = Input completed orders
	*/
	ns.clearPort(1);
	ns.clearPort(2);
	ns.clearPort(3);
	ns.run("/hack/client.ns");
	//Configuration
	var weight_maxMoney = 10;
	var weight_growth = 2000000;
	var securityThresh = 3; //Don't hack if security is below this threshhold
	var moneyThresh = .65; //Don't hack if money is below maxMoney * moneyThresh
	//End Configuration

	var ImportServers = JSON.parse(ns.read("serverlist.txt"));
	var orderQueue = [];
	var nextOrderID = 1;
	var totalweight = weight_maxMoney + weight_growth;
	weight_maxMoney /= totalweight;
	weight_growth /= totalweight;

	//filter unwanted servers
	var exclude = ["home", "n00dles", "darkweb", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", ".", "The-Cave"];
	var servers = ImportServers.filter(function (server) {
		return !exclude.includes(server.name) && !server.name.startsWith("pserv");
	});

	//main loop
	while (true) {
		//read any order acceptance squaks
		let portData = ns.readPort(2);
		while (portData !== "NULL PORT DATA") {
			portData = JSON.parse(portData);
			const ord = orderQueue.find(element => element.id == portData.id);
			if (portData.threads < ord.threads) {
				ns.print("Only " + portData.threads + " of " + ord.threads + " were started. Requesting " + (ord.threads - portData.threads));
				let writeCheckSquak = false;
				let partialOrder = JSON.parse(JSON.stringify(ord));
				partialOrder.threads -= portData.threads;
				while (!writeCheckSquak) {
					writeCheckSquak = await ns.tryWritePort(1, JSON.stringify(partialOrder));
					await ns.sleep(5);
				}
			}
			portData = ns.readPort(2);
		}
		//read any order completion squaks
		portData = ns.readPort(3);
		while (portData !== "NULL PORT DATA") {
			portData = JSON.parse(portData);
			const ord = orderQueue.find(element => element.id == portData.id);
			if (portData.threads < ord.threads) {
				ord.threads -= portData.threads;
			} else {
				orderQueue.splice(orderQueue.indexOf(ord), 1);
			}
			portData = ns.readPort(3);
		}
		//write a new order
		let order = await determineOrder();
		if (order !== "NO ORDER") {
			let writeCheckNew = false;
			ns.print("Writing Order " + order.id + ": " + order.target.name);
			while (!writeCheckNew) {
				writeCheckNew = await ns.tryWritePort(1, JSON.stringify(order));
				await ns.sleep(5);
			}
			orderQueue.push(order);
			ns.print("Write success");
		}
		await ns.write("serverlist.txt", JSON.stringify(ImportServers), "w");
		await ns.sleep(10000);
	}

	//Determine the order to send next
	async function determineOrder() {
		let hackLevel = ns.getHackingLevel();
		let hackableServers = servers.filter(function (server) {
			return server.hackLevel <= hackLevel && orderQueue.every(function (order) {
				return order.target.name !== server.name;
			});
		});
		if (hackableServers.length === 0) {
			return Promise.resolve("NO ORDER");
		}
		let highScore = 0;
		let highTarget = new Server();
		let threads = 0;
		let type = "";
		hackableServers.forEach(server => {
			let score = (server.maxMoney * weight_maxMoney) + (server.growth * weight_growth);
			if (score > highScore) {
				highScore = score;
				highTarget = server;
			}
			ns.print(server.name+" scored "+score);
		});
		if(highTarget.name === undefined){
			return Promise.resolve("NO ORDER");
		}
		ns.print("HighTarget is " + highTarget.name);
		if (highTarget.security > highTarget.minSec + securityThresh) {
			type = "w";
			threads = Math.ceil((highTarget.security - (highTarget.minSec + securityThresh)) / 0.05); //0.05 is a static amount reduced per thread
		} else if (highTarget.money >= highTarget.maxMoney * moneyThresh) {
			type = "h";
			threads = Math.ceil(ns.hackAnalyzeThreads(highTarget.name, highTarget.maxMoney * moneyThresh));
		} else {
			type = "g";
			threads = Math.ceil(ns.growthAnalyze(highTarget.name, highTarget.maxMoney / highTarget.money));
		}
		let ord = new Order(nextOrderID, highTarget, threads, highTarget.minSec + securityThresh, type);
		nextOrderID++;
		return Promise.resolve(ord); //return the Order object
	}
}
export class Order {
	target = "";
	threads = 0;
	secThresh = 0;
	id = 0;
	type = ""; //h, g, w
	constructor(cid, ctarget, cthreads, csecThresh, ctype) {
		this.id = cid;
		this.target = ctarget;
		this.threads = cthreads;
		this.secThresh = csecThresh;
		this.type = ctype;
	}
}