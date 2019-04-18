const functions = require("firebase-functions");
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const dateformat = require('dateformat');

const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const googleCredentials = require("./credentials.json");

const ERROR_RESPONSE = {
  status: "500",
  message: "error !!!"
}

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/tasks"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

exports.addTodoList = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Request body: ' + JSON.stringify(request.body));

  const oAuth2Client = new OAuth2(
    googleCredentials.web.client_id,
    googleCredentials.web.client_secret,
    googleCredentials.web.redirect_uris[0]
  );
  oAuth2Client.setCredentials({
    refresh_token: googleCredentials.refresh_token
  });

  function addlist(agent) {
    let conv = agent.conv();
    let message = `${request.body.queryResult.parameters.taskName}をたけいさんのタスクに追加します`;
    if (request.body.queryResult.parameters.date) {
      message = dateformat(new Date(request.body.queryResult.parameters.date), 'm月d日') + 'に' + message;
    }
    conv.close(message);
    agent.add(conv);

    const todo = {
      title: request.body.queryResult.parameters.taskName,
      notes: "from Action on Google"
    }
    if (request.body.queryResult.parameters.date) {
      todo.due = request.body.queryResult.parameters.date;
    }
    addTaskList(todo, oAuth2Client).then(data => {
      console.log("success: " + data);
      // response.status(200).send(data);
      return;
    }).catch(err => {
      console.log("errror: " + err.message);
      // response.status(500).send(ERROR_RESPONSE);
      return;
    });

    function addTaskList(todo, auth) {
      const service = google.tasks({ version: "v1", auth });
      return new Promise(function(resolve, reject) {
        service.tasks.insert(
          {
            tasklist: "@default",
            resource: todo
          },
          (err, res) => {
            if (err) {
              console.error("The API returned an error: " + err);
              reject(err);
            }
            console.log("successful", res.data);
            resolve(res.data);
          }
        );
      });
    }
  }

  function welcome(agent) {
    agent.add(`追加したいタスクを言ってください`);
  }

  function fallback(agent) {
    agent.add(`何を言っているかわかりませんでした。`);
    agent.add(`もう一度お願いします。`);
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Add List', addlist);
  agent.handleRequest(intentMap);
});
