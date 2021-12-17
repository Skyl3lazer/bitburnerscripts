/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");
    ns.disableLog("getServerUsedRam");

    var portData;
    var threads;
    var id;
    let orders = ns.getPortHandle(1);
    let accept = ns.getPortHandle(2);
    let output = ns.getPortHandle(3);
    let tasks = [];

    //script sizes
    let hackSize = 1.7;
    let weakenSize = 1.75;
    let growSize = 1.75;

    var ImportServers = JSON.parse(ns.read("serverlist.txt"));
    var myServers = ImportServers.filter(function (server) {
        return server.hasRoot && server.maxRam > 0;
    });
    for (let host of myServers) {
        await ns.scp("/hack/weaken.ns", host.name);
        await ns.scp("/hack/grow.ns", host.name);
        await ns.scp("/hack/hack.ns", host.name);
    }
    while (true) {
        portData = orders.read();
        while (portData === "NULL PORT DATA") {
            ns.print("Awaiting port data");
            await ns.sleep(5000);
            portData = orders.read();
        }
        ns.print("data: " + portData);
        portData = JSON.parse(portData);
        portData.pids = new Array();
        ns.print(portData);
        let neededThreads = portData.threads;

        for (let host of myServers) {
            host.freemem = host.maxRam - ns.getServerUsedRam(host.name);
            if(host.name==="home"){
                host.freemem -= 64;
            }
            if (neededThreads === 0) {
                continue;
            }
            let availThreads = 0;
            id = portData.id;
            if (portData.type === "w") {
                availThreads = Math.floor(host.freemem / weakenSize);
                if (availThreads > neededThreads) {
                    availThreads = neededThreads;
                }
                if (availThreads > 0) {
                    neededThreads -= availThreads;
                    portData.pids.push([host.name, ns.exec("/hack/weaken.ns", host.name, availThreads, portData.target.name)]);
                    host.freemem = host.maxRam - (availThreads * weakenSize);
                }
            } else if (portData.type === "h") {
                availThreads = Math.floor(host.freemem / hackSize);
                if (availThreads > neededThreads) {
                    availThreads = neededThreads;
                }

                if (availThreads > 0) {
                    neededThreads -= availThreads;
                    portData.pids.push([host.name, ns.exec("/hack/hack.ns", host.name, availThreads, portData.target.name)]);
                    host.freemem = host.maxRam - (availThreads * hackSize);
                }
            } else if (portData.type === "g") {
                availThreads = Math.floor(host.freemem / growSize);
                if (availThreads > neededThreads) {
                    availThreads = neededThreads;
                }

                if (availThreads > 0) {
                    neededThreads -= availThreads;
                    portData.pids.push([host.name, ns.exec("/hack/grow.ns", host.name, availThreads, portData.target.name)]);
                    host.freemem = host.maxRam - (availThreads * growSize);
                }
            }
        };
        myServers.sort(function (a, b) {
            return a.freemem - b.freemem;
        });

        if (portData.threads - neededThreads !== 0) {
            tasks.push(portData);
        }

        //report accepted task
        let squak = new AcceptSquak();
        squak.id = id;
        squak.threads = portData.threads - neededThreads;
        let writeFlag = false;
        while (!writeFlag) {
            writeFlag = await accept.tryWrite(JSON.stringify(squak));
            await ns.sleep(50);
        }
        ns.print("squaked id " + squak.id + " with threads: " + squak.threads + "/" + portData.threads);
        
        //report completed tasks
        for (let task in tasks) {
            if (task.pids === undefined || task.pids.length === 0) {
                continue;
            }
            ns.print("checking pids " + task.pids.join());
            let running = false;
            for (let proc in task.pids) {
                if (ns.isRunning(proc[1], proc[2])) {
                    running = true;
                    ns.print("pid " + proc[1] + " " + proc[2])
                }
            }
            if (!running) {
                ns.print("not running");
                let compSquak = new ReturnSquak();
                task.target.growTime = ns.getGrowTime(task.target.name);
                task.target.weakenTime = ns.getWeakenTime(task.target.name);
                task.target.hackTime = ns.getHackTime(task.target.name);
                task.target.money = ns.getServerMoneyAvailable(task.target.name);
                task.target.security = ns.getServerSecurityLevel(task.target.name);
                compSquak.server = task.target;
                compSquak.id = task.id;
                threads = task.threads;
                let writeFlag = false;
                while (!writeFlag) {
                    writeFlag = await output.tryWrite(JSON.stringify(compSquak));
                    await ns.sleep(50);
                }
                ns.print("squaked " + compSquak.id + " completed.");
            }
        }

        await ns.sleep(1);
    }

}
class AcceptSquak {
    id = 0;
    threads = 0;
}
class ReturnSquak {
    server = "";
    id = 0;
    threads = 0;
}