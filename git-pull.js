const argsSchema = [
    ['github', 'alainbryden'],
    ['repository', 'bitburner-scripts'],
    ['branch', 'main'],
    ['download', []], // By default, all files returned by ns.ls() will be downloaded. Override with just a subset of files here
    ['new-file', ["/Remote/grow-target.js","/Remote/hack-target.js","/Remote/manualhack-target.js","/Remote/weak-target.js","/Tasks/backdoor-all-servers.js","/Tasks/backdoor-all-servers.js.backdoor-one.js","/Tasks/contractor.js","/Tasks/contractor.js.solver.js","/Tasks/program-manager.js","/Tasks/ram-manager.js","/Tasks/run-with-delay.js","/Tasks/tor-manager.js","/Tasks/write-file.js","analyze-hack.js","cascade-kill.js","cleanup.js","crime.js","daemon.js","faction-manager.js","farm-intelligence.js","gangs.js","get-list.js","git-pull.js","hacknet-upgrade-manager.js","helpers.js","host-manager.js","remove-worst-server.js","reserve.js","run-command.js","scan.js","sleeve.js","spend-hacknet-hashes.js","stats.js","stockmaster.js","work-for-factions.js"]], // By default, only files returned by ns.ls() will be downloaded. You can add additional files to seek out here.
    ['subfolder', ''], // Can be set to download to a sub-folder that is not part of the remote repository structure
];

export function autocomplete(data, _) {
    data.flags(argsSchema);
    return [];
}

/** @param {NS} ns 
 * Will try to download a fresh version of every file on the current server.
 * You are responsible for:
 * - Backing up your save / scripts first (try `download *` in the terminal)
 * - Ensuring you have no local changes that you don't mind getting overwritten
 * TODO: Some way to list all files in the repository and/or download them all. **/
export async function main(ns) {
    const options = ns.flags(argsSchema);
    const baseUrl = `https://raw.githubusercontent.com/${options.github}/${options.repository}/${options.branch}/`;
    const filesToDownload = options['new-file'].concat(options.download.length > 0 ? options.download : ns.ls('home')
        .filter(name => !name.endsWith(".exe") && !name.endsWith(".msg") && !name.endsWith(".lit") && !name.startsWith("/Temp/")));
    for (const localFilePath of filesToDownload) {
        const remoteFilePath = baseUrl + localFilePath.substr(options.subfolder.length);
        ns.print(`Trying to update "${localFilePath}" from ${remoteFilePath} ...`);
        if (await ns.wget(`${remoteFilePath}?ts=${new Date().getTime()}`, localFilePath))
            ns.tprint(`SUCCESS: Updated "${localFilePath}" to the latest from ${remoteFilePath}`);
        else
            ns.tprint(`WARNING: "${localFilePath}" was not updated. (Currently running or not located at ${remoteFilePath} )`)
    }
}