const router = require('express').Router();
const { checkPlagiarismAPI } = require('../controllers/plagiarismAPI');
const { generatePlagiarismCert } = require('../controllers/plagiarismCertificate');
const PlagiarismCert = require('../models/PlagiarismCert');

// Upload page
router.get('/check', (req, res) => res.render('plagiarism-check'));

// API check
router.post('/check', checkPlagiarismAPI);

// Certificate generator
router.get('/certificate', generatePlagiarismCert);

// Verification page
router.get('/verify', (req, res) => res.render('plagiarism-verify'));

// Verification result
router.post('/verify', async (req, res) => {
    const cert = await PlagiarismCert.findOne({ certId: req.body.certId });

    if (!cert) {
        return res.render('plagiarism-verify', { error: "Invalid Certificate" });
    }

    res.render('plagiarism-verify-result', { cert });
});

module.exports = router;
