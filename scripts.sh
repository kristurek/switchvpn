#!/usr/bin/env bash

#List active vnp's
nmcli -f NAME,TYPE,UUID,DEVICE connection | awk '$4!="--" &&  $2 == "vpn" {print $1,$3,$4}' | sort -nk1

#List all vpn's
nmcli -f NAME,TYPE,UUID,DEVICE connection | awk '$2 == "vpn" {print $1,$3,$4}' | sort -nk1