//https://github.com/actions/toolkit/tree/main/packages/
const S_MAJOR_1 = 'major';
const S_MAJOR_2 = 'premajor';
const S_MINOR_1 = 'minor';
const S_MINOR_2 = 'preminor';
const S_PATCH_1 = 'patch';
const S_PATCH_2 = 'prpatch';
const S_RC_1 = 'rc';
const S_RC_2 = 'prerelease';

const semver = require('semver')
const core = require('@actions/core');
type ResultType = string | number | boolean | null;

try {
    let semverA = core.getInput('semver-a') || null;
    let semverB = core.getInput('semver-b') || null;
    let fallBackSemverA = core.getInput('fallback-semver-a') || null;
    let fallBackSemverB = core.getInput('fallback-semver-b') || null;
    let increaseA = core.getInput('increase-a') || null;
    let increaseB = core.getInput('increase-b') || null;


    let result = run(semverA, semverB, fallBackSemverA, fallBackSemverB, increaseA, increaseB);

    console.log(JSON.stringify(Object.fromEntries(result), null, 4))

    result.forEach((value, key) => {
        core.setOutput(key, value);
    })
} catch (e) {
    if (typeof e === "string") {
        core.setFailed(e.toUpperCase());
    } else if (e instanceof Error) {
        core.setFailed(e.message);
    }
}

function run(orgSemverA: string, orgSemverB: string, fallBackSemverA: string, fallBackSemverB: string, increaseA: string, increaseB: string): Map<string, ResultType> {
    //DEFAULTS
    let result = new Map<string, ResultType>();
    let semverA = increaseVersion(orgSemverA || fallBackSemverA !== null ? semver.clean(orgSemverA || fallBackSemverA) : null, increaseA);
    let semverB = increaseVersion(orgSemverB || fallBackSemverB !== null ? semver.clean(orgSemverB || fallBackSemverB) : null, increaseB);

    result.set('original-semver-a', orgSemverA);
    result.set('original-semver-b', orgSemverB);
    result.set('fallBack-semver-a', fallBackSemverA);
    result.set('fallBack-semver-b', fallBackSemverB);

    //COMMONS
    let semverMap = new Map<string, (string | null)[]>();
    semverMap.set('a', [semverA, semverB])
    semverMap.set('b', [semverB, semverA])
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
    return sortMap(result);
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
    result.set(`is_${S_MAJOR_1}_change`, diff === S_MAJOR_1 || diff === S_MAJOR_2)
    result.set(`is_${S_MINOR_1}_change`, diff === S_MINOR_1 || diff === S_MINOR_2)
    result.set(`is_${S_PATCH_1}_change`, diff === S_PATCH_1 || diff === S_PATCH_2)
    result.set(`is_${S_RC_1}_change`, diff === S_RC_1 || diff === S_RC_2)
    calcDefaults(result, '', (isValidA || isValidB ? versionBig : ''), isValidA || isValidB);
}

function sortMap(input: Map<string, any>): Map<string, any> {
    const sortedEntries = Array.from(input.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return new Map(sortedEntries);
}

function isEmpty(input: string | null | undefined): boolean {
    return !input || input.trim().length === 0;

}

module.exports = {run};
