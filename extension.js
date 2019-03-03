const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Vpn = Me.imports.vpn;

class CustomPopupSwitchMenuItem extends PopupMenu.PopupSwitchMenuItem {

    constructor(vpnItem) {
        super(vpnItem.name);
        this.vpnItem = vpnItem;
    }

    activate(event) {
        if (this._switch.actor.mapped)
            this.toggle();
    }

    getItem() {
        return this.vpnItem;
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

        this._refresh();
    },

    _updateMenuItems: function() {
        this.menu.removeAll();

        const service = new Vpn.VpnService();
        let items = service.findAllVpn();

        if (items)
            for (let item of items) {
                let menuItem = new CustomPopupSwitchMenuItem(item);
                menuItem.setToggleState(item.active);
                menuItem.connect('toggled', Lang.bind(this, function(object, value) {
                    global.log('SwitchVpn.PopupMenuVpn._updateMenuItems[' + object.getItem().print() + '][' + value + ']');
                    if (value)
                        service.upVpn(object.getItem(), this.onFailVpnAction);
                    else
                        service.downVpn(object.getItem(), this.onFailVpnAction);
                }));

                this.menu.addMenuItem(menuItem);
            }
    },

    onFailVpnAction: function(item) {
        global.log('SwitchVpn.PopupMenuVpn.onFailVpnAction[' + item.print() + ']');

        app.menu._getMenuItems().find(function(menuItem) {
            if (menuItem.getItem().uuid == item.uuid)
                menuItem.setToggleState(false);
        });
    },

    _refresh: function() {
        this._updateMenuItems();

        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }

        this._timeout = Mainloop.timeout_add_seconds(3, Lang.bind(this, this._refresh));
    },

    destroy: function() {
        this.parent();
    }
});

let app;

function init() {}

function enable() {
    app = new PopupMenuVpn;

    Main.panel.addToStatusArea('PopupMenuVpn', app, 0, 'right');
}

function disable() {
    app.destroy();
}