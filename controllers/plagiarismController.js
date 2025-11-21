const PDFDocument = require('pdfkit');
const fs = require('fs');
const PlagiarismCert = require('../models/PlagiarismCert');

exports.generatePlagiarismCert = async (req, res) => {
    const { percentage } = req.query;

    const certId = "PCERT-" + Date.now();
    const filePath = `uploads/plag_certificates/${certId}.pdf`;

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(28).text("Plagiarism Verification Certificate", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`Certificate ID: ${certId}`);
    doc.text(`Plagiarism Score: ${percentage}%`);
    doc.text(`Verification Status: ${percentage < 20 ? "PASS (Original Content)" : "FAIL (High Similarity)"}`);
    doc.end();

    await PlagiarismCert.create({ certId, score: percentage, filePath });

    res.download(filePath);
};
