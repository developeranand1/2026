const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/training.controller");

// Image upload for trainings
router.post("/upload-image", trainingController.uploadTrainingImage);

// Demo seed endpoint
router.post("/seed", trainingController.seedTrainings);

// Stats & categorized lists
router.get("/stats", trainingController.getTrainingStats);
router.get("/upcoming", trainingController.getUpcomingTrainings);
router.get("/completed", trainingController.getCompletedTrainings);

// Standard CRUD
router.get("/", trainingController.getAllTrainings);
router.get("/:id", trainingController.getTrainingByIdOrSlug);
router.post("/", trainingController.createTraining);
router.put("/:id", trainingController.updateTraining);
router.delete("/:id", trainingController.deleteTraining);

// Registration & Participant management
router.post("/:id/register", trainingController.registerFarmerForTraining);
router.post("/:id/participants", trainingController.addParticipantByAdmin);
router.delete("/:id/participants/:participantId", trainingController.deleteParticipant);

module.exports = router;
