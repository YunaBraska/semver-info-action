import {PathOrFileDescriptor} from "fs";
import path from "path";
const fs = require('fs');
export type ResultType2 = string | number | boolean | null;

interface FirstLineResult {
    filePath: PathOrFileDescriptor;
    firstLine: string;
}

export function processVersionFile(result: Map<string, ResultType2>, workDir: PathOrFileDescriptor, deep: number): Map<string, ResultType2> {
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
    result.set('version_txt_path', firstLineResult !== null ? firstLineResult.filePath.toString() : null);
    result.set('version_txt', firstLineResult !== null ? firstLineResult.firstLine : null);
    return result;
}

export function listFiles(dir: PathOrFileDescriptor, deep: number, filter: string, resultList: PathOrFileDescriptor[], deep_current: number): PathOrFileDescriptor[] {
    deep_current = deep_current || 0
    resultList = resultList || []
    if (deep > -1 && deep_current > deep) {
        return resultList;
    }
    const files = fs.readdirSync(dir.toString(), {withFileTypes: true});
    for (const file of files) {
        if (file.isDirectory()) {
            listFiles(path.join(dir.toString(), file.name), deep, filter, resultList, deep_current++);
        } else if (!filter || new RegExp(filter).test(file.name)) {
            resultList.push(path.join(dir.toString(), file.name));
        }
    }
    return resultList;
}
