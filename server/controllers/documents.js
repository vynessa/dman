const Document = require('./../models/document');

module.exports = {
  createDocument(req, res) {
    console.log(req.body);
    return Document
    .create({
      title: req.body.title,
      content: req.body.content,
      owner: req.body.owner,
      accessType: req.body.accessType,
      userId: req.body.userId
    })
    .then(document => res.status(201).send(document))
    .catch(error => req.status(400).send(error));
  }
};
