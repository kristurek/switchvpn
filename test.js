#!/usr/bin/gjs
//sudo journalctl -r /usr/bin/gnome-shell

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

let [res, out, err, status] = GLib.spawn_command_line_sync('./list-all-vpn.sh');
print(out);
print(res);
print(err);
print(status);

var lines = out.toString().split('\n');
for(var i in lines) {
  print(lines[i]);
  var fields = lines[i].split(' ');
  for(var j in fields)
    print(fields[j])
  }
