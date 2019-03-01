#!/usr/bin/gjs

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

class VpnService {

    constructor() {}

    findVpn(command) {
        var vpns = [];

        //let [res, out, err, status] = GLib.spawn_command_line_sync(command);
        let [res, out, err, exit] = GLib.spawn_sync(null, ["/bin/bash", "-c", command], null, GLib.SpawnFlags.SEARCH_PATH, null);

        global.log('VPN [' + out + ']');
        out.toString().split('\n').forEach(function(item, index, array) {
            var fields = item.split(' ').filter(item => item);

            if (fields[0] && fields[1])
                vpns.push(new VpnItem(fields[0], fields[1]));
        });

        return vpns;
    }

    findAllVpn() {
        return this.findVpn('nmcli -f NAME,TYPE,UUID,DEVICE connection | awk \'$2 == \"vpn\" {print $1,$3,$4}\'');
    }

    findActiveVpn() {
        return this.findVpn('./list-active-vpn.sh');
    }
}

class VpnItem {
    constructor(nameVpn, uuidVpn) {
        this.nameVpn = nameVpn;
        this.uuidVpn = uuidVpn;
    }

    get name() {
        return this.nameVpn;
    }
    get uuid() {
        return this.uuidVpn;
    }

    set name(nameVpn) {
        this.nameVpn = nameVpn;
    }
    set uuid(uuidVpn) {
        this.uuidVpn = uuidVpn;
    }
}
/*
var service  = new VpnService();
var vpns = service.findAllVpn();
for(var vpn of vpns)
  print(vpn.name + " === "+ vpn.uuid);
*/