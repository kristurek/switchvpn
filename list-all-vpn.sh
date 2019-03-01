#!/usr/bin/env bash
nmcli -f NAME,TYPE,UUID,DEVICE connection | awk '$2 == "vpn" {print $1,$3,$4}'