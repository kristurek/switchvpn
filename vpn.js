#!/usr/bin/gjs

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;

class VpnService {

    constructor() {}

    _asyncExecuteCommand(command) {
        return GLib.spawn_async(null, ["/bin/bash", "-c", command], null, GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD, null);
    }

    _syncExecuteCommand(command) {
        return GLib.spawn_sync(null, ["/bin/bash", "-c", command], null, GLib.SpawnFlags.SEARCH_PATH, null);
    }

    _findVpn(command) {
        global.log('SwitchVpn.VpnService._findVpn[' + command + ']');
        var vpns = [];

        let [res, out, err, exit] = this._syncExecuteCommand(command);

        global.log('SwitchVpn.VpnService._findVpn[' + out + ']');
        out.toString().split('\n').forEach(function(item, index, array) {
            var fields = item.split(' ').filter(item => item);

            if (fields[0] && fields[1] && fields[2]) {
                if (fields[2] == '--')
                    vpns.push(new VpnItem(fields[0], fields[1], false));
                else
                    vpns.push(new VpnItem(fields[0], fields[1], true));
            }
        });

        vpns.forEach(function(entry) {
            global.log('SwitchVpn.VpnService._findVpn[' + entry.print() + ']');
        });

        return vpns;
    }

    findAllVpn() {
        return this._findVpn('nmcli -f NAME,TYPE,UUID,DEVICE connection | awk \'$2 == \"vpn\" {print $1,$3,$4}\' | sort -nk1');
    }

    findActiveVpn() {
        return this._findVpn('nmcli -f NAME,TYPE,UUID,DEVICE connection | awk \'$4!=\"--\" &&  $2 == \"vpn\" {print $1,$3,$4}\'');
    }

    _upDownVpn(vpnItem, onFailFunction, type) {
        let [success, pid] = this._asyncExecuteCommand('nmcli connection ' + type + ' ' + vpnItem.uuid);
        global.log('SwitchVpn.VpnService._upDownVpn[' + success + '][' + pid + ']');

        if (success && pid != 0) {
            global.log('SwitchVpn.VpnService._upDownVpn[success create proccess]');
            GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, function(pid, status) {
                GLib.spawn_close_pid(pid);

                global.log('SwitchVpn.VpnService._upDownVpn[process completed][' + status + ']');
                if (onFailFunction != undefined && status != '0')
                    onFailFunction(vpnItem);
            });
        } else
            global.log('SwitchVpn.VpnService._upDownVpn[faild create proccess]');
    }

    upVpn(vpnItem, onFailFunction) {
        this._upDownVpn(vpnItem, onFailFunction, 'up');
    }

    downVpn(vpnItem, onFailFunction) {
        this._upDownVpn(vpnItem, onFailFunction, 'down');
    }
}

class VpnItem {
    constructor(nameVpn, uuidVpn, activeVpn) {
        this.nameVpn = nameVpn;
        this.uuidVpn = uuidVpn;
        this.activeVpn = activeVpn;
    }

    print() {
        return 'VpnItem[' + this.nameVpn + '][' + this.uuidVpn + '][' + this.active + ']';
    }

    get name() {
        return this.nameVpn;
    }
    get uuid() {
        return this.uuidVpn;
    }
    get active() {
        return this.activeVpn;
    }


    set name(nameVpn) {
        this.nameVpn = nameVpn;
    }
    set uuid(uuidVpn) {
        this.uuidVpn = uuidVpn;
    }
    set active(activeVpn) {
        this.activeVpn = activeVpn;
    }
}