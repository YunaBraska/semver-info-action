//https://github.com/actions/toolkit/tree/main/packages/
import {processVersionFile} from "./version_file";
import fs, {PathOrFileDescriptor} from "fs";
import {updateBadges} from "./badges_shield_updater";
import {replaceNullWithEmptyMap} from "./common_processing";

const S_MAJOR_1 = 'major';
const S_MAJOR_2 = 'premajor';
const S_MINOR_1 = 'minor';
const S_MINOR_2 = 'preminor';
const S_PATCH_1 = 'patch';
const S_PATCH_2 = 'prepatch';
const S_RC_1 = 'rc';
const S_RC_2 = 'prerelease';

const semver = require('semver');
const core = require('@actions/core');
type ResultType = string | number | boolean | null;

try {
    let workDir = core.getInput('work-dir') || null;
    let semverA = core.getInput('semver-a') || null;
    let semverB = core.getInput('semver-b') || null;
    let fallBackSemverA = core.getInput('fallback-semver-a') || null;
    let fallBackSemverB = core.getInput('fallback-semver-b') || null;
    let increaseA = core.getInput('increase-a') || null;
    let increaseB = core.getInput('increase-b') || null;
    let nullToEmpty = core.getInput('null-to-empty') || null;
    let useVersionTxt = core.getInput('use-version-txt') || null;

    let result = run(
        workDir,
        semverA,
        semverB,
        fallBackSemverA,
        fallBackSemverB,
        increaseA,
        increaseB,
        !isEmpty(nullToEmpty) ? nullToEmpty.toLowerCase() === 'true' : true,
        !isEmpty(useVersionTxt) ? useVersionTxt.toLowerCase() === 'true' : false,
    );

    console.log(JSON.stringify(Object.fromEntries(result), null, 4));

    result.forEach((value, key) => {
        core.setOutput(key, value);
    });
} catch (e) {
    if (typeof e === "string") {
        core.setFailed(e.toUpperCase());
    } else if (e instanceof Error) {
        core.setFailed(e.message);
    }
}

function run(
    workDir: PathOrFileDescriptor,
    orgSemverA: string,
    orgSemverB: string,
    fallBackSemverA: string,
    fallBackSemverB: string,
    increaseA: string,
    increaseB: string,
    nullToEmpty: boolean,
    useVersionTxt: boolean
): Map<string, ResultType> {
    //DEFAULTS
    if (!workDir || workDir === "." || !fs.existsSync(workDir.toString())) {
        workDir = getWorkingDirectory(process.env['GITHUB_WORKSPACE']?.toString() || null);
    }
    let result = new Map<string, ResultType>();
    let versionTxt = processVersionFile(result, workDir, 10);
    orgSemverB = useVersionTxt && !isEmpty(semver.valid(versionTxt)) ? versionTxt! : orgSemverB;
    let semverA = increaseVersion(orgSemverA || fallBackSemverA !== null ? semver.clean(orgSemverA || fallBackSemverA) : null, increaseA);
    let semverB = increaseVersion(orgSemverB || fallBackSemverB !== null ? semver.clean(orgSemverB || fallBackSemverB) : null, increaseB);

    result.set('original-semver-a', orgSemverA);
    result.set('original-semver-b', orgSemverB);
    result.set('fallBack-semver-a', fallBackSemverA);
    result.set('fallBack-semver-b', fallBackSemverB);
    result.set('null-to-empty', nullToEmpty);

    //COMMONS
    let semverMap = new Map<string, (string | null)[]>();
    semverMap.set('a', [semverA, semverB]);
    semverMap.set('b', [semverB, semverA]);
    for (const [key, versions] of semverMap) {
        let version = versions[0];
        let version_b = versions[1];
        let isValid = (!isEmpty(semver.valid(version)));
        let isValid_b = (!isEmpty(semver.valid(version_b)));
        calcDefaults(result, `_${key}`, version, isValid);
        result.set(`is_greater_${key}`, (isValid && !isValid_b) || (isValid && isValid_b && semver.gt(version, version_b)));
        result.set(`is_smaller_${key}`, (isValid_b && !isValid) || (isValid && isValid_b && semver.lt(version, version_b)));
    }

    //DIFF
    calcDiffs(result, semverA, semverB);
    updateBadges(result, workDir, -1);
    return sortMap(nullToEmpty ? replaceNullWithEmptyMap(result) : result);
}

