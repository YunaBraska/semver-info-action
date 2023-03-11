const path = require('path');

const main = require('../src/index');
type ResultTypeTest = string | number | boolean | null;

test('All null parameters', () => {
    let result = main.run(null, null, null, null, null, null, null);
    for (const [key, value] of result) {
        if (!key.startsWith("version_txt")) {
            let actual = value === null || value === false;
            expect(actual).toBe(true);
        }
    }
});


test('test input with [greater, lower, next major, minor, patch, release]', () => {
    let result = main.run(null, '  =v1.2.3-rc.4   ', '  =v5.6.7-rc.8   ', null, null, null, null);
    expect(result.get('original-semver-a')).toEqual('  =v1.2.3-rc.4   ');
    expect(result.get('original-semver-b')).toEqual('  =v5.6.7-rc.8   ');
    expect(result.get('fallBack-semver-a')).toBeNull();
    expect(result.get('fallBack-semver-b')).toBeNull();
    expectAllFields(result);
});

test('test fallback with [greater, lower, next major, minor, patch, release]', () => {
    let result = main.run(null, null, null, '  =v1.2.3-rc.4   ', '  =v5.6.7-rc.8   ', null, null);
    expect(result.get('original-semver-a')).toBeNull();
    expect(result.get('original-semver-b')).toBeNull();
    expect(result.get('fallBack-semver-a')).toBe('  =v1.2.3-rc.4   ');
    expect(result.get('fallBack-semver-b')).toBe('  =v5.6.7-rc.8   ');
    expectAllFields(result);
});

test('test is stable', () => {
    let result = main.run(null, '1.2.3-rc.4', '1.2.3', null, null, null, null);
    expect(result.get('is_stable')).toBeTruthy();
    expect(result.get('is_stable_a')).toBeFalsy();
    expect(result.get('is_stable_b')).toBeTruthy();
    expect(main.run(null, '0.0.1', null, null, null, null, null).get('is_stable')).toBeFalsy();
});

test('test increase', () => {
    let result = main.run(null, '  =v1.2.3-rc.4   ', null, null, '  =v5.6.7-rc.8   ', 'major', 'patch');
    expect(result.get('clean_semver')).toBe('5.6.7');
    expect(result.get('clean_semver_a')).toBe('2.0.0');
    expect(result.get('clean_semver_b')).toBe('5.6.7');
    expect(result.get('next_major_a')).toEqual('3.0.0');
});

test('test increase with null', () => {
    let result = main.run(null, null, null, null, null, 'major', 'patch');
    expect(result.get('clean_semver')).toBe('1.0.0');
    expect(result.get('clean_semver_a')).toBe('1.0.0');
    expect(result.get('clean_semver_b')).toBe('0.0.1');
    expect(result.get('next_major_a')).toEqual('2.0.0');
});

test('test with one semver [greater, lower, next major, minor, patch, release]', () => {
    let result = main.run(null, '1.2.3-rc.4+build.567', null, null, null, null, null);
    expect(result.get('original-semver-a')).toEqual('1.2.3-rc.4+build.567');
    expect(result.get('original-semver-b')).toBeNull();
    expect(result.get('fallBack-semver-a')).toBeNull();
    expect(result.get('fallBack-semver-b')).toBeNull();
    expect(result.get('is_greater_a')).toBeTruthy();
    expect(result.get('is_greater_b')).toBeFalsy();
    expect(result.get('is_smaller_a')).toBeFalsy();
    expect(result.get('is_smaller_b')).toBeTruthy();
    expect(result.get('is_major_change')).toBeFalsy();
    expect(result.get('is_minor_change')).toBeFalsy();
    expect(result.get('is_patch_change')).toBeFalsy();
    expect(result.get('is_rc_change')).toBeFalsy();
    expect(result.get('is_valid_semver')).toBeTruthy();
    expect(result.get('is_valid_semver_a')).toBeTruthy();
    expect(result.get('is_valid_semver_b')).toBeFalsy();
    expect(result.get('is_valid_semver')).toBeTruthy();
    expect(result.get('is_valid_semver_a')).toBeTruthy();
    expect(result.get('is_valid_semver_b')).toBeFalsy();
    expect(result.get('major')).toEqual(1);
    expect(result.get('major_a')).toEqual(1);
    expect(result.get('major_b')).toBeNull();
    expect(result.get('minor')).toEqual(2);
    expect(result.get('minor_a')).toEqual(2);
    expect(result.get('minor_b')).toBeNull();
    expect(result.get('patch')).toEqual(3);
    expect(result.get('patch_a')).toEqual(3);
    expect(result.get('patch_b')).toBeNull();
    expect(result.get('rc')).toEqual(4);
    expect(result.get('rc_a')).toEqual(4);
    expect(result.get('rc_b')).toBeNull();
    expect(result.get('rc_str_a')).toEqual('rc');
    expect(result.get('rc_str_b')).toBeNull();
    expect(result.get('next_major')).toEqual('2.0.0');
    expect(result.get('next_major_a')).toEqual('2.0.0');
    expect(result.get('next_major_b')).toBeNull();
    expect(result.get('next_minor')).toEqual('1.3.0');
    expect(result.get('next_minor_a')).toEqual('1.3.0');
    expect(result.get('next_minor_b')).toBeNull();
    expect(result.get('next_patch')).toEqual('1.2.3');
    expect(result.get('next_patch_a')).toEqual('1.2.3');
    expect(result.get('next_patch_b')).toBeNull();
    expect(result.get('next_rc')).toEqual('1.2.3-rc.5');
    expect(result.get('next_rc_a')).toEqual('1.2.3-rc.5');
    expect(result.get('next_rc_b')).toBeNull();
});

