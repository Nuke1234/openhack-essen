az iot hub create --name Wingtip-IOT --resource-group OpenHack-IoT-Data-Team003-RG --sku S1 --location northeurope

az iot device create --hub-name Wingtip-IOT --device-id sim1
az iot device create --hub-name Wingtip-IOT --device-id sim2
az iot device create --hub-name Wingtip-IOT --device-id sim3
az iot device create --hub-name Wingtip-IOT --device-id sim4


az iot hub device-identity list --hub-name Wingtip-IOT | jq '.[] | .deviceId' -r

az iot hub device-identity show-connection-string --hub-name Wingtip-IOT --device-id sim1 | jq ".connectionString" -r