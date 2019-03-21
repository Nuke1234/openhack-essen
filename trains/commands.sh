az vm create --resource-group OpenHack-IoT-Data-Team003-RG --name FifthTrain --image microsoft_iot_edge:iot_edge_vm_ubuntu:ubuntu_1604_edgeruntimeonly:latest --admin-username azureuser --generate-ssh-keys --size Standard_DS1_v2


az iot hub device-identity create --hub-name Wingtip-IOT --device-id FifthTrain --edge-enabled

az iot hub device-identity show-connection-string --hub-name Wingtip-IOT --device-id FifthTrain | jq ".connectionString" -r

az vm run-command invoke -g OpenHack-IoT-Data-Team003-RG -n FifthTrain --command-id RunShellScript --script '/etc/iotedge/configedge.sh "HostName=Wingtip-IOT.azure-devices.net;DeviceId=FifthTrain;SharedAccessKey=DTk8t86luuWAxvVzOAZwzzIu00j7y9Zcv8VwMMCXV98="'