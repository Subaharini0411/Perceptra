/**
 * PERCEPTA - Benchmark API Routes
 */

const express = require('express');
const router = express.Router();
const benchmarkRunner = require('../../benchmark/BenchmarkRunner');

router.get('/results', (req, res) => {
  res.json(benchmarkRunner.getBaseline());
});

router.post('/run', async (req, res) => {
  try {
    const results = await benchmarkRunner.runLiveBenchmark();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
