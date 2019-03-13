#!/usr/bin/gjs

const {
    Gio,
    GLib,
    GObject,
    NM
} = imports.gi;

let _client = NM.Client.new(null);

_client.get_active_connections().forEach(connection => {

    if (connection instanceof NM.ActiveConnection) {
        let connectionType = connection.get_connection_type();

        if (connectionType == NM.SETTING_VPN_SETTING_NAME)
            _client.deactivate_connection(connection, null);
    }
});

_client.get_connections().forEach(connection => {
    let connectionSettings = connection.get_setting_by_name(NM.SETTING_CONNECTION_SETTING_NAME);

    if (connectionSettings.type == NM.SETTING_VPN_SETTING_NAME)
        _client.activate_connection_async(connection, null, null, null, null);
});