const express = require("express");
const cors = require("cors");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = express();

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// Automatically allow cross-origin requests
app.use(cors());

//To count all documents
app.get("/countMsgs", async (req, res) => {
  try {
    const snap = await db.collection("messages").get();
    const unreads = snap.docs.filter(
      (eachDoc) => eachDoc.data().isRead == false
    );

    const reads = snap.docs.filter((eachDoc) => eachDoc.data().isRead == true);

    res.json({
      read: reads.length,
      unread: unreads.length,
    });
  } catch (ex) {
    res.sendStatus(500);
  }
});

// To get all collection details.
app.get("/messages", async (req, res) => {
  try {
    const snap = await db
      .collection("messages")
      .orderBy("dateSent", "desc")
      .get();
    const msgs = snap.docs.map((eachDoc) => ({
      id: eachDoc.id,
      subject: eachDoc.data().subject,
      content: eachDoc.data().content,
      isRead: eachDoc.data().isRead,
    }));
    console.log(msgs);
    res.json(msgs);
  } catch (e) {
    res.sendStatus(500);
  }
});

// to get individual document detail
app.get("/getmessage", async (req, res) => {
  try {
    const docsnap = await db.collection("messages").doc(req.query.id).get();
    console.log(req.query.id);
    if (docsnap.exists == false) res.status(404).send("Record not found.");
    else {
      const msg = {
        id: docsnap.id,
        subject: docsnap.data().subject,
        content: docsnap.data().content,
        isRead: docsnap.data().isRead,
      };
      res.json(msg);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// to Confirm read of an individual document detail
app.get("/readMsg", async (req, res) => {
  try {
    const docsnap = await db.collection("messages").doc(req.query.id).update({
      isRead: true,
    });
    res.send("done.");
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

exports.widgets = functions.https.onRequest(app);
