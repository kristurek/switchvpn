#!/usr/bin/env bash

#List active vnp's
nmcli -f NAME,TYPE,UUID,DEVICE connection | awk '$4!="--" &&  $2 == "vpn" {print $1,$3,$4}' | sort -nk1

#List all vpn's
nmcli -f NAME,TYPE,UUID,DEVICE connection | awk '$2 == "vpn" {print $1,$3,$4}' | sort -nk1

#Reload Gnome Shell - ALT+F2 next put r
#Debug  Gnome Shell - ALT+F2 next put lg

#Logs with or without sudo
#sudo journalctl -r /usr/bin/gnome-shell
#sudo journalctl -f /usr/bin/gnome-shell