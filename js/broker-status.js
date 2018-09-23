// chartjs.js
var mqttBrokerChartData= {
  labels : ["1","2","3","4","5","6","7"],
  datasets : [
    {
      label: "My Second dataset",
      fillColor : "rgba(48, 164, 255, 0.2)",
      strokeColor : "rgba(48, 164, 255, 1)",
      pointColor : "rgba(48, 164, 255, 1)",
      pointStrokeColor : "#fff",
      pointHighlightFill : "#fff",
      pointHighlightStroke : "rgba(48, 164, 255, 1)",
      data : [0,0,0,0,0,0,0]
    }
  ]

}

var mqttBrokerChart;

var mqttBrokerLine;

var mqttOldData;

var mqttBaseData;

// Paho MQTT
var mqttBrokerRecvMessageTag;
var mqttBrokerSendMessageTag;
var mqttBrokerConnectorTag;
var mqttBrokerDroppedTag;

var mqttBrokerIp 		= "192.168.0.214";

var mqttBrokerClient;

window.onload = function () {
  mqttBrokerClient 		= new Paho.MQTT.Client(mqttBrokerIp, Number(9002),"/mqtt","Broker Status Dashboard1");

  mqttBrokerClient.onMessageArrived = onmqttBrokerMessageArrived;

  // connect the client
  mqttBrokerClient.connect({onSuccess:onmqttBrokerConnect});

  mqttBrokerChart = document.getElementById("mqtt-broker-chart").getContext("2d");


  mqttBrokerLine = new Chart(mqttBrokerChart).Line(mqttBrokerChartData, {
    responsive: true,
    scaleBeginAtZero : true,
    scaleLineColor: "rgba(0,0,0,.2)",
    scaleGridLineColor: "rgba(0,0,0,.05)",
    scaleFontColor: "#c5c7cc"
  });

  mqttBroker = document.getElementById("mqtt-broker-status");

};

function onmqttBrokerConnect() {
  mqttBrokerClient.subscribe("$SYS/broker/workload/+");
  console.log("connected to mqtt");
  //client.disconnect({onSuccess:onDisconnect});
}

function onmqttBrokerMessageArrived(message) {
  console.log("recv Msg mqtt");
  if(message.destinationName.indexOf("received") != -1){
    if(mqttBrokerRecvMessageTag==null)
      mqttBrokerRecvMessageTag = document.getElementById("mqtt-broker-rmsg");
    mqttBrokerRecvMessageTag.innerHTML = message.payloadString;
  }else if(message.destinationName.indexOf("sent") != -1){

        if(mqttBrokerSendMessageTag==null){
          mqttOldData = message.payloadString;
          mqttBrokerSendMessageTag = document.getElementById("mqtt-broker-smsg");
        }

        for(var i = 0; i < 6; i++){
          mqttBrokerLine.datasets[0].points[i].value = mqttBrokerLine.datasets[0].points[i+1].value;
        }
        mqttBrokerLine.datasets[0].points[6].value = message.payloadString - mqttOldData;
        mqttBrokerLine.update();
        mqttBrokerSendMessageTag.innerHTML = message.payloadString;
        mqttOldData = message.payloadString;

  }else if(message.destinationName.indexOf("connected") != -1){
    if(mqttBrokerConnectorTag==null)
      mqttBrokerConnectorTag = document.getElementById("mqtt-broker-conn");
    mqttBrokerConnectorTag.innerHTML = message.payloadString;
  }else if(message.destinationName.indexOf("dropped") != -1){
    if(mqttBrokerDroppedTag==null)
      mqttBrokerDroppedTag = document.getElementById("mqtt-broker-drop");
    mqttBrokerDroppedTag.innerHTML = message.payloadString;
  }
}

function removeData(chart) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    // chart.data.datasets.forEach((dataset) => {
    //     dataset.data.pop();
    // });
    chart.update();
}
