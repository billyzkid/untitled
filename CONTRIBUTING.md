# Contributing to Untitled

Have an idea for a new feature or an improvement to an existing one? Want to submit a bug fix? Thanks for your help!

Please review this document in order to make the contribution process easy and efficient for everyone involved.

## Submitting a pull request

Good pull requests, such as patches, improvements, and new features, are a fantastic help. They should remain focused in scope and avoid containing unrelated commits. They should also include a *test plan*, i.e. how you verified that your addition is working and complete.

Before submitting a pull request, please *ask first* to verify your addition is in scope and not already planned or in progress by others. Generally, a related issue should exist with discussions for whatever you are proposing to submit.

## Setting up a clone for local development

1. Run `git clone https://github.com/billyzkid/untitled.git`
2. Run `npm install` in the root folder

## Cutting a release

1. Tag each merged pull request in the release with the relevant [milestone](https://github.com/billyzkid/untitled/milestones) and then close the milestone
2. Tag each merged pull request in the release with one or more [labels](https://github.com/billyzkid/untitled/labels) starting with `change:` to indicate the change(s) included in the PR
3. Update the changelog:
  * Create a [GitHub personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
  * Create a .env file in the root folder containing the following line: `GITHUB_API_TOKEN=[YOUR TOKEN]`
  * Run `npm run changelog` to update CHANGELOG.md with information about each merged commit in the release
  * Open CHANGELOG.md and update the placeholders for release title, date, and description
  * Verify the changes to CHANGELOG.md, commit, and then push to the remote repository
4. Create a new [release](https://github.com/billyzkid/untitled/releases/new) with the same title and description used above
5. Run `npm run publish`