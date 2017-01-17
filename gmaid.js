//Alex Maki-Jokela
//Written sometime in 2016ish
//Forked: Bodhi Sansom
//https://github.com/bsans/Gmaid

var inboxLabelId = "INBOX";
var importantLabelId = "IMPORTANT";
var wouldKeepLabelId = "Label_33016733083306497"; // This is my beta test label
var wouldArchiveLabelId = "Label_5718942120764026995"; // This is my beta test label
var userId = Session.getActiveUser().getEmail(); 

var hasLabel = function(message, labelId) {
  // Returns true if this message has the specified label
  if (message != undefined) {
	// var fetchedMessage = Gmail.Users.Messages.get(userId, message.getId());
	// var keys = Object.keys(message);
	//Logger.log(keys);
	//Logger.log(message.labelIds);
	//Logger.log(message.snippet);
	// Logger.log(messages[i].isInInbox());
	// Logger.log(messages[i].getSubject());
	var labels = message.labelIds;
    if (labels.indexOf(labelId) > -1) {
      return true;
    } else {
	  return false;
	}
  } else {
    return false;
  }
}

var modifyMessage = function (userId, messageId, labelsToAdd, labelsToRemove, callback) {
  var payload = {};
  if (labelsToAdd.length > 0) {
	payload['addLabelIds'] = labelsToAdd;
  }
  if (labelsToRemove != null && labelsToRemove.length > 0) {
	payload['removeLabelIds'] = labelsToRemove;
  }
  Gmail.Users.Messages.modify(payload, userId, messageId);
}

var filterAndLabel = function(messages) {
  //var params = {"labelIds": ["IMPORTANT", "INBOX"],
  //              "maxResults": 30};
  // var params = {"maxResults": 30};
  // var response = Gmail.Users.Messages.list(userId, params);
  // Logger.log(response);
  // var messages = response.messages;
  Logger.log(messages.length);
  for (var i = 0; i < messages.length; i++) {
	var message = Gmail.Users.Messages.get(userId, messages[i].getId());
	Logger.log("labelIds: %s", message.labelIds);
    if (hasLabel(message, inboxLabelId) && hasLabel(message, importantLabelId)) {
	  // var writeParams = {"addLabelIds": [wouldKeepLabelId]};
	  Logger.log("writing save label to message id: %s", message.id);
	  modifyMessage(userId, message.id, [wouldKeepLabelId]);
    } else {
	  Logger.log("writing delete label to message id: %s", message.id);
	  modifyMessage(userId, message.id, [wouldArchiveLabelId]);
	}
  }
}


function cleanUp() {
  var delayDays = 2 // Enter # of days before messages are moved to archive
  var maxDate = new Date();
  // var damageControl = 40;
  maxDate.setDate(maxDate.getDate()-delayDays);
  var threads = GmailApp.getInboxThreads();
  for (var i = 0; i < threads.length; i++) {

    if (threads[i].getLastMessageDate() < maxDate && !threads[i].hasStarredMessages()) {
	  // Actual archiving is disabled for now
      // {
      //   threads[i].moveToArchive();
      // }
	  var messages = GmailApp.getMessagesForThread(threads[i]);
	  filterAndLabel(messages);
    }

	// if (i > damageControl) {
	// 	break;
	// }
  }
}
