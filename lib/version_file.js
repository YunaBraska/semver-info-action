"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFiles = exports.processVersionFile = void 0;
const path_1 = __importDefault(require("path"));
const fs = require('fs');
function processVersionFile(result, workDir, deep) {
    let fileList = listFiles(workDir, deep, 'version.txt', [], 0);
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
    result.set('version_txt_path', firstLineResult !== null ? firstLineResult.filePath.toString() : null);
    result.set('version_txt', firstLineResult !== null ? firstLineResult.firstLine : null);
    return result;
}
exports.processVersionFile = processVersionFile;
function listFiles(dir, deep, filter, resultList, deep_current) {
    deep_current = deep_current || 0;
    resultList = resultList || [];
    if (deep > -1 && deep_current > deep) {
        return resultList;
    }
    const files = fs.readdirSync(dir.toString(), { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            listFiles(path_1.default.join(dir.toString(), file.name), deep, filter, resultList, deep_current++);
        }
        else if (!filter || new RegExp(filter).test(file.name)) {
            resultList.push(path_1.default.join(dir.toString(), file.name));
        }
    }
    return resultList;
}
exports.listFiles = listFiles;
