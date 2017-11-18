// Initialize Firebase
  var config = {
    apiKey: "AIzaSyASyQxTEHCz0mNxjXGkBGDCLmqyWyu6Ouw",
    authDomain: "train-scheduler-7184e.firebaseapp.com",
    databaseURL: "https://train-scheduler-7184e.firebaseio.com",
    projectId: "train-scheduler-7184e",
    storageBucket: "train-scheduler-7184e.appspot.com",
    messagingSenderId: "49002132241"
  };
  
  firebase.initializeApp(config);

var database = firebase.database();

// Initial Values
var trainName = "";
var destination = "";
var firstTrainTime = "";
var frequency = 0;
var currentTime = moment();
var index = 0;
var trainIDs = [];

// Show current time
var datetime = null,
date = null;

var update = function () {
  date = moment(new Date())
  datetime.html(date.format('dddd, MMMM Do YYYY, H:mm:ss '));
};

$(document).ready(function(){
  datetime = $('#current-status')
  update();
  setInterval(update, 1000);
});


// Capture Button Click
$("#add-train").on("click", function() {

  // Grabbed values from text boxes
  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  firstTrainTime = $("#train-time").val().trim();
  frequency = $("#frequency").val().trim();
  
  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTimeConverted = moment(firstTrainTime, "H:mm").subtract(1, "years");
  //console.log("FTC: "+firstTimeConverted);

  // Difference between the times
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  //console.log("Difference in time: " + diffTime);

  // Time apart (remainder)
  var tRemainder = diffTime % frequency;
  //console.log(tRemainder);

  // Minute Until Train
  var minutesAway = frequency - tRemainder;
  //console.log("Minutes away: " + minutesAway);

  // Next Train
  var nextTrain = moment().add(minutesAway, "minutes");
  console.log("Arrival time: " + moment(nextTrain).format("H:mm"));

  // Arrival time
  var nextArrival = moment(nextTrain).format("H:mm");

  var nextArrivalUpdate = function() {
    date = moment(new Date())
    datetime.html(date.format("H:mm"));
  }

  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency,
    minutesAway: minutesAway,
    nextArrival: nextArrival,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
  
  alert("Form submitted!");

  // Empty text input
  $("#train-name").val("").trim();
  $("#destination").val("").trim();
  $("#train-time").val("").trim();
  $("#frequency").val("").trim();
  
  // Don't refresh the page!
  return false; 
});


// This will only show the 25 latest entries
  database.ref().orderByChild("dateAdded").limitToLast(25).on("child_added", function(snapshot) {


    console.log("Train name: " + snapshot.val().trainName);
    console.log("Destination: " + snapshot.val().destination);
    console.log("First train: " + snapshot.val().firstTrainTime);
    console.log("Frequency: " + snapshot.val().frequency);
    console.log("Next train: " + snapshot.val().nextArrival);
    console.log("Minutes away: " + snapshot.val().minutesAway);
    console.log("==============================");


  // Change the HTML to reflect
  $("#new-train").append("<tr><td>" + snapshot.val().trainName + "</td>" +
    "<td>" + snapshot.val().destination + "</td>" + 
    "<td>" + "Every " + snapshot.val().frequency + " mins" + "</td>" + 
    "<td>" + snapshot.val().nextArrival + "</td>" +
    "<td>" + snapshot.val().minutesAway + " mins until arrival" + "</td>" +
   // "<td><button class='delete btn btn-default btn-sm' data-index='" + index + "'><span class='glyphicon glyphicon-trash'></span></button> " + 
   // "<button type='button' class='btn btn-default btn-sm'><span class='glyphicon glyphicon-edit'></span></button>" +
    "</td></tr>");

  index++;

  // Handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

  //Gets the train IDs in an Array
  database.ref().once('value', function(dataSnapshot){ 
    var trainIndex = 0;

      dataSnapshot.forEach(
          function(childSnapshot) {
              trainIDs[trainIndex++] = childSnapshot.key();
          }
      );
  });

  console.log(trainIDs);

