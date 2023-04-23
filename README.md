# Semver Info Action

Cleans, parses, and compares semantic versions, providing essential insights into versioning, stability, and
compatibility, making software release management a breeze!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=HFHFUT3G6TZF6)

[![Build][build_shield]][build_link]
[![Maintainable][maintainable_shield]][maintainable_link]
[![Coverage][coverage_shield]][coverage_link]
[![Issues][issues_shield]][issues_link]
[![Commit][commit_shield]][commit_link]
[![License][license_shield]][license_link]
[![Tag][tag_shield]][tag_link]
[![Size][size_shield]][size_shield]
![Label][label_shield]
![Label][node_version]

### Features

* update Shields/Badges see [ShieldsDemo](https://github.com/YunaBraska/git-info-action/blob/main/ShieldDemo.md)

## Usage

```yaml
# RUNNER
- name: "Read Semver Info"
  id: "semver_info"
  uses: YunaBraska/semver-info-action@main

  # CONFIGS (Optional)
  with:
    semver-a: 'v1.2.3-rc.4'
    semver-b: 'v5.6.7-rc.8'
    fallBack-semver-a: '0.0.1'
    fallBack-semver-b: '0.0.1'
    increase-a: 'none'
    increase-b: 'none'

  # PRINT
- name: "Print Semver Info"
  run: |
    echo "clean_semver         [${{ steps.semver_info.outputs.clean_semver }}]"
    echo "is_stable            [${{ steps.semver_info.outputs.is_stable }}]"
    echo "is_valid_semver      [${{ steps.semver_info.outputs.is_valid_semver }}]"
    echo "is_major_change      [${{ steps.semver_info.outputs.is_major_change }}]"
    echo "is_a_greater_than_b  [${{ steps.semver_info.outputs.is_greater_a }}]"
    echo "next_major           [${{ steps.semver_info.outputs.next_major }}]"
    echo "next_major_a         [${{ steps.semver_info.outputs.next_major_a }}]"
    echo "next_major_b         [${{ steps.semver_info.outputs.next_major_b }}]"
    echo "next_minor           [${{ steps.semver_info.outputs.next_minor }}]"
    echo "next_patch           [${{ steps.semver_info.outputs.next_patch }}]"
    echo "next_rc              [${{ steps.semver_info.outputs.next_rc }}]"

```

### Inputs

| parameter         | Example     | Default | Description                                                     |
|-------------------|-------------|---------|-----------------------------------------------------------------|
| semver-a          | v1.2.3-rc.4 | null    | Semver A to process                                             |
| semver-b          | v5.6.7-rc.8 | null    | Semver B to process - will be compared against the first semver |
| fallBack-semver-a | 0.0.1       | null    | The fallback version A in case version A is not valid           |
| fallBack-semver-b | 0.0.1       | null    | The fallback version B in case version B is not valid           |
| increase-a        | major       | null    | Increase version A before processing \[major, minor, patch, rc] |
| increase-b        | patch       | null    | Increase version B before processing \[major, minor, patch, rc] |
| null-to-empty     | true        | true    | Replaces null values with empty strings                         |

### Outputs

| Name              | Example              | Default | Description                                                                               |
|-------------------|----------------------|---------|-------------------------------------------------------------------------------------------|
| clean_semver      | 5.6.7-rc.8           | null    | The cleaned and normalized version without any prefix (highest semver wins)               |
| clean_semver_a    | 1.2.3-rc.4           | null    | The cleaned and normalized version A without any prefix                                   |
| clean_semver_b    | 5.6.7-rc.8           | null    | The cleaned and normalized version B without any prefix                                   |
| is_greater_a      | false                | false   | Whether A is greater than B                                                               |
| is_smaller_a      | true                 | false   | Whether A is smaller than B                                                               |
| is_greater_b      | true                 | false   | Whether B is greater than A                                                               |
| is_smaller_b      | false                | false   | Whether B is smaller than A                                                               |
| change_type       | major                | null    | Diff A and B change \[major, minor, patch, rc]                                            |
| is_major_change   | true                 | false   | If diff A and B is a major change                                                         |
| is_minor_change   | false                | false   | If diff A and B is a minor change                                                         |
| is_patch_change   | false                | false   | If diff A and B is a patch change                                                         |
| is_rc_change      | false                | false   | If diff A and B is a rc (release candidate) change                                        |
| is_valid_semver   | true                 | false   | Whether the semver is valid (highest semver wins)                                         |
| is_valid_semver_a | true                 | false   | Whether semver A is valid                                                                 |
| is_valid_semver_b | true                 | false   | Whether semver B is valid                                                                 |
| is_stable         | false                | false   | Whether the version is stable (doesn't contain any pre-release tag) (highest semver wins) |
| is_stable_a       | false                | false   | Whether version A is stable (doesn't contain any pre-release tag)                         |
| is_stable_b       | false                | false   | Whether version B is stable (doesn't contain any pre-release tag)                         |
| major             | 5                    | null    | The major version of provided semver (highest semver wins)                                |
| major_a           | 1                    | null    | The major version of A                                                                    |
| major_b           | 5                    | null    | The major version of B                                                                    |
| minor             | 6                    | null    | The minor version of provided semver (highest semver wins)                                |
| minor_a           | 2                    | null    | The minor version of A                                                                    |
| minor_b           | 6                    | null    | The minor version of B                                                                    |
| patch             | 7                    | null    | The patch version of provided semver (highest semver wins)                                |
| patch_a           | 3                    | null    | The patch version of A                                                                    |
| patch_b           | 7                    | null    | The patch version of B                                                                    |
| rc                | 8                    | null    | The release candidate version of provided semver (highest semver wins)                    |
| rc_a              | 4                    | null    | The release candidate version of A                                                        |
| rc_b              | 8                    | null    | The release candidate version of B                                                        |
| rc_str            | rc                   | null    | The prefix of the release candidate version (highest semver wins)                         |
| rc_str_a          | rc                   | null    | The prefix of the release candidate version of A                                          |
| rc_str_b          | rc                   | null    | The prefix of the release candidate version of B                                          |
| next_major        | 6.0.0                | null    | The next major version of provided semver (highest semver wins)                           |
| next_major_a      | 2.0.0                | null    | The next major version of A                                                               |
| next_major_b      | 6.0.0                | null    | The next major version of B                                                               |
| next_minor        | 6.0.0                | null    | The next minor version of provided semver (highest semver wins)                           |
| next_minor_a      | 2.0.0                | null    | The next minor version of A                                                               |
| next_minor_b      | 6.0.0                | null    | The next minor version of B                                                               |
| next_patch        | 6.0.0                | null    | The next patch version of provided semver (highest semver wins)                           |
| next_patch_a      | 2.0.0                | null    | The next patch version of A                                                               |
| next_patch_b      | 6.0.0                | null    | The next patch version of B                                                               |
| next_rc           | 6.0.0                | null    | The next rc version of provided semver (highest semver wins)                              |
| next_rc_a         | 2.0.0                | null    | The next rc version of A                                                                  |
| next_rc_b         | 6.0.0                | null    | The next rc version of B                                                                  |
| original-semver-a | v1.2.3-rc.4          | null    | Semver A to process                                                                       |
| original-semver-b | v5.6.7-rc.8          | null    | Semver B to process - will be compared with first semver                                  |
| fallBack-semver-a | 0.0.1                | null    | The fallback version A in case the original version A is not valid                        |
| fallBack-semver-b | 0.0.1                | null    | The fallback version B in case the original version B is not valid                        |
| version_txt       | 1.2.3                | null    | semver from version file                                                                  |
| version_txt_path  | /project/version.txt | null    | path of version file                                                                      |

### \[DEV] Setup Environment

* clean environment: `./clean_node.sh`
* Build: `npm run build` to "compile" `index.ts` to `./lib/index.js`
* Test: `npm run test`
* NodeJs 16: do not upgrade nodeJs as GitHub actions latest version is 16
* Hint: please do not remove the node modules as they are required for custom GitHub actions :(

[build_shield]: https://github.com/YunaBraska/semver-info-action/workflows/RELEASE/badge.svg

[build_link]: https://github.com/YunaBraska/semver-info-action/actions/workflows/publish.yml/badge.svg

[maintainable_shield]: https://img.shields.io/codeclimate/maintainability/YunaBraska/semver-info-action?style=flat-square

[maintainable_link]: https://codeclimate.com/github/YunaBraska/semver-info-action/maintainability

[coverage_shield]: https://img.shields.io/codeclimate/coverage/YunaBraska/semver-info-action?style=flat-square

[coverage_link]: https://codeclimate.com/github/YunaBraska/semver-info-action/test_coverage

[issues_shield]: https://img.shields.io/github/issues/YunaBraska/semver-info-action?style=flat-square

[issues_link]: https://github.com/YunaBraska/semver-info-action/commits/main

[commit_shield]: https://img.shields.io/github/last-commit/YunaBraska/semver-info-action?style=flat-square

[commit_link]: https://github.com/YunaBraska/semver-info-action/issues

[license_shield]: https://img.shields.io/github/license/YunaBraska/semver-info-action?style=flat-square

[license_link]: https://github.com/YunaBraska/semver-info-action/blob/main/LICENSE

[tag_shield]: https://img.shields.io/github/v/tag/YunaBraska/semver-info-action?style=flat-square

[tag_link]: https://github.com/YunaBraska/semver-info-action/releases

[size_shield]: https://img.shields.io/github/repo-size/YunaBraska/semver-info-action?style=flat-square

[label_shield]: https://img.shields.io/badge/Yuna-QueenInside-blueviolet?style=flat-square

[gitter_shield]: https://img.shields.io/gitter/room/YunaBraska/semver-info-action?style=flat-square

[gitter_link]: https://gitter.im/semver-info-action/Lobby

[node_version]: https://img.shields.io/badge/node-16-blueviolet?style=flat-square
