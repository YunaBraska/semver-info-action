"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVersionFile = void 0;
const common_processing_1 = require("./common_processing");
const fs = require('fs');
function processVersionFile(result, workDir, deep) {
    let fileList = (0, common_processing_1.listFiles)(workDir, deep, 'version.txt', [], 0);
    // Sort the file list by path length
    fileList.sort((a, b) => a.toString().length - b.toString().length);
    const firstLineResult = fileList
        .map(file => ({
        filePath: file,
        content: fs.existsSync(file.toString()) ? fs.readFileSync(file, { encoding: 'utf-8' }) : null
    }))
        .filter(({ content }) => content !== null && content.trim().length > 0)
        .map(({ filePath, content }) => ({
        filePath,
        firstLine: content.split(/\r?\n/)[0]
    }))
        .filter(({ firstLine }) => firstLine !== null && firstLine.trim().length > 0)
        .shift() || null;
    let version = firstLineResult !== null ? firstLineResult.firstLine : null;
    result.set('version_txt_path', firstLineResult !== null ? firstLineResult.filePath.toString() : null);
    result.set('version_txt', version);
    return version;
}
exports.processVersionFile = processVersionFile;
