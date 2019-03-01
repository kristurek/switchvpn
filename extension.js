const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Vpn = Me.imports.vpn;

class CustomPopupSwitchMenuItem extends PopupMenu.PopupSwitchMenuItem {

    constructor(vpnItem) {
        super(vpnItem.name);
        this.vpnItem = vpnItem;
    }

    activate(event) {
        if (this._switch.actor.mapped) {
            this.toggle();
        }
    }
}

const PopupMenuVpn = new Lang.Class({
    Name: 'PopupMenuVpn',
    Extends: PanelMenu.Button,

    _init: function() {

        this.parent(1, 'PopupMenuVpn', false);
        let box = new St.BoxLayout();
        let icon = new St.Icon({
            icon_name: 'network-vpn-symbolic',
            style_class: 'system-status-icon'
        });
        let toplabel = new St.Label({
            text: ' VPN ',
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        });

        box.add(icon);
        box.add(toplabel);
        box.add(PopupMenu.arrowIcon(St.Side.BOTTOM));

        this.actor.add_child(box);

        const service = new Vpn.VpnService();
        let items = service.findAllVpn();

        if(items)
          for (item of items) {
              let menuItem = new CustomPopupSwitchMenuItem(item);
              menuItem.connect('toggled', Lang.bind(this, function(object, value) {
                  switchmenuitem2.setToggleState(!value);
              }));

              this.menu.addMenuItem(menuItem);
          }
    },

    destroy: function() {
        this.parent();
    }
});

let button;

function init() {}

function enable() {
    button = new PopupMenuVpn;

    Main.panel.addToStatusArea('PopupMenuVpn', button, 0, 'right');
}

function disable() {
    button.destroy();
}