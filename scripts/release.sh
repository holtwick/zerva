#!/bin/bash

set -e

VERSION="release/$(npx -c 'echo "$npm_package_version"')"

echo "Git flow like release of $VERSION"

export GIT_MERGE_AUTOEDIT=no
git flow release start $VERSION 
git flow release finish -m 'Release' $VERSION
unset GIT_MERGE_AUTOEDIT

git checkout develop
git remote | xargs -L1 git push --all

# # https://gist.github.com/JamesMGreene/cdd0ac49f90c987e45ac#create-a-release-branch
# git checkout -b release/$VERSION develop

# # https://gist.github.com/JamesMGreene/cdd0ac49f90c987e45ac#finalize-a-release-branch
# git checkout main
# git merge --no-ff release/$VERSION
# git tag -a $VERSION
# git checkout develop
# git merge --no-ff release/$VERSION
# git branch -d release/$VERSION

# git remote | xargs -L1 git push --all