# Contributing

Have ideas for new features or improvements to existing ones? Want to submit a bug fix or better documentation? If so, we appreciate your help!

Please review this document in order to make the contribution process easy and efficient for everyone involved.

## Submitting a pull request

Good pull requests, such as patches, improvements, and new features, are a fantastic help. They should remain focused in scope and avoid containing unrelated commits. They should also include a *test plan*, i.e. how you verified that your addition is working and complete.

Before submitting a pull request, please *ask first* to verify your addition is in scope and not already planned or in progress. Generally, a related [issue](https://github.com/billyzkid/untitled/issues) should exist with discussions for whatever you propose to submit.

## Setting up a clone for local development

1. Run `git clone https://github.com/billyzkid/untitled.git`
2. Run `npm install` in the root folder

## Cutting a release

1. Tag each merged pull request in the release with a [milestone](https://github.com/billyzkid/untitled/milestones) and then close the milestone
2. Tag each merged pull request in the release with one or more [labels](https://github.com/billyzkid/untitled/labels) starting with `change:` to identify the type of change(s) for the changelog
3. If this is your first release:
  * Ensure you have an authenticated npm user account (i.e. see `npm adduser` or `npm login`)
  * Create a [GitHub personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
  * Create a .env file in the root folder containing the following line: `GITHUB_API_TOKEN=[YOUR TOKEN HERE]`
4. Run `npm run release` and follow the prompts
