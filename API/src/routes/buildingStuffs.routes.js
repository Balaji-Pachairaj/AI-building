const express = require('express');
const router = express.Router();
const {
  getBuildingStuffs,
  getBuildingStuffById,
  createBuildingStuff,
  hitBuildingStuff,
} = require('../controllers/buildingStuffs.controller');

// GET all building stuffs & POST new building stuff
router.route('/')
  .get(getBuildingStuffs)
  .post(createBuildingStuff);

// POST hit on building stuffs (saves hit time & hit body to MongoDB Log)
router.post('/hit', hitBuildingStuff);

// GET single building stuff by ID
router.get('/:id', getBuildingStuffById);

module.exports = router;
