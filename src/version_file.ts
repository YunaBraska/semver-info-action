import {PathOrFileDescriptor} from "fs";
import {listFiles} from "./common_processing";

const fs = require('fs');
export type ResultType2 = string | number | boolean | null;

interface FirstLineResult {
    filePath: PathOrFileDescriptor;
    firstLine: string;
}

export function processVersionFile(result: Map<string, ResultType2>, workDir: PathOrFileDescriptor, deep: number): string | null {
    let fileList = listFiles(workDir, deep, 'version.txt', [], 0);
    // Sort the file list by path length
    fileList.sort((a, b) => a.toString().length - b.toString().length);
    const firstLineResult: FirstLineResult | null = fileList
        .map(file => ({
            filePath: file,
            content: fs.existsSync(file.toString()) ? fs.readFileSync(file, {encoding: 'utf-8'}) : null
        }))
        .filter(({content}) => content !== null && content.trim().length > 0)
        .map(({filePath, content}) => ({
            filePath,
            firstLine: content.split(/\r?\n/)[0]
        }))
        .filter(({firstLine}) => firstLine !== null && firstLine.trim().length > 0)
        .shift() || null;
    let version = firstLineResult !== null ? firstLineResult.firstLine : null;
    result.set('version_txt_path', firstLineResult !== null ? firstLineResult.filePath.toString() : null);
    result.set('version_txt', version);
    return version;
}
