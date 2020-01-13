const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const NM = imports.gi.NM;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

let NMVpnItem = GObject.registerClass(
    class NMVpnItem extends PopupMenu.PopupSwitchMenuItem {

        _init(connection) {
            super._init(connection.get_id());

            this._connection = connection;
            this._activeConnection = null;
        }

        activate(event) {
            if (this._switch.mapped)
                this.toggle();
        }

        _isActiveConnection() {
            if (!this._activeConnection)
                return false;

            return this._activeConnection.state <= NM.ActiveConnectionState.ACTIVATED;
        }

        sync(activeConnection) {
            this._activeConnection = activeConnection;
            this.setToggleState(this._isActiveConnection());
        }

        getActiveConnection() {
            return this._activeConnection;
        }

        getConnection() {
            return this._connection;
        }
    }
)
let PopupMenuVpn = GObject.registerClass(
    class PopupMenuVpn extends PanelMenu.Button {

        _init() {
            super._init(1, 'PopupMenuVpn', false);

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

            this.add_child(box);

            this._connectionItems = new Map();

            this._client = NM.Client.new(null);

            this._client.connect('notify::active-connections', this._sync.bind(this));
            this._client.connect('connection-added', this._sync.bind(this));
            this._client.connect('connection-removed', this._sync.bind(this));
            this._sync();
        }

        _sync() {
            let currentConnectionItems = new Array(...this._connectionItems).map(entries => entries[1]);
            let currentConnections = currentConnectionItems.map(x => x.getConnection());

            let newConnections = this._client.get_connections().filter(connection => {
                return connection.get_setting_by_name(NM.SETTING_CONNECTION_SETTING_NAME).type == NM.SETTING_VPN_SETTING_NAME;
            });

            let connectionsToUpdate = newConnections.filter(x => currentConnections.includes(x));
            this._syncConnectionItems(connectionsToUpdate);

            let connectionsToCreate = newConnections.filter(x => !currentConnections.includes(x));
            this._createConnectionItems(connectionsToCreate);

            let connectionsToRemove = currentConnections.filter(x => !newConnections.includes(x));
            this._removeConnectionItems(connectionsToRemove);
        }

        _syncConnectionItems(connections) {
            if (connections) {
                let activeConnectionsMap = new Map();
                let activeConnections = this._client.get_active_connections() || [];
                activeConnections.forEach((activeConnection) => {
                    activeConnectionsMap.set(activeConnection.get_uuid(), activeConnection);
                });

                connections.forEach(connection => {
                    let activeConnection = activeConnectionsMap.get(connection.get_uuid());
                    this._connectionItems.get(connection.get_uuid()).sync(activeConnection);
                });
            }
        }

        _createConnectionItems(connections) {
            if (connections) {
                connections.forEach(connection => {
                    let nmVpnItem = new NMVpnItem(connection);
                    nmVpnItem.connect('toggled', this._toogle.bind(this));
                    this._connectionItems.set(connection.get_uuid(), nmVpnItem);
                    this.menu.addMenuItem(nmVpnItem);
                });

                this._syncConnectionItems(connections);
            }
        }

        _removeConnectionItems(connections) {
            if (connections) {
                connections.forEach(connection => {
                    this._connectionItems.get(connection.get_uuid()).destroy();
                    this._connectionItems.delete(connection.get_uuid());
                });
            }
        }

        _toogle(object, value) {
            try {
                if (value)
                    this._client.activate_connection_async(object.getConnection(), null, null, null, null);
                else {
                    this._client.deactivate_connection(object.getActiveConnection(), null);
                    object.sync(null);
                }
            } catch (e) {
                global.log('Exception [' + e + ']');
                object.sync(null);
            }

            let currentConnectionItems = new Array(...this._connectionItems).map(entries => entries[1]);
            let currentConnections = currentConnectionItems.map(x => x.getConnection());
            this._syncConnectionItems(currentConnections)
        }

        destroy() {
            super.destroy();
        }
    }
)

let app;

function init() {
    log('Initializing ' + Me.metadata.name);
}

function enable() {
    log('Enable ' + Me.metadata.name);

    app = new PopupMenuVpn();
    Main.panel.addToStatusArea(Me.metadata.name, app, 0, 'right');
}

function disable() {
    log('Disable ' + Me.metadata.name);
    app.destroy();
}