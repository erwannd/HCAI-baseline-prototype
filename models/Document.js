const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChunkSchema = new Schema({
    chunkIndex: Number,
    text: String,
    embedding: { type: [Number], default: [] }
})

const DocumentSchema = new Schema({
    filename: String,
    text: String,
    chunks: [ChunkSchema],
    processingStatus: String,
    processedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Document", DocumentSchema);