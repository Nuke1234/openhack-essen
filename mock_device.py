import json
import time
import datetime
import uuid

from iothub_client import IoTHubClient, IoTHubTransportProvider, IoTHubMessage, IoTHubClientConfirmationResult

CONNECTION_STRING = "HostName=Wingtip-IOT.azure-devices.net;DeviceId=sim1;SharedAccessKey=KWVEGCO0VXdOcsgkfsVi/JJJIXA0Xr6Ldjw4jFeWK7g="
PROTOCOL = IoTHubTransportProvider.MQTT

# Interval at which messages are sent for every sensor
INTERVAL_SECONDS = 1


def send_confirmation_callback(message, result, user_context):
    if result is not IoTHubClientConfirmationResult.OK:
        print(f"Sending message failed with result = {result}. Message id: {message.message_id}")
    else:
        print(f"Sending message success for message id: {message.message_id}")


def main():
    print("Starting device...")
    message_counter = 1

    while True:
        try:
            client = IoTHubClient(CONNECTION_STRING, PROTOCOL)
            message = IoTHubMessage(json.dumps({
                "entryTime": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                "ticketId": str(uuid.uuid4())
            }))
            message.message_id = "message_%d" % message_counter
            message.correlation_id = "correlation_%d" % message_counter

            prop_map = message.properties()

            prop_map.add("CreationTimeUtc", datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))
            prop_map.add("CorrelationId", str(uuid.uuid4()))

            client.send_event_async(message, send_confirmation_callback, message_counter)
            print(f"IoTHubClient.send_event_async accepted message {message.get_string()}")
            message_counter += 1

            time.sleep(INTERVAL_SECONDS)

        except Exception as e:
            print(e)
            time.sleep(INTERVAL_SECONDS*2)


if __name__ == "__main__":
    main()