function expectAllFields(result: Map<string, ResultTypeTest>) {
    expect(result.get('clean_semver')).toBe('5.6.7-rc.8');
    expect(result.get('clean_semver_a')).toBe('1.2.3-rc.4');
    expect(result.get('clean_semver_b')).toBe('5.6.7-rc.8');
    expect(result.get('is_greater_a')).toBeFalsy();
    expect(result.get('is_smaller_a')).toBeTruthy();
    expect(result.get('is_greater_b')).toBeTruthy();
    expect(result.get('is_smaller_b')).toBeFalsy();
    expect(result.get('is_major_change')).toBeTruthy();
    expect(result.get('is_minor_change')).toBeFalsy();
    expect(result.get('is_patch_change')).toBeFalsy();
    expect(result.get('is_rc_change')).toBeFalsy();
    expect(result.get('is_valid_semver')).toBeTruthy();
    expect(result.get('is_valid_semver_a')).toBeTruthy();
    expect(result.get('is_valid_semver_b')).toBeTruthy();
    expect(result.get('is_stable')).toBeFalsy();
    expect(result.get('is_stable_a')).toBeFalsy();
    expect(result.get('is_stable_b')).toBeFalsy();
    expect(result.get('major')).toEqual(5);
    expect(result.get('major_a')).toEqual(1);
    expect(result.get('major_b')).toEqual(5);
    expect(result.get('minor')).toEqual(6);
    expect(result.get('minor_a')).toEqual(2);
    expect(result.get('minor_b')).toEqual(6);
    expect(result.get('patch')).toEqual(7);
    expect(result.get('patch_a')).toEqual(3);
    expect(result.get('patch_b')).toEqual(7);
    expect(result.get('rc')).toEqual(8);
    expect(result.get('rc_a')).toEqual(4);
    expect(result.get('rc_b')).toEqual(8);
    expect(result.get('rc_str_a')).toEqual('rc');
    expect(result.get('rc_str_b')).toEqual('rc');
    expect(result.get('next_major')).toEqual('6.0.0');
    expect(result.get('next_major_a')).toEqual('2.0.0');
    expect(result.get('next_major_b')).toEqual('6.0.0');
    expect(result.get('next_minor')).toEqual('5.7.0');
    expect(result.get('next_minor_a')).toEqual('1.3.0');
    expect(result.get('next_minor_b')).toEqual('5.7.0');
    expect(result.get('next_patch')).toEqual('5.6.7');
    expect(result.get('next_patch_a')).toEqual('1.2.3');
    expect(result.get('next_patch_b')).toEqual('5.6.7');
    expect(result.get('next_rc')).toEqual('5.6.7-rc.9');
    expect(result.get('next_rc_a')).toEqual('1.2.3-rc.5');
    expect(result.get('next_rc_b')).toEqual('5.6.7-rc.9');
}

test('Find version from version.txt', () => {
    let result_src = main.run(path.join(__dirname, 'resources/dir_with_version'), null, null, null, null, null, null);
    expect(result_src.get('version_txt')).toEqual("1.2.3");
    expect(result_src.get('version_txt_path')).toContain("test/resources/dir_with_version/version.txt");
});

test('Find no version.txt file', () => {
    let result_src = main.run(path.join(__dirname, 'resources/dir_without_version'), null, null, null, null, null, null);
    expect(result_src.get('version_txt')).toBeNull();
    expect(result_src.get('version_txt_path')).toBeNull();
});

test('Find version with invalid dir should use current dir', () => {
    let result_src = main.run(path.join(__dirname, 'resources/invalidDir'), null, null, null, null, null, null);
    expect(result_src.get('version_txt')).not.toBeNull();
    expect(result_src.get('version_txt_path')).toContain("semver-info-action/version.txt");
});




