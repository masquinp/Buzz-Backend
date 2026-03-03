var express = require("express");
var router = express.Router();
const Conversation = require("../models/conversations");     //importe le modèle Conversation

// 🔹 Créer ou récupérer une conversation
router.post("/", async (req, res) => {      //crée une route HTTP de type POST, req = la requête envoyée par le frontend et res = la réponse qu’on va renvoyer
  try {       //try/catch pour éviter que l’app crash
    const { tripId, driverId, passengerId } = req.body;     //lit les données envoyées en JSON par le frontend

    if (!tripId || !driverId || !passengerId) {     //vérifie que tous les champs existent, si un champ manque ca bloque
      return res.status(400).json({ error: "tripId, driverId et passengerId requis" });   //sans return, le code continuerait
    }

    let conversation = await Conversation.findOne({ tripId, passengerId });   //demande à Mongo si il existe déjà une conversation avec ce tripId ET ce passengerId

    if (!conversation) {       // si la conversation n’existe pas alors on crée un document conversation vide
      conversation = await Conversation.create({
        tripId,
        driverId,
        passengerId,
        messages: [],
      });
    }

    res.json(conversation);     //le frontend reçoit la conversation + son _id
  } catch (err) {
    res.status(500).json({ error: err.message });   //si une erreur arrive dans le try, on la capture ici, 500 = erreur interne du serveur
  }
});


// Lire une conversation
router.get("/:id", async (req, res) => {     //on recup une conversation par son id 
                                             //Exemple réel : GET /conversations/65fabc1234 alors le :id correspond c est 65fabc1234
  try {
    const conversation = await Conversation.findById(req.params.id);  //findById ca signifie va dans la collection conversations et trouve le document dont _id = cette valeur
                                                   //req.params.id c est la valeur dynamique dans l’URL
                                                   // await = on attend que Mongo réponde, resultat : soit un objet conversation soit null
    if (!conversation) {     //est-ce que la conversation existe ?
      return res.status(404).json({ error: "Conversation introuvable" });   //404 code HTTP = ressource non trouvée
    }

    res.json(conversation);      //envoie toute la conversation au front
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ajouter un message dans une conversation existante
router.post("/:id/messages", async (req, res) => {    
                                                    
  try {
    const { senderId, text } = req.body;     //Le frontend doit envoyer par ex "senderId": "user1", "text":"Hola"
    if (!text || !senderId) {       //on verifie donc que l user existe et que le message n'est pas vide
      return res.status(400).json({ error: "senderId et text requis" });
    }

    const conversation = await Conversation.findById(req.params.id);  //on doit trouver la conversation AVANT d’ajouter un message car si elle n’existe pas, on ne peut rien modifier

    if (!conversation) {
      return res.status(404).json({ error: "Conversation introuvable" });
    }

    const newMessage = {     //cree un objet JavaScript pas encore enregistre en BDD
      senderId,
      text,
      createdAt: new Date(),
    };

    conversation.messages.push(newMessage); // Sous-document ajouté, messages est un tableau on envoie le nouvel element dedans, ex : messages = [{ senderId: "...", text: "...", createdAt: ... } ]
    await conversation.save();   //save() envoie la nouvelle version du document à la BDD

    res.status(201).json(newMessage);   //renvoie le message créé au front
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;    //pour pouvoir faire dans app.js : app.use("/conversations", conversationsRouter); Sinon Express ne connaîtrait pas ces routes