function increaseVersion(version: string | null, strategy: string | null) {
    if (strategy === null) {
        return version;
    }
    let ver = version === null ? '0.0.0' : version;
    switch (strategy) {
        case S_MAJOR_1:
        case S_MAJOR_2:
            ver = semver.inc(ver, S_MAJOR_1);
            break;
        case S_MINOR_1:
        case S_MINOR_2:
            ver = semver.inc(ver, S_MINOR_1);
            break;
        case S_PATCH_1:
        case S_PATCH_2:
            ver = semver.inc(ver, S_PATCH_1);
            break;
        case S_RC_1:
        case S_RC_2:
            ver = semver.inc(ver, S_RC_2, S_RC_1);
            break;
        default:
            return version;
    }
    return ver;
}

function calcDefaults(result: Map<string, ResultType>, key: string, version: string | null, isValid: boolean) {
    result.set(`clean_semver${key}`, isValid ? version : null);
    result.set(`is_valid_semver${key}`, isValid);
    result.set(`is_stable${key}`, (isValid && semver.major(version) > 0 && !version?.includes('-') && !version?.includes('+')));
    result.set(`next_${S_MAJOR_1}${key}`, isValid ? semver.inc(version, S_MAJOR_1) : null);
    result.set(`next_${S_MINOR_1}${key}`, isValid ? semver.inc(version, S_MINOR_1) : null);
    result.set(`next_${S_PATCH_1}${key}`, isValid ? semver.inc(version, S_PATCH_1) : null);
    result.set(`next_${S_RC_1}${key}`, isValid ? semver.inc(version, S_RC_2, S_RC_1) : null);
    result.set(`${S_MAJOR_1}${key}`, isValid ? semver.major(version) : null);
    result.set(`${S_MINOR_1}${key}`, isValid ? semver.minor(version) : null);
    result.set(`${S_PATCH_1}${key}`, isValid ? semver.patch(version) : null);
    result.set(`${S_RC_1}${key}`, isValid ? semver.prerelease(version)?.filter((item: number | string) => typeof item === 'number').shift() || null : null);
    result.set(`${S_RC_1}_str${key}`, isValid ? semver.prerelease(version)?.filter((item: number | string) => typeof item !== 'number').shift() || null : null);
}

function calcDiffs(result: Map<string, ResultType>, semverA: string | null, semverB: string | null) {
    let isValidA = result.get('is_valid_semver_a')?.toString() === 'true' || false;
    let isValidB = result.get('is_valid_semver_b')?.toString() === 'true' || false;
    let validA = isValidA ? semverA : '0.0.0'
    let validB = isValidB ? semverB : '0.0.0'
    let versionBig = semver.gt(validA, validB) ? validA : validB;
    let versionLowPre = semver.lt(validA, validB) ? validA : validB;
    let versionLow = (!isValidA || !isValidB ? versionBig : versionLowPre);
    let diff = semver.diff(versionBig, versionLow);
    result.set(`is_${S_MAJOR_1}_change`, diff === S_MAJOR_1 || diff === S_MAJOR_2);
    result.set(`is_${S_MINOR_1}_change`, diff === S_MINOR_1 || diff === S_MINOR_2);
    result.set(`is_${S_PATCH_1}_change`, diff === S_PATCH_1 || diff === S_PATCH_2);
    result.set(`is_${S_RC_1}_change`, diff === S_RC_1 || diff === S_RC_2);
    addChangeType(result, diff);
    calcDefaults(result, '', (isValidA || isValidB ? versionBig : ''), isValidA || isValidB);
}

function addChangeType(result: Map<string, ResultType>, diff: any) {
    if (diff === S_MAJOR_1 || diff === S_MAJOR_2) {
        result.set(`change_type`, S_MAJOR_1)
    } else if (diff === S_MINOR_1 || diff === S_MINOR_2) {
        result.set(`change_type`, S_MINOR_1)
    } else if (diff === S_PATCH_1 || diff === S_PATCH_2) {
        result.set(`change_type`, S_PATCH_1)
    } else if (diff === S_RC_1 || diff === S_RC_2) {
        result.set(`change_type`, S_RC_1)
    } else {
        result.set(`change_type`, null)
    }
}


function sortMap(input: Map<string, any>): Map<string, any> {
    const sortedEntries = Array.from(input.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return new Map(sortedEntries);
}

function isEmpty(input: string | null | undefined): boolean {
    return !input || input.trim().length === 0;
}

function getWorkingDirectory(workspace: string | undefined | null): PathOrFileDescriptor {
    return workspace && fs.existsSync(workspace) ? workspace : process.cwd();
}

module.exports = {run};
